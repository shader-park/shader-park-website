<template>
	<div></div>
</template>

<script>
import * as dat from 'dat.gui';
import { Object3DIdCount } from 'three';

export default {
	data: function() {
		return {
			guiParams: {},
			guiEl: {},
			currUniforms: {},
		}
	},
	computed: {
		selectedSculpture() {
			return this.$store.state.selectedSculpture;
		},
		selectedSculptureUniforms() {
			if(this.$store.state.selectedSculpture) {
				return this.$store.state.selectedSculpture.sculpture.uniforms;
			} else {
				return null;
			}
		},
		sculpturesLoaded() {
			return this.$store.state.sculpturesLoaded;
		}
	},
	watch : {
        guiParams: {
            immediate: true,
            deep: true,
            handler: function(payload) {
                if(payload) {
                    Object.keys(payload).forEach(uniform => {
                        let stateUniform = this.$store.state.selectedSculpture.sculpture.uniforms.find(el => el.name == uniform);
                        if(stateUniform) {
                            stateUniform.value = payload[uniform];
                        }
					});
					if(this.gui) {
						for (var i in this.gui.__controllers) {
							this.gui.__controllers[i].updateDisplay();
						}
					}
                }
            }
        },
		selectedSculptureUniforms(uniforms) {
			const uniformsToSkip = {'time':0, 'opacity': 0, "stepSize": 0, 'mouse':0, 'sculptureCenter':0};
			if(uniforms) {
				uniforms = uniforms.filter(uniform => !(uniform.name in uniformsToSkip));
			}
			
			if(uniforms && uniforms.length){
				this.gui.domElement.style.display = 'block';
				uniforms.forEach(uniform => {
					if(!(uniform.name in this.guiParams)) {
						this.addUniformToGUI(uniform);
					} else if (!(JSON.stringify(this.currUniforms[uniform.name]) === JSON.stringify(uniform))) {
						//value in uniform changed, so update it.
						this.removeUniformFromGUI(uniform.name);
						this.addUniformToGUI(uniform);
					}
				});
				//uniform has been removed
				if(uniforms.length < Object.keys(this.guiEl).length) {
					let uniformsToDelete = Object.keys(this.currUniforms).filter(uniformName => !uniforms.find(uniform => uniform.name === uniformName));
					if(uniformsToDelete && uniformsToDelete.length) {
						this.removeUniformFromGUI(this.currUniforms[uniformsToDelete[0]].name);
					}
				}
				
				if(uniforms.length === 0 ) {
					this.gui.domElement.style.display = 'none';
				}
			} else {
				if(window.anime) {
					anime.remove(this.guiParams);
				}
				//editor is closed, so delete elements form GUI
				this.gui.domElement.style.display = 'none';
				Object.keys(this.guiEl).forEach(key => {
					this.removeUniformFromGUI(key);
				});
			}
		}
	},
	methods: {
		addUniformToGUI(uniform) {
            this.$set(this.guiParams, uniform.name, uniform.value);
			if(uniform.type === 'float') {
				this.currUniforms[uniform.name] = uniform;
				this.guiEl[uniform.name] = this.gui.add(this.guiParams, uniform.name, uniform.min, uniform.max)
					// .onChange((val) => {
					// 	let stateUniform = this.$store.state.selectedSculpture.sculpture.uniforms.filter(el => el.name == uniform.name);
					// 	if(stateUniform && stateUniform.length) {
					// 		stateUniform[0].value = val;
					// 	}
                    // });
			} 
		},
		removeUniformFromGUI(name) {
			if (name in this.guiEl) {
				this.gui.remove(this.guiEl[name]);
				delete this.guiEl[name];
			}
			
			delete this.guiParams[name];
			delete this.currUniforms[name];
			
		}
	},
	mounted() {
		this.$nextTick(function () {
            this.gui = new dat.GUI();
			window.gui = this.gui;
			this.gui.domElement.style.display = 'none';
            window.guiParams = this.guiParams;
			let g = document.querySelector('.dg');
			g.style.zIndex = 102;
			g.style.marginTop = '8vh';
            g.children[0].children[1].style.marginTop = '20px';
            
		})
	},
};
</script>

<style lang="less">
@font-family: 'Regolapro', 'Poppins', sans-serif;
.dg.main.taller-than-window .close-button {
    border-top: 1px solid #ddd !important;
}

.dg.main .close-button {
    background-color: #ccc !important;
}

.dg.main .close-button:hover {
    background-color: #ddd !important;
}

.dg {
    z-index: 0 !important;
    // margin-top: 10vh !important;
    font-family: @font-family !important;
    color: #555 !important;
    text-shadow: none !important;
}

.dg.main::-webkit-scrollbar {
    background: #fafafa !important;
}

.dg.main::-webkit-scrollbar-thumb {
    background: #bbb !important;
}

.dg li:not(.folder) {
    background: #fafafa !important;
    border-bottom: 1px solid #ddd !important;
}

.dg li.save-row .button {
    text-shadow: none !important;
}

.dg li.title {
    background: #e8e8e8 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat !important;
}

.dg .cr.function:hover,.dg .cr.boolean:hover {
    background: #fff !important;
}

.dg .c input[type=text] {
    background: #e9e9e9 !important;
}

.dg .c input[type=text]:hover {
    background: #eee !important;
}

.dg .c input[type=text]:focus {
    background: #eee !important;
    color: #555 !important;
}

.dg .c .slider {
    background: #e9e9e9 !important;
}

.dg .c .slider:hover {
    background: #eee !important;
}
</style>
