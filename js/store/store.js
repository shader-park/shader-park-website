import Vue from 'vue';
import Vuex from 'vuex';
import firebase from 'firebase';
import * as THREE from 'three';

Vue.use(Vuex);


export const store = new Vuex.Store({

  state: {
    user: null,
    scene: new THREE.Scene(),
    socket: null,
    currentRoom: null,
    selectedSculpture: null,
    objectsToUpdate: [],
    objectsToRaycast: [],
    selectedObject: null,
    intersectedObject: null,
    currentSculptures: [],
    loading: false
  },
  getters: {
    getUser: state => {
      return state.user;
    },
    selectedSculpture: state => {
      return state.selectedSculpture;
    },
    getCurrentSculptures: state => {
      return state.currentSculptures;
    },
    isAdmin: state => {
      return state.user && state.user.uid === 'K3lAQQTKbiTiVXlwRZouH4OrWyv1';
    }
  },
  mutations: {
    setUser: state => {
      state.user = firebase.auth().currentUser;
    },
    setSelectedSculpture(state, sculpture) {
      state.selectedSculpture = sculpture;
    },
    setCurrentSculptures(state, payload) {
      state.currentSculptures = payload;
    },
    setLoading(state, payload) {
      state.loading = payload;
    },
    updateSelectedSculpture(state, payload) {
      state.selectedSculpture = Object.assign(state.selectedSculpture, payload);
    },
    updateSculptureIdInScene(state, payload) {
      const oldId = payload.oldId;
      const newId = payload.newId;
      const obj = state.scene.getObjectByName(oldId);
      if(obj) {
        obj.name = newId;
      } else {
        console.error('no object found when updating sculpture ID ');
      }
      state.selectedSculpture.id = newId;
    },
    removeObjectFromUpdate(state, payload) {
      const index = state.objectsToUpdate.indexOf(payload);
      if (index != -1) {
        state.objectsToUpdate.splice(index, 1);
      }
    },
    removeObjectFromRaycast(state, payload) {
      const index = state.objectsToRaycast.indexOf(payload);
      if (index != -1) {
        state.objectsToRaycast.splice(index, 1);
      }
    },
    removeObjectFromSceneByName(state, name) {
      state.scene.remove(state.scene.getObjectByName(name));
    },
    joinRoom(state, roomName) {
      state.socket.emit('joinRoom', roomName);
      state.currentRoom = roomName;
    },
    leaveRoom(state, roomName) {
      state.socket.emit('leaveRoom', roomName);
      state.currentRoom = null;
    }
  },
  actions: {
    setUser: context => {
      context.commit('setUser');
    },
    getUserName({getters}) {
      const user = getters.getUser;
      return firebase.database().ref(`users/${user.uid}`).once('value')
        .then(data => data.val().username);
    },
    setDBUser(context, payload) {
      let uid = payload.uid;
      let dbUser = payload.user;
      firebase.database().ref('users/' + uid).set(dbUser);
      firebase.database().ref('usernames/' + dbUser.username).set(uid);
    },
    saveNewSculpture({commit, getters}, sculpture) {
      const user = getters.getUser;
      sculpture.author = { uid: user.uid, username: user.displayName };
      sculpture.timestamp = Date.now();
      const idHistory = {
        oldId: sculpture.id || sculpture.vueId,
        newId: ''
      };
      
      const sculpID = firebase.database().ref(`sculptures/${user.uid}`).push().key;
      sculpture.id = sculpID;
      let route = sculpture.isExample && getters.isAdmin  ? 'examples' : 'sculptures';
      firebase.database().ref(`${route}/${user.uid}/${sculpID}`).update(sculpture)
        .catch(error => console.error(error));

      //update list of sculptures in user's profile
      firebase.database().ref(`users/${user.uid}/sculptures`).child(sculpID).set(sculpID)
        .catch(error => console.error(error));

      idHistory.newId = sculpID;
      commit('updateSelectedSculpture', sculpture);
      commit('updateSculptureIdInScene', idHistory);
      commit('setLoading', false);
      return sculpID;
    },
    saveSculpture({commit, dispatch, getters}, sculptureObj) {
      commit('setLoading', true);
      let sculpture = Object.assign({}, sculptureObj);
      delete sculpture.sculpture; //remove the three.js 3d object
      
      console.log('saving sculpture');
      const user = getters.getUser;
      if(!user) {
        console.error('Tried to Save Sculpture when a User is not logged in');
        return;
      }

      if (!sculpture.id) {
        dispatch('saveNewSculpture', sculpture);
      } else {
        if (sculpture.author.uid === user.uid) {  // update existing sculpture
          let route = sculpture.isExample && getters.isAdmin ? 'examples' : 'sculptures'; //must be admin to update example
          firebase.database().ref(`${route}/${user.uid}/${sculpture.id}`).update(sculpture).then(() => {
            commit('setLoading', false);
          });
        } else {  // Save as a fork
          console.log('save as fork');
          const newForkCount = sculpture.forks += 1;
          //update existing sculpture fork count
          let route = sculpture.isExample? 'examples' : 'sculptures'; //they don't have to be an admin to fork
          firebase.database().ref(`${route}/${sculpture.author.uid}/${sculpture.id}/forks`).set(newForkCount);
          sculpture.isExample = false;//fork isn't an example
          sculpture.forks = 0;
          sculpture.author = {uid: user.uid, username: user.displayName}; //new author
          sculpture.fork = sculpture.id; //save the id of the original sculpture 
          
          const fork = {
            author: sculpture.author,
            timestamp: Date.now(),
            shaderSourceHistory: sculpture.shaderSource,
          }

          const originalSculptureId = sculpture.id
          dispatch('saveNewSculpture', sculpture).then(newId => {
            fork['newSculptureId'] = newId;
            firebase.database().ref(`forks/${originalSculptureId}`).push(fork).then(() => {
              commit('setLoading', false);
            });
          })
        }
      }
    },
    fetchUserSculptures({commit, getters}) {
      commit('setLoading', true);
      const user = getters.getUser;
      let route = 'sculptures';
      if(getters.isAdmin) {
        route = 'examples';
      }
      return firebase.database().ref(`${route}/${user.uid}`).once('value').then(data => {
            commit('setLoading', false);
            return data.val();
          })
          .catch(error => console.log(error));
    },
    fetchSculptures({commit, getters}, reference) {
      commit('setLoading', true);
      const user = getters.getUser;
      return firebase.database().ref(reference).once('value').then(data => {
          const sculptures = data.val();
          let output = [];
          Object.keys(sculptures)
            .forEach(key => {
              Object.keys(sculptures[key]).forEach(sculptureKey => {
                const sculpture = sculptures[key][sculptureKey];
                output.push(sculpture);
              })
            });
          commit('setLoading', false);
          return output;
        })
        .catch(error => console.log(error));
    },
    fetchAllSculptures({dispatch}) {
      return dispatch('fetchSculptures', 'sculptures');
    },
    fetchExampleSculptures({dispatch}) {
      return dispatch('fetchSculptures', 'examples');
    }
  }
});