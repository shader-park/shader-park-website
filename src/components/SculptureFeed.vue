<template>
<!------SCULPTURE GRID----->
<div class="sculpture-container">
  <room ref="room" v-if=" show3D" v-bind:sculpturesData="sculptures" ></room><!--sculptures.length > 0 &&-->
    <div class="w-layout-grid sculpture-grid" v-if="!show3D" ><!--sculptures.length > 0 && -->
      <!-----SCULPTURE ITEM---->
      <div v-for="(sculpture) in sculptures" :key="sculpture.id" class="sculpture-item" >
        <router-link :to="'/sculpture/'+sculpture.id + (sculpture.isExample? '?example=true' : '') + '?hideeditor=true&hidepedestal=true'" tag="a" > <v-lazy-image :alt="sculpture.title" width="500" sizes="520px" :src="sculpture.thumbnail? sculpture.thumbnail: 'https://firebasestorage.googleapis.com/v0/b/shader-park-core.appspot.com/o/sculptureThumbnails%2F-Lk_XES0HZ7-EdHhMstK.jpeg?alt=media&token=89087d04-7bcd-4368-bfe4-19281471308b'" src-placeholder="https://firebasestorage.googleapis.com/v0/b/shader-park-core.appspot.com/o/sculptureThumbnails%2F-LkafBpRAsQOqxKBP786.jpeg?alt=media&token=378fc6f9-b6d6-4dc3-8b98-fac3a1467d19" /> </router-link>
                <div class="sculpture-description">{{sculpture.title}}<br /> by
                    <router-link :to="'/user/'+sculpture.username" tag="a">{{sculpture.username}}</router-link>
                    <!-----SCULPTURE ACTION BAR HOME PAGE---->
                    <div :class="{embeded : isEmbeded, dragging: dragging}" class="sculpture-main-action-bar">
                        <div class="sculpture-button-bar">
                            <!------COMMENT COUNT TOGGLE BUTTON---->
                            <div class="sculpture-comment-span-button">
                              <button v-on:click="show = !show" class=" editor-button sculpture-comment-count fade-opacity " style="margin-left: none" ></button>
                              <span >{{commentCount}} </span>
                            </div>
                            <!----------LIKE BUTTON----------->
                            <div class="sculpture-comment-span-button">
                              <button v-on:click="favorite(sculpture)"  :class="{activated : favorited}" @click="throttleFavorite" class="editor-button action-button"> </button>
                              <span class="sculpture-comment-span" >{{sculpture.favorites}}</span >
                            </div>
                          <!----------SHARE BUTTON---------->
                          <button @click.stop="share" class="editor-button share fade-opacity" ref="share" style='background-position: 50% 50%;'></button>
                          </div>
                          <!----------TOGGLE SCULPTURE COMMENT INPUT FEED---------->
                          <div v-if="show">
                          </div>
                          <div v-else>
                                    <div class="sculpture-comment-input">
                              <textarea class="sculpture-comment-textarea" v-model="newComment" rows="1" name="commentInput"></textarea>
                              <!----------ADD COMMENT BUTTON---------->
                                  <button v-on:click="addComment(sculpture)" style=" font-size: 12px; width: 100px; margin-right: 5px; " class="editor-button" > Comment </button>
                                  </div>
                                    <ul v-for="(comment) in sculpture.comments" :key="comment.id" class="sculpture-item" id="sculpture-comment">
                                    <li class="sculpture-comment-post"> 
                                      <!----------COMMENT DATE---------->
                                          <small style='display:flex; justify-content: flex-end; margin-right: 5px;' class='scultpure-comment--post-date'>{{comment.date}}  
                                            <!----------DELETE COMMENT BUTTON---------->
                                          <button v-on:click="deleteComment(comment)"  style="margin-left: 5px; border-radius: 5px" ><img alt='closebutton' width="20px" height="20px" src='../client/images/close.svg'/></button></small>  
                                          <img class='scultpure-comment--post-avi' height='40px' width='40px' src='../client/images/avi.png' /> <!--:src="comment.avi"-->
                                          <!----------COMMENT USERNAME---------->
                                          <i class='sculpture-comment-post-username'>{{comment.username}}</i>
                                          <!----------COMMENT TEXT---------->
                                          <div class='sculpture-comment-post-text'> {{comment.comment}}  </div></li>
                                    </ul>
                              </div>
                          </div>
                        <p v-if="sculpture.fork"> forked from 
                            <router-link :to="'/sculpture/'+sculpture.fork" tag="a"> {{sculpture.fork}} </router-link>
                        </p>
                </div> 
            </div>
        </div>
    </div>   
