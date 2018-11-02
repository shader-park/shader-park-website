import firebase from 'firebase/app';
import * as THREE from 'three';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);


export const store = new Vuex.Store({

  state: {
    user: null,
    scene: new THREE.Scene(),
    socket: null,
    currentRoom: null,
    selectedSculpture: null,  // vue sculpture data
    selectedObject: null,     // three.js mesh
    objectsToUpdate: [],
    objectsToRaycast: [],
    intersectedObject: null,
    currentSculptures: [],
    loading: false,
    sculpturesLoaded: false,
    profileBadgeCount: 0,
    embedded: false,
    canvasSize: {width: 0, height: 0},
    displayLogin: false,
    routeTitle: null
  },
  getters: {
    routeTitle: state => {
      return state.routeTitle;
    },
    displayLogin: state => {
      return state.displayLogin;
    },
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
    },
    getProfileBadgeCount: state => {
      return state.profileBadgeCount;
    },
    getEmbedded: state => {
      return state.embedded;
    }
  },
  mutations: {
    setRouteTitle(state,title) {
      state.routeTitle = title;
    },
    displayLogin(state, payload) {
      state.displayLogin = payload;
    },
    setCanvasSize(state, size) {
      state.canvasSize = size;
    },
    setUser: state => {
      state.user = firebase.auth().currentUser;
    },
    setEmbedded(state, embedded) {
      state.embedded = embedded;
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
    incrementProfileBadgeCount(state) {
      state.profileBadgeCount += 1;
    },
    setProfileBadgeCount(state, payload) {
      state.profileBadgeCount = payload;
    },
    sculpturesLoaded(state, payload) {
      state.sculpturesLoaded = payload;
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
      // state.socket.emit('joinRoom', roomName);
      state.currentRoom = roomName;
    },
    leaveRoom(state, roomName) {
      // state.socket.emit('leaveRoom', roomName);
      state.currentRoom = null;
    }
  },
  actions: {
    setUser: context => {
      context.commit('setUser');
    },
    getAllUserNames() {
      return firebase.database().ref(`usernames`).once('value')
        .then(data => data.val());
    },
    getUserIdFromUsername(context, username) {
      return firebase.database().ref(`usernames/${username}`).once('value')
        .then(data => data.val());
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
          commit('incrementProfileBadgeCount');
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
    deleteSculpture({commit, getters}, sculpture) {
      commit('setLoading', true);
      const user = getters.getUser;
      if (sculpture.author && sculpture.author.uid == user.uid) {
        let route = sculpture.isExample && getters.isAdmin ? 'examples' : 'sculptures'; //must be admin to update example
        firebase.database().ref(`${route}/${user.uid}/${sculpture.id}`).delete().catch(error => console.error(error));

        firebase.database().ref(`users/${user.uid}/sculptures/${sculpture.id}`).delete().then(() => {
          commit('setLoading', false);
        }).catch(error => console.error(error));
          
      } else {
        console.error('Tried to delete another user\'s sculpture');
      }
    },
    fetchUserSculptures({commit, getters}, uid) {
      commit('setLoading', true);
      const userId = uid || getters.getUser.uid;
      
      let route = 'sculptures';
      if(getters.isAdmin) {
        route = 'examples';
      }
      return firebase.database().ref(`${route}/${userId}`).once('value').then(data => {
        commit('setLoading', false);
        return data.val();
      })
      .catch(error => console.log(error));
    },
    fetchSculpture({commit, getters}, payload) {
      if (!payload.id) {
        console.error('No id passed to fetch sculpture');
        return;
      }
      commit('setLoading', true);
      const reference = payload.example ? 'examples/': 'sculptures/';
      return firebase.database().ref(`${reference}`).orderByChild(payload.id).limitToLast(1).once('value')
        .then(data => {
          commit('setLoading', true);
          //ends up getting the user's entire profile
          const userSculpts =  data.val();
          const keys = Object.keys(userSculpts);
          if (userSculpts && keys.length > 0) {
            return userSculpts[keys[0]][payload.id];
          }
          return null;
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