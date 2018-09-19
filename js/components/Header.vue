<template>

    <div class="nav-bar">
        <div class="nav-left">
            <input type="text" class="search w-input" maxlength="256" name="search" data-name="search" placeholder="Search..." id="search">
        </div>
        <h1 class="nav-text">{{title}}</h1>
        <div class="nav-right">        
            <router-link to="/" class="link" active-class="active" exact>Gallery</router-link>
            <router-link to="/examples" class="link" active-class="active">Examples</router-link>
            <router-link to="/new" class="link" active-class="active">New</router-link>
            <router-link to="sign-in" class="link" v-if="!user" active-class="active">Sign In</router-link>
            <router-link to="sign-up" class="link" v-if="!user" active-class="active">Sign Up</router-link>
            <router-link v-bind:data-badge="profileBadgeCount" to="profile" v-bind:class="{ dynamicBadge: profileBadgeCount > 0 }" class="link" v-if="user" active-class="active">Profile</router-link>
            <a class="link" v-on:click="signOut" v-if="user" active-class="active">Sign Out</a>
        </div>
    </div>
</template>

<script>
import firebase from "firebase";
export default {
    computed: {
        profileBadgeCount() {
            return this.$store.getters.getProfileBadgeCount;
        },
        user() {
            return this.$store.getters.getUser;
        },
        title() {
            return this.$route.meta.title;
        }
    },
    methods: {
        signOut: function() {
            firebase.auth()
            .signOut()
            .then(() => {
                this.$router.replace('sign-in');
            });
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

.nav-bar {
    position: fixed;
    left: 0px;
    top: 0px;
    right: 0px;
    height: 80px;
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
    }  
    .link {
        margin-right: 40px;
        border-bottom: 2px solid hsla(0, 0%, 100%, 0) !important;
        font-size: 18px;
        line-height: 0px;
        font-weight: 300;
        text-decoration: none;
        transition: color 300ms ease-in-out;
        color: #777;
        -webkit-transition: color 300ms ease-in-out ;
        &:hover {
            color: #000;
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
