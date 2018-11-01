<template>

<div :class="{embeded : isEmbeded}"  :style="{width: currWidth}" class="editor">
    <div class="editor-container" :style="{minWidth: cachedWidth}">
        <v-dialog/>
        <div class="controls">
            <input @keyup="()=>{}" 
                @keydown.stop="() => {}" 
                @click.stop="()=>{}" 
                v-bind:style="titleInput"
                classs="editor-input" v-model="sculptureTitle" placeholder="title">
            <span v-if="authorUsername !=='admin' && authorUsername">by 
                <router-link :to="userProfileRoute" tag="a">{{authorUsername}}</router-link>
            </span>
            <br/>
            <button @click.stop="save" class="save">{{saveText}}</button>
            <button @click.stop="play" v-if="!autoUpdate" class="play">Play</button>
            <button @click.stop="close" class="close">Close</button>
            <input class="checkbox" type="checkbox" value="AutoUpdate" v-model="autoUpdate">
            <label for="AutoUpdate">Auto Update</label>

            <input class="checkbox" v-if="isAdmin" type="checkbox"  value="Example" v-model="isExample">
            <label v-if="isAdmin" for="Example">Is Example</label>
            

            <button v-if="displayDelete" @click.stop="deleteSculpture" class="delete">Delete</button>
            <!-- <input type="text" id="editor-shader-title" size="60"></input> -->
            <!-- <span>by</span> -->
            <!-- <input type="text" id="editor-author-name" size="30"></input> -->
        </div>
        <div @keyup="()=>{}" @keydown.stop="()=>{removeEditorModalUI()}" @click.stop="()=>{}" ref="codeMirror" class="code-editor"> </div>
    </div>
</div>

</template>

<script>
import {sculptureStarterCode, fragFooter} from '../default-shader.js'
export default {
    props: {
        cachedWidth: { type: String, default: '49vw' }
    },
    data () {
        return {
            cm: null,
            initialized: false,
            isExample: false,
            autoUpdate: true,
            titleInput: {
                width: '5ch',
                border: 'none',
                marginBottom: '5px'
            },
            currWidth: '0px',
            editorHasDisplayedModal: false
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
        },
        selectedSculpture() {
            return this.$store.state.selectedSculpture;
        },
        currUser () {
			return this.$store.getters.getUser;
        },
        isAdmin() { //TEMPORARY TODO: add actual admin check
            return this.$store.getters.isAdmin;
        },
        displayDelete() {
            return this.selectedSculpture && this.currUser && this.currUser.uid && this.selectedSculpture.author.uid === this.currUser.uid;
        },
        authorUsername() {
            return this.selectedSculpture? this.selectedSculpture.author.username: null;
        },
        authorId() {
            return this.selectedSculpture? this.selectedSculpture.author.uid: null;
        },
        userProfileRoute() {
            return this.selectedSculpture? `/user/${this.selectedSculpture.author.username}`: $router.currentRoute.path;
        },
        sculptureTitle: {
            get : function() {
                return this.selectedSculpture? this.selectedSculpture.title: '';
            },
            set : function(value) {
                if(this.$store.state.selectedSculpture) {
                    this.$store.state.selectedSculpture.title = value;
                    this.titleInput.width = value.length + 'ch';
                }   
            }
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
        autoUpdate(value) {
            if(this.cm) {
                this.cm.autoUpdate = value;
            }
        },
        isExample(value) {
            this.selectedSculpture.isExample = value;
            console.log('set sculpture isExample to ' + value);
        },
        selectedSculpture(obj) {
            console.log('found Sculp form editor');
            if(obj) {
                if(obj.title) {
                    this.titleInput.width = obj.title.length + 'ch';
                }
                this.currWidth = this.cachedWidth;
                if(!this.initialized) {
                    this.initialized = true;
                    this.initCodeMirror(obj.sculpture.fragmentShader);
                    console.log('intitalizing code mirror');
                } else {
                    console.log(this.selectedSculpture.id);
                    this.cm.editor.setValue(obj.sculpture.fragmentShader);
                    this.isExample = this.selectedSculpture.isExample;
                    setTimeout(() => {
                        //calling refresh on without setTimeout breaks the editor
                        this.cm.editor.refresh();    
                    }, 0);
                }
            } else {
                this.currWidth = '0px';
            }
        }
    },
    methods: {
        save() {
            if(this.currUser != null) {
                this.$store.dispatch('saveSculpture', this.selectedSculpture);
            } else {
                // this.$router.push('sign-in');
                this.$store.commit('displayLogin', true);
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
        deleteSculpture() {
            this.$modal.show('dialog', {
                title: 'Delete Sculpture',
                text: 'Are you sure you want to delete this sculpture?',
                buttons: [{
                    title: 'Cancel',
                    handler: () => this.$modal.hide('dialog')
                },
                {
                    title: 'Delete',       // Button title
                    default: true,    // Will be triggered by default if 'Enter' pressed.
                    handler: () => {
                        alert('delete');
                        this.$modal.hide('dialog');
                    }
                }]
            })
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
        removeEditorModalUI() {
            if(this.cm && this.cm.helpers.activeModal && this.cm.helpers.activeModal.isVisible){
                console.log('click Active modal ' + this.editorHasDisplayedModal);
                if(this.editorHasDisplayedModal) {
                    cm.helpers.activeModal.removeModal();
                    console.log('removing Modal');
                    this.editorHasDisplayedModal = false;
                } else {
                    this.editorHasDisplayedModal = true;
                }
            } else {
                this.editorHasDisplayedModal = false;
            }
        },
        updateSculpture(){
        // _.debounce(function (e) {
            
            const fragmentShader = this.cm.editor.getValue();
            const currSculp = this.selectedSculpture;
            if(currSculp){ //&& this.cm.errorsDisplay.widgets.length !== 1) {
                currSculp.shaderSource = fragmentShader;
                // console.log('updated Sculp Code');
            } else {
                console.log('Sculp not updated because of Error in code');
            }

        },   
        initCodeMirror(shader) {
            
            this.prefix = `
            
            precision highp float;
            precision highp int;
            uniform vec3 cameraPosition;
            uniform mat4 viewMatrix;
            ` ;

            this.$nextTick(function() {
                if(!this.cm) {   
                    console.log('reinitializing CM');
                    this.cm = new GlslEditor(this.$refs.codeMirror, { 
                        canvas_size: 1,
                        canvas_draggable: false,
                        theme: 'default',
                        multipleBuffers: false,
                        watchHash: false,
                        fileDrops: false,
                        menu: false,
                        frag_header : this.prefix + sculptureStarterCode,
                        frag: shader,
                        frag_footer: fragFooter
                    });

                    document.querySelector('.ge_editor').addEventListener('click', () => {
                        console.log('click');
                        this.removeEditorModalUI();
                        
                    })
                }
                window.cm = this.cm;
                this.cm.shader.canvas.on('processedShader', (data) => {
                    if(this.autoUpdate && !data.containsError) {
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

.editor-input {
    border: none !important;
    margin-bottom: 5px !important;
    margin-left: 5px !important;
}

.delete, .close {
    float: right;
    margin-right: 10px;
}
.dialog-c-text {
    padding: 0px 20px 10px 20px;
}
.dialog-c-title {
    text-align: center;
    font-size: 17px;
}

.vue-dialog-button {
    font-size: 14px !important;
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
    max-width: 100%;
}

.CodeMirror {
    margin-top: 0px !important;
}
.ge_canvas {
    display: none;
}

.editor {
    &.embeded {
        top: 0px;
    }
    overflow: hidden;
    // position: absolute;
    top: 85px;
    // right: 0px;
}

</style>