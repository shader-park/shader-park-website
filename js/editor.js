export class Editor {
	constructor(renderer) {
		this.edit_div = document.getElementById('editor');
                this.cm = CodeMirror(this.edit_div, {
                  value: '/* shader source goes here */',
                  mode: 'text/x-csrc',
                  keyMap: 'sublime',
                  lineNumbers: true,
                  menu: true
                });
                window.cm = this.cm;
		this.edit_div.style.visibility = "hidden";
		this.sculpture = null;
		this.renderer = renderer;
		this.error_widgets = [];
		document.getElementById('editor-save-button').onclick = this.save.bind(this);
		document.getElementById('editor-compile-button').onclick = this.compile.bind(this);
		document.getElementById('editor-close-button').onclick = this.close.bind(this);
		this.shader_title_box = document.getElementById('editor-shader-title');
		this.author_name_box = document.getElementById('editor-author-name');
	}

	show(sculpture) {
		this.cm.setValue(sculpture.user_shader_source);
		this.sculpture = sculpture;
		this.edit_div.style.visibility = "visible";
		this.shader_title_box.value = this.sculpture.name;
		this.author_name_box.value = this.sculpture.author;
	}

	save() {
		this.compile();
		this.sculpture.save();
	}

	compile() {
		this.sculpture.set_shader_source(this.cm.getValue(), this.shader_title_box.value, this.author_name_box.value);
		let errors = this.sculpture.get_shader_errors(this.renderer);
		this.cm.operation(() => {
		while(this.error_widgets.length > 0){
			this.error_widgets[this.error_widgets.length-1].clear();
			this.error_widgets.pop();
		}
		for(var e in errors) {
			let error = errors[e];
			var error_node = document.createElement('span');
			error_node.className = 'error-span';
			error_node.innerHTML = 'error: ';
			if(error.item.length > 0) { error_node.innerHTML += "'" + error.item + "': "; }
			error_node.innerHTML += error.message;
			this.error_widgets.push(this.cm.addLineWidget(error.line, error_node, {above:true}));
		}});
	}

	close() {
		this.edit_div.style.visibility = "hidden";
		this.sculpture = null;
	}

	get visible() {
		return this.edit_div.style.visibility == 'visible';
	}
}
