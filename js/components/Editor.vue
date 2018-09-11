<template>

<div  v-show="selectedSculpture != null" class="editor">
    <div class="controls">
        <button @click.stop="save" class="save">{{saveText}}</button>
        <button @click.stop="play" class="play">Play</button>
        <button @click.stop="close" class="close">Close</button>
        <input class="checkbox" type="checkbox" value="AutoUpdate" v-model="autoUpdate">
        <label for="AutoUpdate">Auto Update</label>

        <input class="checkbox" v-if="isAdmin" type="checkbox"  value="Example" v-model="isExample">
        <label v-if="isAdmin" for="Example">Is Example</label>
        <!-- <input type="text" id="editor-shader-title" size="60"></input> -->
        <!-- <span>by</span> -->
        <!-- <input type="text" id="editor-author-name" size="30"></input> -->
    </div>
    <div @click.stop="()=>{}" ref="codeMirror" class="code-editor"> </div>
</div>

</template>

<script>

export default {
    data () {
        return {
            cm: null,
            initialized: false,
            isExample: false,
            autoUpdate: true
        }
    },
    mounted() {
        console.log('mounted editor');
        document.addEventListener('keydown', this.keypress.bind(null, true));
        document.addEventListener('keyup', this.keypress.bind(null, false));
    },
    computed : {
        saveText() {
            if(this.selectedSculpture) {
                if(!this.selectedSculpture.author.uid || this.$store.getters.getUser && this.$store.getters.getUser.uid == this.selectedSculpture.author.uid) {
                    return 'Save';
                } else {
                    return 'Save as Fork';
                }
            }
            return 'Save';
            // if((this.selectedSculpture && this.selectedSculpture.author.uid) &&
            //    (this.$store.getters.getUser && this.$store.getters.getUser.uid == this.selectedSculpture.author.uid)) {
            //     return 'Save';
            // } else if(!this.selectedSculpture.author.uid) {
            //     return 'Save'
            // }else {
            //     return "Save as Fork";
            // }
        },
        selectedSculpture() {
            return this.$store.state.selectedSculpture;
        },
        currUser () {
			return this.$store.getters.getUser;
        },
        isAdmin() { //TEMPORARY TODO: add actual admin check
            return this.$store.getters.isAdmin;
        }
    },
    watch : {
        isExample(value) {
            this.selectedSculpture.isExample = value;
            console.log('set sculpture isExample to ' + value);
        },
        selectedSculpture(obj) {
            console.log('found Sculp form editor');
            if(obj) {
                if(!this.initialized) {
                    this.initialized = true;
                    this.initCodeMirror(obj.sculpture.fragmentShader);
                } else {
                    this.cm.editor.setValue(obj.sculpture.fragmentShader);
                    this.isExample = this.selectedSculpture.isExample;
                    console.log('ID:' + this.selectedSculpture.id)
                }
            }
        }
    },
    methods: {
        save() {
            if(this.currUser != null) {
                this.$store.dispatch('saveSculpture', this.selectedSculpture);
            } else {
                this.$router.push('sign-in');
            }
            console.log('save');
        },
        play() {
            this.updateSculpture();
            console.log('play');
        },
        close() {
            this.$store.state.selectedSculpture = null;
            this.$store.state.selectedObject = null;
        },
        keypress(down, e) {
            if (e.key === 'Escape') {
            	this.close();
            }
            if (e.key === 'Enter') {
                if(this.selectedSculpture) {
                    this.play();
                }
            	
            }
        },
        updateSculpture(){
        // _.debounce(function (e) {
  
            const fragmentShader = this.cm.editor.getValue();
            const currSculp = this.selectedSculpture;
            console.log(!this.codeContainsErrors + 'does not cointains err')
            if(currSculp && this.cm.errorsDisplay.widgets.length !== 1) {
                currSculp.shaderSource = fragmentShader;
                // currSculp.sculpture.setShaderSource(fragmentShader);
                // currSculp.sculpture.refreshMaterial();
            }
            console.log('updated code');
        // }),
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
                window.cm = this.cm;
                this.cm.editor.setValue(shader);
                this.cm.editor.on('change', () => {
                    if(this.autoUpdate) {
                        this.updateSculpture();
                    }
                });	
            });
        }
    }
}

</script>
<style lang="less">

@import '../codemirror/glslEditor.css';

button {
    padding: 5px 15px 5px 15px;
    /* border: 1px solid lightgrey; */
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.15);
    margin-bottom: 5px;
    transition: color 300ms ease-in-out, box-shadow 300ms ease-in-out ;
        color: #777;
    -webkit-transition: color 300ms ease-in-out, box-shadow 300ms ease-in-out ;
    &:hover {
        color: #000;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
    }        

}

label {
    display: inline;
}

.checkbox {
    margin-left: 5px;
    margin-right: 5px;
}

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