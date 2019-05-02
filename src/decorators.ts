import * as vscode from 'vscode';
import Consts from './consts';
import Todo from './views/items/todo';

const Decorators = {

	timeout: undefined,

	dateDecorators: {},
	linkDecorator: undefined,

	activeEditor: undefined,

	init (context: vscode.ExtensionContext) {
		// Used for empty links
		this.linkDecorator = vscode.window.createTextEditorDecorationType({
			light: {
				color: '#bbb'
			},
			dark: {
				color:  '#444'
			}
		});

		this.activeEditor = vscode.window.activeTextEditor;
		if (this.activeEditor) {
			this.triggerUpdateDecorations();
		}
	
		vscode.window.onDidChangeActiveTextEditor(editor => {
			this.activeEditor = editor;
			if (editor) {
				this.triggerUpdateDecorations();
			}
		}, null, context.subscriptions);
	
		vscode.workspace.onDidChangeTextDocument(event => {
			if (this.activeEditor && event.document === this.activeEditor.document) {
				this.triggerUpdateDecorations();
			}
		}, null, context.subscriptions);
	
	
	},

	getDateDecorator (dateColor) {
		if (!this.dateDecorators[dateColor]) {
			this.dateDecorators[dateColor] = vscode.window.createTextEditorDecorationType({
				backgroundColor: '#' + dateColor,
				color: '#eee',
				borderRadius: '2px'
			});
		}
		return this.dateDecorators[dateColor];
	},


	decorateDates (editor) {
		const regEx = /\d{4}-\d{2}-\d{2}/g;
		const text = editor.document.getText();
		let ranges = {};

		let match;
		while (match = regEx.exec(text)) {
			const startPos = editor.document.positionAt(match.index);
			const endPos = editor.document.positionAt(match.index + match[0].length);
			const decoration = { range: new vscode.Range(startPos, endPos) };
			const dateColor = Todo.getDateColor(match[0]);

			if (!ranges[dateColor]) ranges[dateColor] = [];
			ranges[dateColor].push(decoration);
		}

		Object.keys(ranges).forEach((dateColor) => editor.setDecorations(this.getDateDecorator(dateColor), ranges[dateColor]));
	},

	decorateMatches (editor, regEx, decorator) {
		const text = editor.document.getText();
		let ranges: vscode.DecorationOptions[] = [];

		let match;
		while (match = regEx.exec(text)) {
			const startPos = editor.document.positionAt(match.index);
			const endPos = editor.document.positionAt(match.index + match[0].length);
			const decoration = { range: new vscode.Range(startPos, endPos) };

			ranges.push(decoration);
		}
		editor.setDecorations(decorator, ranges);
	},

	updateDecorations() {
		// Sanity check
		if (!this.activeEditor) return;

		this.decorateDates (this.activeEditor);
		this.decorateMatches (this.activeEditor, /\[\]\([^)]*\)/g, this.linkDecorator);
	},

	triggerUpdateDecorations() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
		this.timeout = setTimeout(() => this.updateDecorations(), 500);
	}

};

export default Decorators;