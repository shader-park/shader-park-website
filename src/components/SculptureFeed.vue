<template>
	<div class="sculpture-container">
    <room ref="room" v-if="sculptures.length > 0 && show3D" v-bind:sculpturesData="sculptures"></room>
    <div class="w-layout-grid sculpture-grid" v-if="sculptures.length > 0 && !show3D">
		<div  v-for="(sculpture, index) in sculptures" :key="sculpture.id" class="sculpture-item"> 
			<router-link  :to="'/sculpture/'+sculpture.id + (sculpture.isExample? '?example=true' : '') + '?hideeditor=true&hidepedestal=true'" tag="a">
			<v-lazy-image src-placeholder="img/icons/sphere.jpg" :alt="sculpture.title" width="500" sizes="520px" :src="sculpture.thumbnail? sculpture.thumbnail: 'img/icons/sphere.jpg' " />
			</router-link>
			<div class="sculpture-description">
				{{sculpture.title}}
				<br>by 
				<router-link  :to="'/user/'+sculpture.username" tag="a">
					{{sculpture.username}}
        </router-link> 
        <p v-if="sculpture.fork">
          forked from 
          <router-link  :to="'/sculpture/'+sculpture.fork" tag="a">
            {{sculpture.fork}}
          </router-link> 
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

export default {
	props: {
        sculptures: { type: Array},
        show3D: { type: Boolean, default: false}
    },
	components : {
		sculpture: Sculpture,
		room : Room	,
		VLazyImage
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


<style scoped>
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
  height: 350px;
  object-fit: contain;  
  transition: filter 0.5s ease-in-out, opacity 0.5s ease-in-out;
}
.v-lazy-image-loaded {
  opacity: 1;
  filter: blur(0);
  height: 350px;
  object-fit: contain;  
}

.sculpture-container {
  height: auto;
  padding-top: 30px;
  padding-bottom: 30px;
}

.sculpture-grid {
  /* margin-right: 30px;
  margin-left: 30px; */
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
}
</style>
