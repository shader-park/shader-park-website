export class Editor {
	constructor() {
		this.edit_div = document.getElementById('editor');
		this.cm = CodeMirror(this.edit_div, {
			value: "/* shader source goes here */",
			mode: "text/x-csrc",
			lineNumbers: true
		});
		this.edit_div.style.visibility = "hidden";
		this.sculpture = null;
		document.getElementById('editor-save-button').onclick = this.save.bind(this);
		document.getElementById('editor-compile-button').onclick = this.compile.bind(this);
		document.getElementById('editor-close-button').onclick = this.close.bind(this);
	}

	show(sculpture) {
		this.cm.setValue(sculpture.user_shader_source);
		this.sculpture = sculpture;
		this.edit_div.style.visibility = "visible";
	}

	save() {
		this.compile();
		this.sculpture.save();
	}

	compile() {
		this.sculpture.set_shader_source(this.cm.getValue());
	}

	close() {
		this.edit_div.style.visibility = "hidden";
		this.sculpture = null;
	}

	get visible() {
		return this.edit_div.style.visibility == 'visible';
	}
}
