<template>

<div :class="{embeded : isEmbeded}" :style="{width: currWidth}" class="action-bar">
    <!-- <div class="action-bar-container" :style="{minWidth: cachedWidth}">
    </div> -->
</div>

</template>

<script>

export default {
    props: {
        cachedWidth: { type: String, default: '50vw' }
    },
    data () {
        return {
            currWidth: '100vw'
        }
    },
    components: {
        
    },
    mounted() {
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
        }
    },
    watch : {
        cachedWidth(value) {
            if(this.currWidth != '0px') {
                this.currWidth = this.cachedWidth;
            }
        },
    },
    methods: {
        onCmReady(cm) {
            // window.cm = cm;
        },
    }
}

</script>


<style lang="less" scoped>

.action-bar {
    // width: 100vw;
    height: 4vh;
    position: fixed;
    bottom: 0px;
    right: 0px;
    // left: 0px;
    background: black;
    z-index: 10;
}

</style>