</template>
<script>
import Sculpture from './Sculpture.vue';
import Room from './Room.vue';
import {handelUnsavedChanges} from '../helpers/handelUnsavedChanges.js';
import VLazyImage from "v-lazy-image";
import { mapGetters } from 'vuex';
import throttle from 'lodash.throttle';

export default {

  data () {
        return {
            currWidth: '100vw',
            favorited: false,
            favoriteCount: 0,
            commentCount: '',
            show: true,
            newComment: '',
        }
    },
  props: {
        sculptures: { type: Array},
        show3D: { type: Boolean, default: false},
        cachedWidth: { type: String, default: '50vw' },
        dragging: {type: Boolean, default: false}
    },
        computed : {
        ...mapGetters({
            userFavorites: 'userFavorites',
            userComments: 'userComments',
        }),
        isEmbeded() {
            return this.$store.state.embedded;
        },
        currSculpture() {
            return this.$store.state.currSculpture;
        },
        displayActionButton() {
            return this.currSculpture && this.currSculpture.id && this.currSculpture.id.length > 3
        },
        isMobile() {
            return window.innerWidth < 500;
        },
        currUser () {
			return this.$store.getters.getUser;
        },
    },
    watch : {
        cachedWidth(value) {
            if(this.currWidth != '0px') {
                this.currWidth = this.cachedWidth;
            }
        },
        currSculpture(value) {
            this.updateFavoritedButton();
            this.updateComments();
        },
        userFavorites(value) {
            this.updateFavoritedButton();
        },
        userComments(value) {
            this.updateComments();
        },
        userCommentCount(value) {
            this.updateCommentCount();
        },
    },

    created() {
        this.throttleFavorite = throttle(this.favorite, 850);
    },
    methods: {
        updateFavoritedButton() {
            this.favorited = (this.userFavorites && this.currSculpture && 'id' in this.currSculpture && this.currSculpture.id in this.userFavorites);
            if(this.$store.state.currSculpture) {
                this.favoriteCount = this.currSculpture.favorites;
            }
        },
        updateComments() {
            this.comment = (this.userComments && this.currSculpture && 'id' in this.currSculpture && this.currSculpture.id in this.userComments);
          if(this.$store.state.currSculpture) {
                this.comments= this.currSculpture.comments;
                this.commentCount = this.currSculpture.commentCount;

            }
        },
      addComment( sculpture) {
            return new Promise((resolve, reject) => {
                if(this.currUser != null) {
                  let comment = this.newComment;
                  this.updateComments();
                  this.$store.dispatch('addComment', {sculpture, comment}).then(() => {
                        resolve();
                    }).catch(e => {
                        console.error(e);
                        alert(e);
                        reject(e);
                    })
                } else {
                    this.$store.commit('displayLogin', true);
                    resolve();
                }
            });
        },
      deleteComment(comment) {
            return new Promise((resolve, reject) => {
                if(this.currUser === null) {
                  this.$store.commit('displayLogin', true);
                    resolve();
                    alert('first if' + comment.uid + ' ' + this.currUser.uid)
                } else if (this.currUser != null && this.currUser.uid != comment.uid){
                  alert(`You can only delete your own comments.`+ comment.uid + ' ' + this.currUser.uid);
                }
                else {
                    this.$store.dispatch('deleteComment', {comment}).then(() => {
                        alert('delete comment?');
                        resolve();
                    }).catch(e => {
                        console.error(e);
                        alert(e);
                        reject(e);
                    })
                }
            });
        },
      
      favorite(sculpture) {
            return new Promise((resolve, reject) => {
                if(this.currUser != null) {
                  //  let id = this.currSculpture.id;
                    this.$store.dispatch('favorite', {sculpture, favorited: !this.favorited}).then(() => {
                        resolve();
                    }).catch(e => {
                        console.error(e);
                        alert(e);
                        reject(e);
                    })
                } else {
                    this.$store.commit('displayLogin', true);
                    resolve();
                }
            });
        },
        showCodeEditor() {
            this.$store.state.selectedObject = this.getCurrSculpture();
        },
        getCurrSculpture(){
            let sculp = window.scene.children.filter(obj => obj.type === 'Mesh');
            try {
                return sculp[0];
            } catch(e) {
                console.error('No sculpture found', e)
            }
        },
        share() {
            this.$store.commit('displayShareModal', true);
        },
    },
  components : {
    sculpture: Sculpture,
    room : Room ,
    VLazyImage,
    msg: String
  },
  mounted() {
    this.$store.commit('setInitialCameraPose', [6, 2.5, 4]);
    
    this.$store.dispatch('fetchForks').then((forks) => {
      let newForks = {}
      Object.keys(forks).forEach(key => {
        newForks[forks[key].rootId] = forks[key]
      })
      if(this.sculptures) {
        this.sculptures.forEach((sculp, index) => {
          if(sculp && sculp.fork && !(sculp.fork in newForks)) {
            this.sculptures[index].fork = null;
            // this.sculptures[index].fork = newForks[sculp.fork];
          }
        });
      }
    });
  },
  beforeRouteLeave (to, from, next) {
    handelUnsavedChanges(next, this);
  }
  
};
</script>

