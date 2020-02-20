import firebase from 'firebase/app';

import {Scene} from 'three';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({

  state: {
    user: null,
    scene: new Scene(),
    socket: null,
    clickEnabled: true,
    currentRoom: null,
    initialCameraPose: null,
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
    displaySignUp: false,
    displayCanvas: false,
    routeTitle: null,
    unsavedChanges: {},
    MSDFTexture: {}
  },
  getters: {
    displayCanvas: state => {
      return state.displayCanvas;
    },
    getMSDFTexture: state => {
      console.log('getting msdf texture', state.MSDFTexture);
      return state.MSDFTexture;
    },
    unsavedChanges: state => {
      return state.unsavedChanges;
    },
    routeTitle: state => {
      return state.routeTitle;
    },
    displayLogin: state => {
      return state.displayLogin;
    },
    displaySignUp: state => {
      return state.displaySignUp;
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
    setDisplayCanvas(state, payload) {
      state.displayCanvas = payload;
    },
    setMSDFTexture(state, payload) {
      console.log('setting MSDF texture mutation', payload)
      state.MSDFTexture = payload;
    },
    setUnsavedChanges(state, payload) {
      Object.keys(payload).forEach(key => {
        if(payload[key]){
          delete state.unsavedChanges[key];
        } else {
          state.unsavedChanges[key] = payload[key];
        }
      });
    },
    resetUnsavedChanges(state) {
      state.unsavedChanges = {};
    },
    setClickEnabled(state, payload) {
      state.clickEnabled = payload;
    },
    setInitialCameraPose(state, payload) {
      state.initialCameraPose = payload;
    },
    setRouteTitle(state, title) {
      state.routeTitle = title;
    },
    displayLogin(state, payload) {
      state.displayLogin = payload;
      if (payload) {
        state.displaySignUp = false;
      }
    },
    displaySignUp(state, payload) {
      state.displaySignUp = payload;
      if (payload) {
        state.displayLogin = false;
      }
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
      window.scene.remove(window.scene.getObjectByName(name));
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
    async saveNewSculpture({commit, getters}, sculpture) {
      const user = getters.getUser;
      // sculpture.author = { uid: user.uid, username: user.displayName };
      sculpture.uid = user.uid;
      sculpture.username = user.displayName;
      sculpture.timestamp = Date.now();
      const idHistory = {
        oldId: sculpture.id || sculpture.vueId,
        newId: ''
      };
      delete sculpture.vueId;  // remove the vueId when saving to db
      const sculpID = await firebase.database().ref(`sculptures`).push().key;
      sculpture.id = sculpID;
      let route = sculpture.isExample && getters.isAdmin  ? 'examples' : 'sculptures';
      await firebase.database().ref(`${route}/${sculpID}`).update(sculpture)
        .catch(error => console.error(error));

      //update list of sculptures in user's profile
      await firebase.database().ref(`users/${user.uid}/sculptures`).child(sculpID).set(sculpID)
        .catch(error => console.error(error));

      idHistory.newId = sculpID;
      commit('updateSelectedSculpture', sculpture);
      commit('updateSculptureIdInScene', idHistory);
      commit('setLoading', false);
      commit('incrementProfileBadgeCount');
      return sculpID;
    },
    saveSculpture({commit, dispatch, getters}, sculptureObj) {
      return new Promise(async (resolve, reject) => {
        try {
          commit('setLoading', true);
          let sculpture = Object.assign({}, sculptureObj);
          delete sculpture.sculpture; //remove the three.js 3d object
          
          console.log('saving sculpture');
          const user = getters.getUser;
          if(!user) {
            console.error('Tried to Save Sculpture when a User is not logged in');
            reject('Tried to Save Sculpture when a User is not logged in');
          }

          if (!sculpture.id || sculpture.id === sculpture.vueId) {
            console.log('saving new sculpture');
            resolve(dispatch('saveNewSculpture', sculpture));
          } else {
            if (sculpture.uid === user.uid || getters.isAdmin) {  // update existing sculpture
              let route = sculpture.isExample && getters.isAdmin ? 'examples' : 'sculptures'; //must be admin to update example
              delete sculpture.vueId;  // remove the three.js 3d object
              
              resolve(firebase.database().ref(`${route}/${sculpture.id}`).update(sculpture).then(() => {
                commit('setLoading', false);
              }));
            } else {  // Save as a fork
              console.log('save as fork');
              const newForkCount = sculpture.forks += 1;
              //update existing sculpture fork count
              let route = sculpture.isExample? 'examples' : 'sculptures'; //they don't have to be an admin to fork
              await firebase.database().ref(`${route}/${sculpture.id}/forks`).set(newForkCount);
              sculpture.isExample = false; //fork isn't an example
              Object.assign(sculpture, {
                forks: 0,
                uid: user.uid,
                username: user.displayName,
                fork: sculpture.id,
                forkedSculptureTitle: sculpture.title,
                featured: false,
                isExample: false,
                views: 0,
                favorites: 0,
                comments: 0
              });
              // sculpture.forks = 0;
              // sculpture.uid = user.uid;
              // sculpture.author = {uid: user.uid, username: user.displayName}; //new author
              // sculpture.fork = sculpture.id; //save the id of the original sculpture
              const fork = {
                uid: user.uid,
                username: user.displayName,
                timestamp: Date.now(),
                shaderSourceHistory: sculpture.shaderSource,
                rootId: sculpture.id
              }
              let newId = await dispatch('saveNewSculpture', sculpture);
              fork['newSculptureId'] = newId;
              resolve(firebase.database().ref(`forks`).push(fork).then(() => {
                commit('setLoading', false);
              }));
            }
          }
        } catch(e) {
          console.error(e);
          reject(e);
        }
      });
    },
    removeSelectedSculptureFromScene({commit, getters}) {
      let selectedSculpture = getters.selectedSculpture;
      commit('removeObjectFromUpdate', selectedSculpture.sculpture);
      commit('removeObjectFromRaycast', selectedSculpture.sculpture.mesh);
      commit('removeObjectFromSceneByName', selectedSculpture.id);
    },
    deleteSculpture({commit, getters, dispatch}, sculpture) {
      commit('setLoading', true);
      const user = getters.getUser;
      if (sculpture.uid === user.uid) {
        let route = sculpture.isExample && getters.isAdmin ? 'examples' : 'sculptures'; //must be admin to update example
        if(sculpture.fork) {
          firebase.database().ref('forks').orderByChild('newSculptureId').equalTo(sculpture.id).once('value').then(data => {
            let fork = data.val();
            if(fork) {
              let forkId = Object.keys(fork)[0];
              let rootSculptureId = fork[forkId].rootId;
              dispatch('fetchSculpture', {id: rootSculptureId, isExample: sculpture.isExample}).then((sculptureToUpdateForkCount) => {
                let route = sculptureToUpdateForkCount.isExample? 'examples' : 'sculptures'; //must be admin to update example
                sculptureToUpdateForkCount.forks -= 1;
                firebase.database().ref(`${route}/${sculptureToUpdateForkCount.id}`).update(sculptureToUpdateForkCount)
                .catch(error => console.error(error));
              });
              //delete fork
              firebase.database().ref(`forks/${forkId}`).remove().catch(error => console.error(error));
            }
          });
        }
        firebase.database().ref(`${route}/${sculpture.id}`).remove().catch(error => console.error(error));
        firebase.database().ref(`users/${user.uid}/sculptures/${sculpture.id}`).remove().then(() => {
          commit('setLoading', false);
        }).catch(error => console.error(error));

      } else {
        console.error('Tried to delete another user\'s sculpture');
      }
    },
    fetchUserSculptures({commit, getters}, username) {
      commit('setLoading', true);
      // const userId = uid || getters.getUser.uid;
      
      let route = 'sculptures';
      if(getters.isAdmin) {
        route = 'examples';
      }

      return firebase.database().ref(route).orderByChild('username').equalTo(username).once('value').then(data => {
        const sculptures = data.val();
        if(sculptures) {
          return Object.keys(sculptures).map(key => sculptures[key]);
        }
        return [];
      }).catch(error => console.error(error));

      // return firebase.database().ref(`${route}/${userId}`).once('value').then(data => {
      //   commit('setLoading', false);
      //   return data.val();
      // })
      // .catch(error => console.log(error));
    },
    fetchSculpture({commit, getters}, payload) {
      if (!payload.id) {
        console.error('No id passed to fetch sculpture');
        return;
      }
      commit('setLoading', true);
      const reference = payload.example ? 'examples/': 'sculptures/';
      return firebase.database().ref(`${reference}/${payload.id}`).once('value')
        .then(data => {
          commit('setLoading', false);
          return data.val();
        })
        .catch(error => console.log(error));

      // return firebase.database().ref(`${reference}`).orderByChild(payload.id).limitToLast(1).once('value')
      //   .then(data => {
      //     commit('setLoading', true);
      //     //ends up getting the user's entire profile
      //     const userSculpts =  data.val();
      //     const keys = Object.keys(userSculpts);
      //     if (userSculpts && keys.length > 0) {
      //       commit('setLoading', false);
      //       return userSculpts[keys[0]][payload.id];
      //     }
      //     commit('setLoading', false);
      //     return null;
      //   })
      //   .catch(error => console.log(error));
    },
    fetchSculptures({commit, getters}, reference) {
      commit('setLoading', true);
      const user = getters.getUser;
      return firebase.database().ref(reference).once('value').then(data => {
          const sculptures = data.val();
          let output = Object.keys(sculptures).map(key => sculptures[key]);
          // let output = [];
          // Object.keys(sculptures)
          //   .forEach(key => {
          //     Object.keys(sculptures[key]).forEach(sculptureKey => {
          //       const sculpture = sculptures[key][sculptureKey];
          //       output.push(sculpture);
          //     })
          //   });
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
    },
    fetchForks() {
      return firebase.database().ref('/forks').once('value').then(data => data.val());
    }
  }
});