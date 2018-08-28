<template>

<div v-show="selectedSculpture != null" class="editor">
    <div class="controls">
        <button @click="save" class="save">Save</button>
        <button @click="play" class="play">Play</button>
        <button @click="close" class="close">Close</button>
        <!-- <input type="text" id="editor-shader-title" size="60"></input> -->
        <!-- <span>by</span> -->
        <!-- <input type="text" id="editor-author-name" size="30"></input> -->
    </div>
    <div ref="codeMirror" class="code-editor"> </div>
</div>

</template>

<script>

export default {
    data () {
        return {
            cm: null,
            initialized: false
        }
    },
    computed : {
        selectedSculpture() {
            return this.$store.state.selectedSculpture;
        }
    },
    watch : {
        selectedSculpture(obj) {
            console.log('found Sculp form editor');
            if(obj) {
                if(!this.initialized) {
                    this.initialized = true;
                    this.initCodeMirror(obj.sculpture.fragmentShader);
                } else {
                    this.cm.editor.setValue(obj.sculpture.fragmentShader);
                }
            }
        }
    },
    methods: {
        save() {
            console.log('save');
        },
        play() {
            this.updateSculpture();
            console.log('play');
        },
        close() {
            this.$store.state.selectedSculpture = null;
        },
        updateSculpture() {
            const fragmentShader = this.cm.editor.getValue();
            const currSculp = this.selectedSculpture;
            if(currSculp) {
                currSculp.sculpture.refreshMaterial(fragmentShader);
            }
            console.log('updated code');
        },
        initCodeMirror(shader) {
            
            const prefix = `
            #extension GL_EXT_frag_depth : enable
            precision highp float;
            precision highp int;
            uniform vec3 cameraPosition;
            uniform mat4 viewMatrix;
            ` ;

            this.$nextTick(function() {
				this.cm = new GlslEditor(this.$refs.codeMirror, { 
                    canvas_size: 1,
                    canvas_draggable: false,
                    theme: 'default',
                    multipleBuffers: false,
                    watchHash: false,
                    fileDrops: false,
                    menu: false,
                    frag_header : prefix
                });
                this.cm.editor.setValue(shader);
                this.cm.editor.on('change', () => this.updateSculpture());	
            });
        }
    }
}

</script>
<style>
@import '../codemirror/glslEditor.css';

.ge_editor {
    height: auto;
    overflow: scroll;
    max-height: 80vh;
    max-width: 45vw;
}

.CodeMirror {
    margin-top: 0px !important;
}
.ge_canvas {
    display: none;
}

.editor {
    
    position: absolute;
    top: 140px;
    right: 0px;
}

</style>