<style lang="less" scoped>
img[lazy=loading] {
  filter: blur(10px);
  opacity: 0.5;
  transition: filter 0.5s ease-in-out, opacity 0.5s ease-in-out;
}
/* img[lazy=error] {

} */

img[lazy=loaded] {
  opacity: 1;
  filter: blur(0);
}

.sculpture-item {
  min-width: 0;
}

.v-lazy-image {
  filter: blur(10px);
  opacity: 0.5;
  min-width: 0;
  transition: filter 0.5s ease-in-out, opacity 0.5s ease-in-out;
}
.v-lazy-image-loaded {
  opacity: 1;
  filter: blur(0);
}

.sculpture-container {
  height: auto;
  padding-top: 30px;
  padding-bottom: 30px;
}

.sculpture-grid {
  margin-right: 30px;
  margin-left: 30px;
  grid-column-gap: 30px;
  grid-row-gap: 50px;
  min-height: 0;
  min-width: 0;
  -ms-grid-columns: 1fr 1fr 1fr 1fr;
  grid-template-columns: 1fr 1fr 1fr 1fr
}

.sculpture-description {
  margin-top: 10px;
  font-family: Regolapro, sans-serif;
  font-size: 17px;
  line-height: 23px;
}

@media (max-width: 991px) {
  .sculpture-grid {
    -ms-grid-columns: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 479px) {
  .sculpture-grid {
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    -ms-grid-columns: 1fr;
    grid-template-columns: 1fr;
  }
  .sculpture-container {
  padding-top: 20px;
  padding-bottom: 20px;
  }
  .sculpture-likebtn {
  width:auto;
    
  }
}
.sculpture-main-action-bar {
  border: 8px rgb(80,227,194, 0.1) solid;
  background-color:rgb(80,227,194, 0.1);
  border-radius: 15px;
  margin-top: 1%;
  padding-top: 2%;
  max-width: 500px;
}
.sculpture-button-bar {
    display: flex; 
    justify-content: space-around;
    margin-bottom: 10px;
}
.sculpture-comment-span-button{
    display: flex; 
  justify-content: space-between;
}
.sculpture-comment-count {
    width: 45px !important;
    height: 30px !important;
    text-align: left;
    color: black;
    border-style: none;
    background-image: url('../client/images/comment_m7zwuu.svg');
    background-position: 50% 50%;
    background-size: 22px;
    background-repeat: no-repeat,   
}
.sculpture-comment-textarea {
  padding: 0.5em;
  font-size: 12px;
  resize: none; 
  border-radius: 6px; 
  border-color:rgb(119, 119, 119, 0.5);  
  width: 65%;
}
.sculpture-comment-span {
  width: 10px;
  
}
.sculpture-comment-input {
  display: flex; 
  justify-content: space-between;
}
#sculpture-comment{
  margin-top: 15px;
  background-color:white;
  border-radius: 5px;
  padding: 0px 10px;
  list-style-type: none;
  overflow: auto;
}
.sculpture-comment-post{
  background-color: white;
  border-radius: 10px;
  margin-top: 10px;

}
.scultpure-comment--post-date{
  font-size: 10px;
}
.sculpture-comment-post-text{
  font-size: 12px;
  margin-top: 10px;
  display:flex; 
  justify-content: center;
  margin-right: 70%;
  margin-bottom: 20px;
}

.sculpture-comment-post-avi{
  height: 40px;
  width: 40px;
  padding-bottom: 5px;
}
.sculpture-comment-post-username{
  font-size: 12px;
  color: #006492;
}

</style>

