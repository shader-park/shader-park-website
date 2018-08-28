<template>

<div class="editor">
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
            cm: null
        }
    },
    computed : {
        selectedSculpture() {
            return this.$store.state.selectedSculpture;
        },
        selectedSculptureClass() {
            return this.selectedSculpture != null? "block" : "none";
        }
    },
    mounted() {
        console.log('mounted Editor');
        console.log(this.$refs.codeMirror);
        const prefix = `
		#extension GL_EXT_frag_depth : enable
		precision highp float;
		precision highp int;
		uniform vec3 cameraPosition;
		uniform mat4 viewMatrix;
		` ;
        this.cm = new GlslEditor(this.$refs.codeMirror, { 
            canvas_size: 100,
            canvas_draggable: false,
            theme: 'default',
            multipleBuffers: false,
            watchHash: false,
            fileDrops: false,
            menu: false,
            frag_header : prefix
        });
        this.cm.editor.on('change', () => {
            this.codeUpdated();
        });


        // this.cm = CodeMirror(this.$refs.codeMirror, {
        //         value: "/* shader source goes here */",
        //         mode: "text/x-csrc",
        //         keyMap: "sublime",
        //         lineNumbers: true
        // });
        // if(this.selectedSculpture) {
        //     this.cm.setValue(obj.sculpture.fragmentShader);
        // }
    },
    watch : {
        selectedSculpture(obj) {
            console.log('found Sculp form editor');
            if(obj) {
                if(this.cm) {
                    this.cm.editor.setValue(obj.sculpture.fragmentShader);
                    window.cm = this.cm;
                }
                
            }
        }
    },
    methods: {
        save() {
            console.log('save');
        },
        play() {
            console.log('play');
        },
        close() {
            this.$store.state.selectedSculpture = null;
        },
        codeUpdated() {
            
            const fragmentShader = this.cm.editor.getValue();
            console.log(fragmentShader);
            const currSculp = this.selectedSculpture;
            if(currSculp) {
                currSculp.sculpture.refreshMaterial(fragmentShader);
            }
            console.log('updated code');
        }
    }
}

</script>
<style scoped>
@import '../codemirror/glslEditor.css';

.ge_canvas {
    display: none;
}

.editor {
    
    position: absolute;
    top: 210px;
    right: 0px;
}

</style>