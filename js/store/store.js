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
      return state.user &&
             (state.user.uid === '9FchFuDdR1aDFOru4l1YSKyTjhV2' ||
             state.user.uid === 'K3lAQQTKbiTiVXlwRZouH4OrWyv1');
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
    saveNewSculpture({getters}, sculpture) {
      const user = getters.getUser;
      const sculpID = firebase.database().ref(`sculptures/${user.uid}`).push().key;
      sculpture.id = sculpID;
      if(sculpture.isExample) {
        firebase.database().ref(`examples/${user.uid}/${sculpID}`).update(sculpture)
          .catch(error => console.log(error));
      } else {
        firebase.database().ref(`sculptures/${user.uid}/${sculpID}`).update(sculpture)
          .catch(error => console.log(error));
      }

      firebase.database().ref(`users/${user.uid}/sculptures`).child(sculpID).set(sculpID)
        .catch(error => console.log(error));
      return sculpID;
    },
    saveSculpture({commit, dispatch, getters}, sculptureObj) {
      commit('setLoading', true);
      let sculpture = Object.assign({}, sculptureObj);
      delete sculpture.sculpture;
      // firebase.database().ref('sculptures').child(sculpture.id).update(sculpture);
      console.log('saving sculpture');
      const user = getters.getUser;

      // date.toISOString();

      if (sculpture.id) {
        if (sculpture.author.uid === user.uid) {  // update existing sculpture
          if(sculpture.isExample) {
            firebase.database().ref(`examples/${user.uid}/${sculpture.id}`).update(sculpture).then(() => {
              commit('setLoading', false);
            })
          } else {
            firebase.database().ref(`sculptures/${user.uid}/${sculpture.id}`).update(sculpture).then(() => {
              commit('setLoading', false);
            })
          }

          // TODO: save to vuex state
        } else {  // Save as a fork
          dispatch('getUserName').then(username => {
            sculpture.author = { uid: user.uid, username: username };
            sculpture.forks += 1;
            //update existing sculpture fork count
            firebase.database().ref(`sculptures/${user.uid}/${sculpture.id}`).update(sculpture);
            sculpture.fork = sculpture.id;

            // "forks" : [{
            //   "id": null,
            //   "sketch-id": null,
            //   "timestamp": null,
            //   "uid": null
            // }],
            dispatch('saveNewSculpture', sculpture).then(newId => {
              // firebase.database().ref('forks/' + dbUser.username).set(uid);
            })
          })
          console.log('save as fork');
        }
      } else {  // sculpture has never been saved before
        
        dispatch('getUserName').then(username => {
            sculpture.author = {uid: user.uid, username: username};
            sculpture.timestamp = Date.now();
            const idHistory = {
              oldId: sculpture.vueId,
              newId: ''
            };
            // const sculpID = firebase.database().ref(`sculptures/${user.uid}`).push().key;
            // sculpture.id = sculpID;
            // idHistory.newId = sculpID;

            // firebase.database().ref(`sculptures/${user.uid}/${sculpID}`).update(sculpture)
            //   .catch(error => console.log(error));

            // firebase.database().ref(`users/${user.uid}/sculptures`).child(sculpID).set(sculpID)
            //   .catch(error => console.log(error));
            // console.log(sculpture)
            dispatch('saveNewSculpture', sculpture).then(newId => {
              idHistory.newId = newId;
              commit('updateSelectedSculpture', sculpture);
              commit('updateSculptureIdInScene', idHistory);
              commit('setLoading', false);
            });
          });
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