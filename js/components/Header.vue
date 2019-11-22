<template>
    <div>
        <div class="nav-spacer"></div>
        <div v-if="!embedded" class="nav-bar">
            <div class="nav-left">
                <h2 v-if="!isMobile" class="logo-text">SP</h2>
                <!-- <input v-if="isMobile" type="text" class="search w-input" maxlength="256" name="search" data-name="search" placeholder="Search..." id="search"> -->
                <!-- <img v-if="!isMobile" class="logo" src="/images/sp_logo.png" /> -->
            </div>
            <h1 v-if="!isMobile" class="nav-text">{{title}}</h1>
            <div class="nav-right" v-bind:class="{ mobile: isMobile }" >  
                
                <router-link to="/" class="link" v-bind:class="{ mobile: isMobile }"  active-class="active" exact>Gallery</router-link>
                <!-- <router-link to="/examples" class="link" active-class="active">Examples</router-link> -->
                <a class="link" href="/references-js" v-bind:class="{ mobile: isMobile }"  active-class="active">References</a>
                <router-link v-if="!isMobile" to="/new" class="link" active-class="active">New</router-link>
                <a class="link" v-on:click="signIn" v-if="!user" v-bind:class="{ active: displayLogin, mobile: isMobile }">Sign In</a>
                
                <!-- <router-link to="/sign-in" class="link" v-if="!user" active-class="active">Sign In</router-link> -->
                <div class="dropDownContainer" v-on:mouseover="setProfileDropDown(true)" v-on:mouseleave="setProfileDropDown(flase)"> 
                    <router-link 
                        ref="profile" 
                        v-bind:data-badge="profileBadgeCount" to="/profile" 
                        v-bind:class="{ dynamicBadge: profileBadgeCount > 0, mobile: isMobile }" 
                        class="link" v-if="user" 
                        active-class="active">
                        My Sculptures
                        <span class="arrow"></span>
                    </router-link>
                                            
                    <div v-show="showProfileDropDown" class="dropDown">
                        <a class="link" v-on:click="signOut" v-bind:class="{ mobile: isMobile }"  v-if="user" active-class="active">Sign Out</a>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</template>

<script>
import firebase from "firebase/app";
import CardModal from './CardModal.vue';
export default {
    data: function() {
		return {
            showProfileDropDown: false
		}
    },
    components: {
        cardModal: CardModal
    },
    computed: {
		displayLogin() {
			return this.$store.getters.displayLogin;
		},
        embedded() {
            return this.$store.getters.getEmbedded;
        },
        profileBadgeCount() {
            return this.$store.getters.getProfileBadgeCount;
        },
        user() {
            return this.$store.getters.getUser;
        },
        title() {
            if(this.$store.getters.routeTitle) {
                return this.$store.getters.routeTitle;
            } else {
                return this.$route.meta.title;
            }
        },
        isMobile() {
            return window.innerWidth < 500;
        }
    },
    methods: {
        setProfileDropDown: function (val) {
            this.showProfileDropDown = val;
        },
        signOut: function() {
            firebase.auth()
            .signOut()
            .then(() => {
                // this.$router.replace('sign-in');
            });
        }, 
        signIn: function() {
            this.$store.commit('displayLogin', true);
        }
    }
};
</script>

<style lang="less">
.centerY() {
    position: absolute;
    top: 50%;
    -webkit-transform: translate(0px, -50%);
    -ms-transform: translate(0px, -50%);
    transform: translate(0px, -50%);
};

.dynamicBadge {
  position:relative;
}

.dynamicBadge[data-badge]:after {
  content:attr(data-badge);

  position:absolute;
  top:-15px;
  right:-18px;

  font-size:11px;
  font-family:"Roboto","Helvetica","Arial",sans-serif;
  font-weight:600;

  text-align:center;
  line-height:23px;

  background:#50e3c2;
  color:white;

  width:22px;
  height:22px;           

  border-radius:50%;
  /* box-shadow:1px 2px 5px #888; */
}


.logo {
    width: 50px;
    opacity: 0.5;
}

.logo-text {
    opacity: 0.5;
    margin: 0px;
    font-size: 27px;
    margin-bottom: 3px;

}

.nav-spacer {
    height: 10vh;
    width: 100vw;
}

.nav-bar {
    position: fixed;
    // position: fixed;
    left: 0px;
    top: 0px;
    right: 0px;
    height: 10vh;
    min-height: 45px;
    padding: 0px 60px 25px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .15);
    background-color: white;
    z-index: 102;
    
    .nav-text {
        .centerY();
        left: 0px;
        right: 0px;
        z-index: 0;
        margin-top: 0px;
        margin-bottom: 0px;
        
        font-size: 19px;
        line-height: 0px;
        font-weight: 400;
        text-align: center;
    }
    .nav-left {
        .centerY();
        left: 0px;
        z-index: 1;
        margin-left: 40px;
    }    
    .nav-right {
        .centerY();
        position: absolute;
        right: 0px;
        z-index: 1;
        &.mobile{
            font-size: 14px !important;
        }
    }  
    .link.active {
        color: #000;
        border-bottom: 2px solid #50e3c2 !important;
        -webkit-transition: border-color 300ms ease-in-out;
        transition: border-color 300ms ease-in-out;
    }
    

    .search {
        width: 330px;
        margin-bottom: 0px;
        border-radius: 57px;
        font-size: 18px;
        font-weight: 300;
    }
    .arrow {
        display: inline-block;
        vertical-align: middle;
        margin-top: -1px;
        margin-left: 6px;
        margin-right: -14px;
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid #ccc;        
    }
    .dropDownContainer {
        display: inline-block;
        position: relative;
        .dropDown {
            position: absolute;
            width: 144px;
            padding: 15px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .15);
            background-color: white;
            z-index: 103;
            top: 20;
            right: 25px;
        }
    }

}
.link {
    margin-right: 40px;
    border-bottom: 2px solid hsla(0, 0%, 100%, 0) !important;
    font-size: 18px;
    line-height: 0px;
    font-weight: 300;
    cursor: pointer;
    text-decoration: none;
    transition: color 300ms ease-in-out;
    color: #777;
    -webkit-transition: color 300ms ease-in-out ;
    &:hover {
        color: #000;
    }  
    &.mobile {
        margin-right: 20px;
        font-size: 14px !important;
    }      
}

.button {
    opacity: 1.0;
    color: white;
    padding: 11px 35px;
    border: 1px solid #dedede;
    border-radius: 4px;
    background-color: #50e3c2;
    font-size: 18px;
    font-weight: 200;
    letter-spacing: 1.1px;
    text-indent: 0px;
    transition: opacity 300ms ease-in-out, color 300ms ease-in-out;
    
    &:hover {
        color: black;
    }

    &:disabled {
        color: white;
        opacity: 0.5;
    }
}
</style>
