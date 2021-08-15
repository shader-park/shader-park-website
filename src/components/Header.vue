<template>
    <div>
        <!------NAV BAR -------->
        <div class="nav-spacer" v-if="!embedded" >
        <div v-if="!embedded" class="nav-bar" @click.stop="">
        <!-----------CENTER ---------->
            <h1 v-if="!isMobile" class="nav-text">{{title}}</h1>
            <!--------NAVIGATION LEFT--------->
            <div class="nav-left">
                <router-link to="/" v-if="!isMobile" class="logo-text"  active-class="active"> SP</router-link> 
                <!-- <input v-if="isMobile" type="text" class="search w-input" maxlength="256" name="search" data-name="search" placeholder="Search..." id="search"> --><!-- <img v-if="!isMobile" class="logo" src="/images/sp_logo.png" /> -->
                <router-link to="/" class="link" v-bind:class="{ mobile: isMobile }"  active-class="active" exact>Home</router-link>
                <router-link to="/about" class="link" active-class="active" v-bind:class="{ mobile: isMobile }">About</router-link>
                <a class="link"  target="_blank" href="https://shader-park-docs.netlify.com/designers/" v-bind:class="{ mobile: isMobile }"  active-class="active">Designers</a>
            </div>
        
            <!-------NAVIGATION RIGHT -------->
            <div class="nav-right" v-bind:class="{ mobile: isMobile }" >  
                <router-link v-if="!isMobile" to="/new" class="link" active-class="active">New</router-link>
                <a class="link"  target="_blank" href="https://shader-park-docs.netlify.com/references-js/" v-bind:class="{ mobile: isMobile }"  active-class="active">References</a>
                <router-link to="/examples" class="link" active-class="active">Examples</router-link> 
            <!-------DROP DOWN ------->
                        <a class="link" v-on:click="signIn" style="width:92px" v-if="!user" v-bind:class="{ active: displayLogin, mobile: isMobile }">Sign In</a>
                        <!-- <router-link to="/sign-in" class="link" v-if="!user" active-class="active">Sign In</router-link> -->
                        <div class="dropDownContainer" v-on:mouseover="setProfileDropDown(true)" v-on:mouseleave="setProfileDropDown(false)"> 
                                <router-link ref="profile" v-bind:data-badge="profileBadgeCount" to="/profile" v-bind:class="{ dynamicBadge: profileBadgeCount > 0, mobile: isMobile }" class="link" v-if="user" active-class="active">My Sculptures<span class="arrow"></span></router-link>                      
                                <div v-show="showProfileDropDown" class="dropDown"><a class="link" v-on:click="signOut" v-bind:class="{ mobile: isMobile }"  v-if="user" active-class="active link">Sign Out</a> </div>
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
@import '../client/mixins.less';

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
    background:var(--sp-aquamarine);
    color:var(--sp-white);
    width:22px;
    height:22px;           
    border-radius:50%;
}
.logo {
    width: 50px;
    opacity: 0.5;
}

.logo-text {
    opacity: 0.5;
    margin: 0px;
    font-size: 32px;
    margin-right: 40px;
    .mobile({
        display:flex;
        margin-bottom: 10px;
    });
}

.nav-spacer {
    height: 10vw;
    width: 100vw;
    min-height: 145px;
    
}

.nav-bar {
    display: flex;
    position: fixed;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;  
    min-height: 85px;
    padding: 30px 30px 30px 30px ;
    background-color: var(--sp-white);
    box-shadow: 0.5px 1px 3px 0.5px rgba(0, 0, 0, 0.15);
    z-index: 102;
    .tablet({
    height: 130px;
    });
    .mobile({
    height: 150px;
    });
    .nav-text {    
        font-size: 40px;
        left: 45%;
        position: absolute;
        font-size: 20px;
        font-weight:bold;
        line-height: 0px;
        font-weight: 400;
        .smallDesktop({
            display: none;
        });
    }
    .nav-left {
        font-size: 14px !important;
        z-index: 1;
        width: 50%;
        .smallDesktop({
            margin-bottom: 20px;
        });
        .tablet({
            margin-bottom: 20px;
        });
        .mobile({
            margin-bottom: 8px
        });

    }    
    .nav-right {
        font-size: 14px !important;
        z-index: 1;
        .smallDesktop({
            margin-bottom: 20px;
            margin-top: 10px;
        });
        .tablet({
            margin-bottom: 20px;
        });
        .mobile({
            margin-top:0px;
            font-size: 18px !important;
        });
    }  

    .link.active {
        color: var(--sp-black);
        border-bottom: 2px solid var(--sp-aquamarine) !important;
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
        margin: -1px -14px 0px 6px;
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid var(--sp-silver);        
    }
    .dropDownContainer {
        display: inline-block;
        position: relative;
        .dropDown {
            position: absolute;
            width: 144px;
            padding: 15px;
            box-shadow: 0.1px 1px 3px 0.1px rgba(0, 0, 0, 0.15);
            background-color: var(--sp-white);
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
    color: var(--sp-gray);
    -webkit-transition: color 300ms ease-in-out ;
    &:hover {
        color: var(--sp-black);
    }  
    .smallDesktop({
        margin-right: 30px;
    });
    .tablet({
        margin-right: 30px;
    });
    .mobile({
        margin-right: 25px;
        font-size: 14px !important;
    });
}

.button {
    opacity: 1.0;
    color: var(--sp-white);
    padding: 11px 35px;
    border: 1px solid #dedede;
    border-radius: 4px;
    background-color: var(--sp-aquamarine);
    font-size: 18px;
    font-weight: 200;
    letter-spacing: 1.1px;
    text-indent: 0px;
    transition: opacity 300ms ease-in-out, color 300ms ease-in-out;
    
    &:hover {
        color: var(--sp-black);
    }

    &:disabled {
        color:var(--sp-white);
        opacity: 0.5;
    }
    
    .mobile({
        font-size: 14px !important;
    });
}
</style>
