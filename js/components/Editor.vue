<template>

<div :class="{embeded : isEmbeded}" :style="{width: currWidth}" class="editor">
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
            <button @click.stop="close" class="close centerY editor-button"></button>
            <button @click.stop="share" v-if="displayShare" class="save centerY editor-button share" ref="share">{{shareText}}</button>
            <button @click.stop="save" class="save centerY editor-button">{{saveText}}</button>
            
            
            <label class="autoUpdate-label centerY" for="AutoUpdate">Auto Update</label>
            <input  class="checkbox centerY" :style="{marginLeft: '10px'}" type="checkbox" value="AutoUpdate" v-model="autoUpdate">
            <button @click.stop="play" v-if="!autoUpdate" class="play centerY editor-button"></button>

            <label class="autoUpdate-label centerY" v-if="isAdmin" for="Example">Is Example</label>
            <input class="checkbox centerY" v-if="isAdmin" type="checkbox"  value="Example" v-model="isExample">
            
            

            <button v-if="displayDelete" @click.stop="deleteSculpture" class="delete centerY editor-button">Delete</button>
            <!-- <input type="text" id="editor-shader-title" size="60"></input> -->
            <!-- <span>by</span> -->
            <!-- <input type="text" id="editor-author-name" size="30"></input> -->
        </div>
        
        <!-- <div @keyup="()=>{}" @keydown.stop="()=>{removeEditorModalUI()}" @click.stop="()=>{}" ref="codeMirror" class="code-editor"> </div> -->
        <!-- <codemirror ref="myCm"
            :value="code" 
            :options="cmOptions"
            @ready="onCmReady"
            @focus="onCmFocus"
            @input="onCmCodeChange">
        </codemirror> -->
        <codemirror ref="myCm"
            :value="code" 
            :options="cmOptions"
            @ready="onCmReady"
            @input="onCmCodeChange" @keydown.stop="()=>{}" @click.stop="()=>{}">
        </codemirror>
        <div class="bottom-controls">
            <button  @click.stop="download" class="centerY editor-button">Download Source</button>
        </div>
    </div>
</div>

</template>

<script>
import { codemirror } from 'vue-codemirror'
import {sculptToThreeJSShaderSource} from 'sculpture-park-core';

import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/keymap/sublime.js';

