<template>
<div v-if="selectedSculpture" ref="codeMirror" class="editor">
    <div class="controls">
        <button @click="save" class="save">Save</button>
        <button @click="play" class="play">Play</button>
        <button @click="close" class="close">Close</button>
        <!-- <input type="text" id="editor-shader-title" size="60"></input> -->
        <!-- <span>by</span> -->
        <!-- <input type="text" id="editor-author-name" size="30"></input> -->
    </div>
</div>

</template>

<script>
export default {
    data () {
        return {
            cm: CodeMirror(this.$refs.codeMirror, {
                value: "/* shader source goes here */",
                mode: "text/x-csrc",
                keyMap: "sublime",
                lineNumbers: true
            })
        }
    },
    computed : {
        selectedSculpture() {
            return this.$store.getters.selectedSculpture;
        }
    },
    watch : {
        selectedSculpture(sculp) {
            if(sculp) {
                this.cm.setValue(sculp.shaderSource);
            }
        }
    },
    mounted() {

    },
    methods: {
        save() {
            console.log('save');
        },
        play() {
            console.log('play');
        },
        close() {
            this.$store.selectedSculpture = null;
        }
    }
}

</script>

<style>

</style>
