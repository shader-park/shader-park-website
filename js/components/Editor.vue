<template>

<div :class="{embeded : isEmbeded}"  :style="{width: currWidth}" class="editor">
    <div class="editor-container" :style="{minWidth: cachedWidth}">
        <v-dialog/>
        <div class="controls">
            <input @keyup="()=>{}" 
                @keydown.stop="() => {}" 
                @click.stop="()=>{}" 
                v-bind:style="titleInput"
                classs="editor-input centerY"  v-model="sculptureTitle" placeholder="title">
            <span v-if="authorUsername !=='admin' && authorUsername" class="username centerY">by 
                <router-link  :to="userProfileRoute" tag="a">{{authorUsername}}</router-link>
            </span>
            <button @click.stop="close" class="close centerY editor-button">Close</button>
            <button @click.stop="share" v-if="displayShare" class="save centerY editor-button">Share</button>
            <button @click.stop="save" class="save centerY editor-button">{{saveText}}</button>
            
            
            <label class="autoUpdate-label centerY" for="AutoUpdate">Auto Update</label>
            <input  class="checkbox centerY" :style="{marginLeft: '10px'}" type="checkbox" value="AutoUpdate" v-model="autoUpdate">
            <button @click.stop="play" v-if="!autoUpdate" class="play centerY editor-button">Play</button>

            <label class="autoUpdate-label centerY" v-if="isAdmin" for="Example">Is Example</label>
            <input class="checkbox centerY" v-if="isAdmin" type="checkbox"  value="Example" v-model="isExample">
            
            

            <button v-if="displayDelete" @click.stop="deleteSculpture" class="delete centerY editor-button">Delete</button>
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
            editorContainsErrors: false,
            titleInput: {
                width: '5ch',
                border: 'none',
                marginBottom: '5px',
                fontSize: '19px',
                marginLeft: '5px;',
                position: 'relative',
                top: '50%',
                transform: 'translateY(-50%)'
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
                if(!this.selectedSculpture.uid || this.$store.getters.getUser && this.$store.getters.getUser.uid == this.selectedSculpture.uid) {
                    return 'Save';
                } else {
                    return 'Save as Fork';
                }
            }
            return 'Save';
        },
        displayShare() {
            return this.selectedSculpture && this.selectedSculpture.id.length > 3;
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
            return this.selectedSculpture && this.currUser && this.currUser.uid && this.selectedSculpture.uid === this.currUser.uid;
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
        sculptureTitle: {
            get : function() {
                return this.selectedSculpture? this.selectedSculpture.title: '';
            },
            set : function(value) {
                if(this.$store.state.selectedSculpture) {
                    this.$store.state.selectedSculpture.title = value;
                    this.titleInput.width = value.length + 1 + 'ch';
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
        share() {
            const el = document.createElement('textarea');
            let example = this.selectedSculpture.isExample? '?example=true' :'';
            el.value = `https://shader-park.appspot.com/sculpture/${this.selectedSculpture.id}${example}`;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        },
        exportSculpture() {
            console.log(this.selectedSculpture);
            const data = this.selectedSculpture.sculpture.generateMesh(0.0);
            console.log(data);
            let count = 0;
                for (let i=0; i<data.length; i++) {
                count += data[i];
            }
                console.log("sum: " + count);
            console.log('export that shith');
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
                        this.$store.dispatch('deleteSculpture', this.selectedSculpture).then(() => {
                            this.$store.dispatch('removeSelectedSculptureFromScene');
                            this.$store.state.selectedSculpture = null;
                        })
                        this.$modal.hide('dialog');
                    }
                }]
            })
        },
        keypress(down, e) {
            if (e.key === 'Escape') {
            	this.close();
            }
            // if (e.key === 'Enter') {
            //     if(this.selectedSculpture) {
            //         this.play();
            //     }
            	
            // }
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

                    let editor = document.querySelector('.ge_editor');
                    if(this.isEmbeded) {
                        editor.classList.add('embed');
                    }
                    editor.addEventListener('click', () => {
                        console.log('click');
                        this.removeEditorModalUI();
                    });

                }
                window.cm = this.cm;
                this.cm.shader.canvas.on('processedShader', (data) => {
                    this.editorContainsErrors = data.containsError;
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

.editor-button {
    padding: 5px 15px 5px 15px;
    border-radius: 50px;
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

.centerY{
    position: relative;
    top:50%;
    transform: translateY(-50%);
}

.username {
    position: absolute !important;
    font-size: 17px;
}

.controls {
    min-height: 50px;
    position: relative;
    height: 8vh;
    border-bottom: 2px solid #f5f5f5;
    padding-left: 20px;
    padding-right: 20px;
}

.save {
    margin-left: 5px;
}


.close {
    background-color: #777;
    color:white;
    transition: bacground-color 300ms ease-in-out, color 300ms ease-in-out;
    -webkit-transition: background-color 300ms ease-in-out, color 300ms ease-in-out;
    &:hover {
        background-color: white;
    }
    
}
.delete, .close, .save, .autoUpdate-label, .checkbox, .play {
    float: right;
    margin-left: 10px;
}

.autoUpdate-label {
    font-weight: normal;
    margin-left: 5px !important;
    color: #777;
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
    overflow: scroll !important;
    max-height: 82vh;
    max-width: 100%;
    &.embed {
        max-height: 92vh;
    }
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
