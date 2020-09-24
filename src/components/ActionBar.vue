<template>

<div :class="{embeded : isEmbeded, dragging: dragging}" :style="{width: currWidth}" class="action-bar">
    <button class="editor-button" @click="showCodeEditor">Edit Code</button>
    <!-- <button class="editor-button action-button fade-opacity"></button> -->
    <button @click.stop="share" v-if="displayShareButton" class="editor-button share fade-opacity" ref="share">{{shareText}}</button>
    <!-- <div class="action-bar-container" :style="{minWidth: cachedWidth}">
    </div> -->
</div>

</template>

<script>

export default {
    props: {
        cachedWidth: { type: String, default: '50vw' },
        dragging: {type: Boolean, default: false}
    },
    data () {
        return {
            currWidth: '100vw',
            shareText: ''
        }
    },
    components: {
        
    },
    mounted() {
        this.shareText = 'shareText';
        // document.addEventListener('keydown', this.keypress.bind(null, true));
    },
    computed : {
        isUserSculpture() {
            return this.$store.getters.getUser.uid == this.selectedSculpture.uid;
        },

        selectedSculpture() {
            return this.$store.state.selectedSculpture;
        },
        currUser () {
			return this.$store.getters.getUser;
        },
        authorUsername() {
            return this.selectedSculpture? this.selectedSculpture.username: null;
        },
        authorId() {
            return this.selectedSculpture? this.selectedSculpture.uid: null;
        },
        userProfileRoute() {
            return this.selectedSculpture? `/user/${this.selectedSculpture.username}`: $router.currentRoute.path;
        },
        isEmbeded() {
            return this.$store.state.embedded;
        },
        currSculpture() {
            return this.$store.state.currSculpture;
        },
        displayShareButton() {
            return this.currSculpture && this.currSculpture.id && this.currSculpture.id.length > 3
        }
    },
    watch : {
        displayShareButton(display) {
            if(display) {
                this.shareText = '';
            }
        },
        cachedWidth(value) {
            if(this.currWidth != '0px') {
                this.currWidth = this.cachedWidth;
            }
        },
        selectedSculpture(sculp) {
            if(sculp) {
                this.editorActionText = 'Edit Code';
            } else {
                this.editorActionText = 'Close Editor';
            }
        }
    },
    methods: {
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
            let sculp = this.currSculpture;
            console.log(sculp)
            let shareEl = this.$refs.share;
            if(shareEl.classList.contains('selected')) {
                shareEl.classList.remove('selected');
                this.shareText = '';
            } else {
                shareEl.classList.add('selected');
                this.shareText = 'Copied URL';
            }
            const el = document.createElement('textarea');
            let example = sculp.isExample? '?example=true' :'';

            el.value = `https://shaderpark.netlify.com/sculpture/${sculp.id}${example}`;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
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
        transition: width 0ms ease-in-out;
    }
    // border-top: 1px solid rgba(0, 0, 0, 0.15);
    border-top: 2px solid #f5f5f5;
    height: 5vh;
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
    width: 30px !important;
    height: 30px !important;
    // margin-right: 20px;
    // margin-left: 20px;
    padding-right: 30px;
    // padding-left: 30px;
    border-top: 1px none #000;
    background-image: url('../client/images/Heart.svg');
    background-position: 50% 50%;
    background-size: 25px 25px;
    background-repeat: no-repeat, no-repeat;
    // opacity: 0.6;
    // -webkit-transition: opacity 300ms ease-in-ou;
    // transition: opacity 300ms ease-in-ou;
    &:hover {
        opacity: 1;
    }

    &:active {
        background-image: url('../client/images/Heart.svg'), url('../client/images/Heart_filled.svg');
        background-position: 50% 50%, 50% 50%;
        background-size: 25px 25px, 25px 25px;
        background-repeat: no-repeat, no-repeat;
        opacity: 1;
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
    width: 38px;
    height: 30px;
    border-style: none;
    background-image: url('../client/images/share.svg');
    background-position: 60% 50%;
    background-size: 22px;
    background-repeat: no-repeat, no-repeat;
    &.selected{
        background-size: 0 0;
        width: auto;
    }
}


</style>