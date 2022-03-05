<template>
    <div class="share-container" :class='{fade: shouldDisplay}'>
        <button class="close-auth" v-on:click="close" ></button>
        <h3 class="share-title">Share</h3>
        <h4>{{sculptureTitle}}</h4>
        <form v-on:submit.prevent>
            <br/>
            <span>Em🛏️</span> <span v-if="showCopiedEmbedInfo" class="copy-to-clipboard">copied to clipboard</span>
            <input class="input w-input" type="" placeholder="" @focus="copyEmbed" v-model="embedUrl">
            <br/>
            <span>FullScreen 🎁</span> <span v-if="showCopiedFullScreenInfo" class="copy-to-clipboard">copied to clipboard</span>
            <br/>
            <input class="input w-input" type="" placeholder="" @focus="copyFullScreen" v-model="fullScreenUrl">
            <br/>
            <span>Edit ‎‍💻</span> <span v-if="showCopiedEditInfo" class="copy-to-clipboard">copied to clipboard</span>
            <br/>
            <input class="input w-input" type="" placeholder="" @focus="copyEdit" v-model="editUrl">
            <br/>
            
            <span><a href="https://glitch.com/~shader-park-template" target="_blank">
                Embed in Glitch.com <div class=".img-button glitch-button"></div>
            </a></span>
            <br/><br/>
            <span><a href="https://github.com/shader-park/shader-park-touchdesigner" target="_blank">
                Render in TouchDesigner <div class=".img-button touchdesigner-button"></div>
            </a></span>
            
        </form>
    </div>
</template>

<script>


export default {
	data: function() {
		return {
            showCopiedEmbedInfo: false,
            showCopiedEditInfo: false,
            showCopiedFullScreenInfo: false,
            shouldDisplay: false
		};
    },
    created() {
		this.$store.dispatch('getAllUserNames').then(userNames => {
            this.allUserNames = Object.keys(userNames);
		});
    },
    mounted() {
        setTimeout(() => this.shouldDisplay = true, 1);
    },
    computed: {
        currSculpture() {
            return this.$store.state.currSculpture;
        },
        embedUrl() {
            return `<iframe src="https://shaderpark.com/embed/${this.currSculpture.id}${this.isExample}" frameborder="0"></iframe>`;
        },
        fullScreenUrl() {
            return `https://shaderpark.com/embed/${this.currSculpture.id}${this.isExample}`;
        },
        editUrl() {
            return `https://shaderpark.com/sculpture/${this.currSculpture.id}${this.isExample}`;
        },
        sculptureTitle() {
            return this.currSculpture.title;
        },
        isExample() {
            if(this.currSculpture.isExample) {
                return '?example=true';
            } else {
                return ''
            }
        }

    },
    methods: {
        copyEmbed(el) {
            this.resetCopiedInfo();
            this.showCopiedEmbedInfo = true;
            this.copyUrl(el);
        },
        copyEdit(el) {
            this.resetCopiedInfo();
            this.showCopiedEditInfo = true;
            this.copyUrl(el);
        },
        copyFullScreen(el) {
            this.resetCopiedInfo();
            this.showCopiedFullScreenInfo = true;
            this.copyUrl(el);
        },
        resetCopiedInfo() {
            this.showCopiedEmbedInfo = false;
            this.showCopiedEditInfo = false;
            this.showCopiedFullScreenInfo = false;
        },
        copyUrl(element) {
            element.target.focus();
            const el = document.createElement('textarea');
            el.value = element.target._value;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        },
        close() {
            this.shouldDisplay = false
            setTimeout(() => this.$store.commit('displayShareModal', false), 300);	
        },
        copy() {
            console.log('copy')
        }
    }
};
</script>

<style lang="less">
@import '../client/mixins.less';

// .fade {
//     opacity: 1!important;
//     transition: opacity 300ms ease-in-out;;
// }
.share-title {
    margin-top: 0px;
}

.share-container {

    .mobile({
        width: 100vw;
        height: 100vh;
        min-width: auto;
    });
    &.fade {
        opacity: 1
    }
    min-width: 500px;
    opacity: 0;
    transition: opacity 300ms ease-in-out;;
    z-index: 102;
    background: white;
    // min-height: 100vh;
    // display: flex;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    // align-items: center;
    // justify-content: center;
    padding: 60px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .15);
}

.img-button {
    background-position: 50% 50%;
    width: 38px;
    height: 17px;
    background-size: 21px;
    border-style: none;
    background-repeat: no-repeat !important;
    background-attachment: scroll;
    background-color: transparent;
    display: inline-block !important;
}

.touchdesigner-button {
    display: inline-block !important;
    background-image: url('../client/images/touchdesigner_logo.jpg') !important;
    width: 19px;
    height: 19px;
    background-repeat: no-repeat !important;
    background-size: 19px;
}

.glitch-button {
    display: inline-block !important;
    background-image: url('../client/images/glitch_logo.svg') !important;
    width: 38px;
    height: 17px;
    background-repeat: no-repeat !important;
    background-size: 21px;
}

.close-auth {
  position: absolute;
  left: 14px;
  top: 14px;
  width: 34px;
  height: 34px;
  border-style: none;
  background-image: url('../client/images/close.svg');

  background-position: 50% 50%;
  background-size: 40px;
  background-repeat: no-repeat;
  background-attachment: scroll;
  background-color: transparent;
  opacity: 0.8;
}

.copy-to-clipboard {
    color: #50e3c2;
}

</style>
