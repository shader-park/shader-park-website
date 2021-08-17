<template>
    <div class="main" :class="{embeded: isEmbeded}">
        <editor :cachedWidth="editorWidth" :class="{dragging: dragingMouse}" ></editor>
        <div v-show="showHandel" ref="handel" class="handle" :class="{dragging: dragingMouse}">
            <ul class="dot-container">
                <li class="dot"></li>
                <li class="dot"></li>
                <li class="dot"></li>
            </ul>
        </div>
        <div ref="threeCanvas" class="canvas-container" :class="{dragging: dragingMouse}"></div>
        <div class="actions-bar"></div>
        <actionBar :cachedWidth="actionsBarWidth" :dragging="dragingMouse" :class="{dragging: dragingMouse}"></actionBar>
        <sculptureFeed :cachedWidth="actionsBarWidth" :dragging="dragingMouse" :class="{dragging: dragingMouse}"></sculptureFeed>
    </div>
</template>

<script>
import firebase from "firebase/app";
import Editor from "./Editor.vue";
import ActionBar from "./ActionBar.vue";
import SculptureFeed from "./SculptureFeed.vue";
import Sculpture from './Sculpture.vue';

export default {
    data: function() {
		return {
            dragingMouse: false,
            editorWidth: '49vw',
            editorWidth: '49vw',
            actionsBarWidth: '100vw',
            cachedActionsBarWidth: 'calc(51vw - 30px)',
            handelWidth: 30,
            showHandel: false,
            mounted: false
		}
    },
    components: {
        editor: Editor,
        actionBar: ActionBar,
        sculptureFeed: SculptureFeed,
        Sculpture
    },
    computed : {
        canvasSize() {
            if(!this.mounted) {
                return 0
            } else {
                return this.$refs.threeCanvas.clientWidth;
            }
        },
        selectedSculpture() {
            return this.$store.state.selectedSculpture;
        },
        isEmbeded() {
            return this.$store.state.embedded;
        }
    },
    watch : {
        canvasSize(value) {
            let canvas = this.$refs.threeCanvas;
            if(canvas && canvas.clientWidth) {
                this.$store.commit('setCanvasSize', {width: canvas.clientWidth, height: canvas.clientHeight});
            }
            
        },
        selectedSculpture(isSelected) {
            this.showHandel = isSelected != null;
            if(isSelected) {
                this.actionsBarWidth = this.cachedActionsBarWidth;
            } else {
                this.actionsBarWidth = '100vw';
            }
        }
    },
    mounted() {
        this.$nextTick(function () {
            let handel = this.$refs.handel;
            handel.addEventListener('mousedown', this.mouseDown);
            let appEl =  document.getElementById('app');
            window.addEventListener('mousemove', this.mouseMove);
            window.addEventListener('mouseup', this.mouseDrag);
            this.mounted = true;
		})
    },
    methods: {
        mouseDown() {
            this.dragingMouse = true;
        },
        mouseMove(event) {
            if(this.dragingMouse) {
                let newWidth = ((event.clientX - this.handelWidth) / window.innerWidth) * 100;
                this.editorWidth = `calc(${newWidth}vw + ${this.handelWidth/2}px)`;
                this.actionsBarWidth = `calc(${100 - newWidth}vw - ${this.handelWidth * 1.5}px)`;
                let canvas = this.$refs.threeCanvas;
                if(canvas) {
                    canvas.style.width = this.actionsBarWidth;
                    this.$store.commit('setCanvasSize', {width: canvas.clientWidth, height: canvas.clientHeight});
                }
                this.cachedActionsBarWidth = this.actionsBarWidth;
            }
        },
		mouseDrag() {
			this.dragingMouse = false;
        },
    },

    beforeDestroy() {
        let handel = this.$refs.handel;
        handel.removeEventListener('mousedown', this.mouseDown);
        let appEl =  document.getElementById('app');

        window.removeEventListener('mousemove', this.mouseMove);
        window.removeEventListener('mouseup', this.mouseDrag);
    },

};
</script>

<style lang="less">

.main {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 100%;
    height: 90vh;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    flex-wrap: nowrap;
    -webkit-box-align: stretch;
    -webkit-align-items: stretch;
    -ms-flex-align: stretch;
    align-items: stretch;
    -webkit-align-content: stretch;
    -ms-flex-line-pack: stretch;
    align-content: stretch;
    transition: width 300ms ease-in-out;
    &.embeded {
        height: 100vh;
    }
}

.dragging {
    cursor: ew-resize !important;
    transition: width 0ms ease-in-out !important;
}

.editor {
    width: 49%;
    -webkit-box-flex: 0;
    -webkit-flex: 0 auto;
    -ms-flex: 0 auto;
    flex: 0 auto;
    transition: width 300ms ease-in-out;
}

canvas {
    outline: none;
}

.canvas-container {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    transition: width 300ms ease-in-out;
    width: 0%;
}

.handle {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    -webkit-user-drag: none;
    display: flex;
    width: 30px;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-flex: 0;
    -webkit-flex: 0 auto;
    -ms-flex: 0 auto;
    flex: 0 auto;
    border-right: 2px solid #f5f5f5;
    border-left: 2px solid #f5f5f5;
    cursor: ew-resize;
}

.dot-container {
    width: 100%;
    padding-left: 27px;
    -webkit-transition: opacity 300ms ease-in-out;
    transition: opacity 300ms ease-in-out;
    &:hover {
        opacity: 1;
    }
    .dot {
        height: 20px;
        opacity: 0.8;
        user-select: none;
    }
}

</style>
