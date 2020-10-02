<template>
<div>
    <div :class="{embeded : isEmbeded, dragging: dragging}" :style="{width: currWidth}" class="action-bar">   
        <button v-if="!isMobile" class="editor-button" @click="showCodeEditor">Edit Code</button>
        <button :class="{activated : favorited}" @click="throttleFavorite" class="editor-button action-button"> </button>
        <span>{{favoriteCount}}</span>
        <button @click.stop="share" v-if="displayShareButton" class="editor-button share fade-opacity" ref="share">Share</button>
    </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import throttle from 'lodash.throttle'

export default {
    props: {
        cachedWidth: { type: String, default: '50vw' },
        dragging: {type: Boolean, default: false}
    },
    data () {
        return {
            currWidth: '100vw',
            favorited: false,
            favoriteCount: 0
        }
    },
    computed : {
        ...mapGetters({
            userFavorites: 'userFavorites'
        }),
        isEmbeded() {
            return this.$store.state.embedded;
        },
        currSculpture() {
            return this.$store.state.currSculpture;
        },
        displayShareButton() {
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
        },
        userFavorites(value) {
            this.updateFavoritedButton();
        }
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
        favorite() {
            return new Promise((resolve, reject) => {
                if(this.currUser != null) {
                    let id = this.currSculpture.id;
                    this.$store.dispatch('favorite', {sculpture: this.currSculpture, favorited: !this.favorited}).then(() => {
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
    }
}

</script>


<style lang="less" scoped>


.action-bar {
    &.embeded {
        display: none;
    }
    &.dragging {
        transition: width 0ms ease-in-out !important;
    }
    // border-top: 1px solid rgba(0, 0, 0, 0.15);
    border-top: 2px solid #f5f5f5;
    height: 5vh;
    min-height: 44px;
    position: fixed;
    bottom: 0px;
    right: 0px;
    background: white;
    z-index: 10;

    transition: width 300ms ease-in-out;

    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 100vw;
    height: 6vh;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;

}


.action-button {
    width: 45px !important;
    height: 30px !important;
    // margin-right: 20px;
    // margin-left: 20px;
    // padding-right: 30px;
    // padding-left: 30px;
    margin-left: 20px;
    border-top: 1px none #000;
    background-image: url('../client/images/Heart.svg');
    background-position: 50% 50%;
    background-size: 25px 25px;
    // background-color: white;
    background-repeat: no-repeat, no-repeat;
    border-radius: 100px;
    opacity: 0.6;
    -webkit-transition: opacity 300ms ease-in-out;
    transition: 300ms ease-in-out 0s;
    &:hover {
        opacity: 1;
    }

    &:active {
        box-shadow: none;
    }

    &.activated {
        background-image: url('../client/images/Heart.svg'), url('../client/images/Heart_filled.svg');
        background-position: 50% 50%, 50% 50%;
        background-size: 25px 25px, 25px 25px;
        background-repeat: no-repeat, no-repeat;
        opacity: 1;
        box-shadow: none;
        background-color: white;

    }
}

.fade-opacity {
    opacity: 0.6;
    margin-left: 20px;
    background-repeat: no-repeat;
    // box-shadow: none;
    transition: opacity 300ms ease-in-out;
    -webkit-transition: opacity 300ms ease-in-out;
    &:hover {
        // box-shadow: none;
        opacity: 1.0;
    }
}

.share {
    width: 94px;
    text-align: left;
    color: black;
    border-style: none;
    background-image: url('../client/images/share.svg');
    background-position: 85% 50%;
    background-size: 22px;
    background-repeat: no-repeat, no-repeat;
    &.selected{
        background-size: 0 0;
        width: auto;
    }
}

</style>