export default {
    props: {
        cachedWidth: { type: String, default: '49vw' }
    },
    data () {
        return {
            cm: null,
            code: '',
            cmOptions: {
                tabSize: 4,
                mode: 'text/javascript',
                theme: 'default',
                lineNumbers: true,
                matchBrackets: true,
                keyMap: 'sublime',
                autoCloseBrackets: true,
                line: true,
                viewportMargin: Infinity,
            },
            initialized: false,
            isExample: false,
            autoUpdate: true,
            closed: false,
            editorContainsErrors: false,
            saved: true,
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
            shareText : '',
            currWidth: '0px',
            editorHasDisplayedModal: false
        }
    },
    components: {
        codemirror
    },
    mounted() {
        document.addEventListener('keydown', this.keypress.bind(null, true));
        // document.addEventListener('keyup', this.keypress.bind(null, false));
    },
    computed : {
        codemirror() {
            return this.$refs.myCm.codemirror;
        },

        saveText() {
            if(this.selectedSculpture) {
                if(!this.selectedSculpture.uid || this.$store.getters.getUser && this.$store.getters.getUser.uid == this.selectedSculpture.uid) {
                    if(this.selectedSculpture.saved) {
                        return 'Saved';
                    } else {
                        return 'Save';
                    }
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
            if(value) {
                this.onCmCodeChange(this.code);
            }
            // if(this.cm) {
            //     this.cm.autoUpdate = value;
            // }
        },
        isExample(value) {
            this.selectedSculpture.isExample = value;
        },
        selectedSculpture(obj) {
            if(obj) {
                if(obj.title) {
                    this.titleInput.width = obj.title.length + 'ch';
                }
                this.currWidth = this.cachedWidth;
                if(!this.initialized) {
                    this.code = obj.shaderSource;
                    this.initialized = true;
                } else {
                    this.closed = false;
                    this.code = obj.shaderSource;
                    this.isExample = obj.isExample;
                }
                let interval = setInterval(() => this.codemirror.refresh(), 10);
                setTimeout(() => {
                    this.codemirror.refresh()
                    clearInterval(interval);
                //     this.saved = tempSaved;
                }, 1000);
            } else {
                this.currWidth = '0px';
            }
        }
    },
    methods: {
        onCmReady(cm) {
            window.cm = cm;
        },
        onCmFocus(cm) {
        },
        onCmCodeChange(newCode) {
            if(newCode !== this.selectedSculpture.shaderSource){
                this.selectedSculpture.saved = false;
                this.$store.commit('setUnsavedChanges', {[this.selectedSculpture.id] : false})
            }
            this.code = newCode;
            if(this.autoUpdate) {
                if(this.selectedSculpture){
                    this.selectedSculpture.shaderSource = this.code; 
                }
            }
        },
        save() {
            return new Promise((resolve, reject) => {
                if(this.currUser != null) {
                    let id = this.selectedSculpture.id;
                    this.$store.dispatch('saveSculpture', this.selectedSculpture).then(() => {
                        this.selectedSculpture.saved = true;
                        this.$store.commit('setUnsavedChanges', {[id] : true});
                        resolve();
                    });
                } else {
                    // this.$router.push('sign-in');
                    this.$store.commit('displayLogin', true);
                    reject();
                }
            });
        },
        play() {
            if(this.selectedSculpture){
                this.selectedSculpture.shaderSource = this.code; 
            }
        },
        share() {
            let shareEl = this.$refs.share;
            if(shareEl.classList.contains('selected')) {
                shareEl.classList.remove('selected');
                this.shareText = '';
            } else {
                shareEl.classList.add('selected');
                this.shareText = 'Copied URL';
            }
            const el = document.createElement('textarea');
            let example = this.selectedSculpture.isExample? '?example=true' :'';
            el.value = `https://shader-park.appspot.com/sculpture/${this.selectedSculpture.id}${example}?hideeditor=true&hidepedestal=true`;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        },
        download() {
            let output = sculptToThreeJSShaderSource(this.code);
            let spExport = output.geoGLSL + '\n' + output.colorGLSL;
            output['spExport'] = spExport;
            console.log(output);
        },
        exportSculpture() {
            //Unused
        },
        close() {
            let close = () => {
                this.closed = true;
                this.shareText = '';
                this.$store.state.selectedSculpture = null;
                this.$store.state.selectedObject = null;
            };
            if(this.selectedSculpture.saved) {
                close();
            } else {
                this.$modal.show('dialog', {
                    title: 'Unsaved Changes',
                    text: 'Do you want to save before closing the editor?',
                    buttons: [{
                        title: 'Cancel',
                        handler: () => this.$modal.hide('dialog')
                    },
                    {
                        title: 'Close',       // Button title
                        handler: () => {
                            close();
                            this.$modal.hide('dialog')
                        }
                    },
                    {
                        title: 'Save & Close',       // Button title
                        default: true,    // Will be triggered by default if 'Enter' pressed.
                        handler: () => {
                            this.save().then(() => {
                                this.$modal.hide('dialog');
                                close();
                            });
                        }
                    }]
                })
            }
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
                if(this.editorHasDisplayedModal) {
                    cm.helpers.activeModal.removeModal();
                    this.editorHasDisplayedModal = false;
                } else {
                    this.editorHasDisplayedModal = true;
                }
            } else {
                this.editorHasDisplayedModal = false;
            }
        }
    }
}

</script>
<style lang="less" scoped>

@import '../codemirror/glslEditor.css';
@import 'codemirror/lib/codemirror.css';

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
    border-bottom: 2px solid #f5f5f5;
}

.controls, .bottom-controls {
    min-height: 50px;
    position: relative;
    height: 8vh;
    
    padding-left: 20px;
    padding-right: 20px;
    overflow: hidden;
}

.bottom-controls {
    border-top: 2px solid #f5f5f5;
    position: absolute;
    width: 100%;
    bottom: 0px;
}

.save {
    margin-left: 5px;
}

.control-button {
    opacity: 0.6;
    background-repeat: no-repeat;
    // box-shadow: none;
    transition: opacity 300ms ease-in-out;
    -webkit-transition: opacity 300ms ease-in-out;
    &:hover {
        // box-shadow: none;
        opacity: 1.0;
    }
}

.close {
    background-color: #777;
    color:white;
    transition: bacground-color 300ms ease-in-out, filter 300ms ease-in-out;
    -webkit-transition: background-color 300ms ease-in-out, filter 300ms ease-in-out;
    width: 28px;
    height: 28px;
    border-style: none;
    background-image: url('/images/close-white.svg');
    background-position: 50% 50%;
    background-size: 16px;
    background-repeat: no-repeat;
    background-attachment: scroll;
    filter: invert(0);
    &:hover {
        filter: invert(1);
        // fill: black;
        background-color: black;
    } 
}

.play {
    .control-button();
    height: 30px;
    width: 30px;
    background-position: 65% 50%;
    background-size: 16px;
    background-image: url('/images/play.svg');
}

.share {
    width: 38px;
    height: 30px;
    border-style: none;
    background-image: url('/images/share.svg');
    background-position: 60% 50%;
    background-size: 22px;
    .control-button();
    &.selected{
        background-size: 0 0;
        width: auto;
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

.CodeMirror-scroll {
    height: auto;
    overflow: scroll !important;
    max-height: 81vh;
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
    // top: 85px;
    position: relative;
    // right: 0px;
}

.vue-codemirror {
    max-height: 74vh;
    overflow: scroll;
}

.CodeMirror-hints{
    z-index: 100;
}

</style>
