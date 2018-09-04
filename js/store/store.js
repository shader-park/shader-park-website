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
    updateSculptureId(state, payload) {
      const oldId = payload.oldId;
      const newId = payload.newId;
      const obj = state.scene.getObjectByName(oldId);
      obj.name = newId;
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
    setDBUser(context, payload) {
      let uid = payload.uid;
      let dbUser = payload.user;
      firebase.database().ref('users/' + uid).set(dbUser);
      firebase.database().ref('usernames/' + dbUser.username).set(uid);
    },
    saveSculpture({commit, getters}, sculptureObj) {
      let sculpture = Object.assign({}, sculptureObj);
      delete sculpture.sculpture;
      // firebase.database().ref('sculptures').child(sculpture.id).update(sculpture);
      console.log('saving sculpture');
      const user = getters.getUser;

      // date.toISOString();

      if (sculpture.id) {
        if (sculpture.author.uid === user.uid) {  // update existing sculpture
          firebase.database()
              .ref(`sculptures/${user.uid}/${sculpture.id}`)
              .update(sculpture)
          // TODO: save to vuex state
        } else {  // Save as a fork
          console.log('save as fork');
        }
      } else {  // sculpture has never been saved before
        // TODO : get user should also put username into the global object
        firebase.database().ref(`users/${user.uid}`).once('value')
            .then(data => data.val().username)
            .then(username => {
              console.log(username);
              sculpture.author = {uid: user.uid, username: username};
              console.log(sculpture.author);
              sculpture.timestamp = Date.now();
              const sculpID = firebase.database().ref(`sculptures/${user.uid}`).push().key;
              sculpture.id = sculpID;
			  
			  firebase.database().ref(`sculptures/${user.uid}/${sculpID}`).update(sculpture)
				  .catch(error => console.log(error));
				  
              firebase.database().ref(`users/${user.uid}/sculptures`).child(sculpID).set(sculpID)
                  .catch(error => console.log(error));
			  commit('updateSelectedSculpture', sculpture);
			  const payload = {
				  oldId : sculpture._uid,
				  newId: sculpID
				};
			  commit('updateSculptureId', payload);

            });


        // //save sculp to vuex
        // const sculpId =
        // firebase.database().ref('sculptures').push(sculpture); let updates =
        // {}; updates[`users/${user.uid}/sculptures/${sculpId}`] = sculpture;
        // updates[`sculptures/${sculpId}`] = postData;

        // .then(data => {
        //   const key = data.key;
        //   firebase.database().ref(`users/${user.uid}/sculptures`).push(sculpID);
        //   sculpture.id = key;
        //   console.log(sculpture);
        //   console.log('success!');
        //   // commit('setSculpture', sculpture);
        // })
        // .catch(error => console.log(error));
      }
    },
    fetchUserSculptures({commit, getters}) {
      commit('setLoading', true);
      const user = getters.getUser;
      return firebase.database()
          .ref(`sculptures/${user.uid}`)
          .once('value')
          .then(data => data.val())
          .catch(error => console.log(error));
    },
    fetchAllSculptures({commit, getters}) {
      commit('setLoading', true);
      const user = getters.getUser;
      return firebase.database()
          .ref(`sculptures`)
          .once('value')
          .then(data => {
            const sculptures = data.val();
            let output = [];
            Object.keys(sculptures)
                .forEach(
                    key => {
                        Object.keys(sculptures[key]).forEach(sculptureKey => {
                          const sculpture = sculptures[key][sculptureKey];
                          output.push(sculpture);
                        })});
            return output;
          })
          .catch(error => console.log(error));
    }
  }
});