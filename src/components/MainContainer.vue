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
    </div>
</template>

<script>
import firebase from "firebase/app";
import Editor from "./Editor.vue";

export default {
    data: function() {
		return {
            dragingMouse: false,
            editorWidth: '49vw',
            handelWidth: 30,
            showHandel: false
		}
    },
    components: {
        editor: Editor
    },
    computed : {
        canvasSize() {
            if(this.$refs.threeCanvas) {
                return this.$refs.threeCanvas.clientWidth;
            } else {
                return 0;
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
            this.$store.commit('setCanvasSize', {width: canvas.clientWidth, height: canvas.clientHeight});
        },
        selectedSculpture(value) {
            this.showHandel = value != null;
        }
    },
    mounted() {
        this.$nextTick(function () {
            let handel = this.$refs.handel;
            handel.addEventListener('mousedown', this.mouseDown);
            let appEl =  document.getElementById('app');
            appEl.addEventListener('mousemove', this.mouseMove);
            window.addEventListener('mouseup', this.mouseDrag);
		})
    },
    methods: {
        mouseDown() {
            this.dragingMouse = true;
        },
        mouseMove(event) {
            (event) => {
                if(this.dragingMouse) {
                    this.editorWidth = ((event.clientX - this.handelWidth) / appEl.clientWidth) * 100 + 'vw';
                }
            }
        },
		mouseDrag() {
			this.dragingMouse = false;
        },
    },

    destroyed() {
        let handel = this.$refs.handel;
        handel.removeEventListener('mousedown', this.mouseDown);
        let appEl =  document.getElementById('app');
        appEl.removeEventListener('mousemove', this.mouseMove);
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
    cursor: pointer;
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
}

.dot-container {
    width: 100%;
    padding-left: 28px;
    -webkit-transition: opacity 300ms ease-in-out;
    transition: opacity 300ms ease-in-out;
    cursor: pointer;
    &:hover {
        opacity: 1;
    }
    .dot {
        height: 20px;
        opacity: 0.8;
    }
}

</style>
