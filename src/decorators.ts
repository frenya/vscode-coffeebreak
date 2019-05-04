import * as vscode from 'vscode';
import Consts from './consts';
import Todo from './views/items/todo';

const Decorators = {

	timeout: undefined,

	dateDecorators: {},
	mentionDecorators: {},
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

	getMentionDecorator (group) {
		if (!this.mentionDecorators[group]) {
			this.mentionDecorators[group] = vscode.window.createTextEditorDecorationType({
				backgroundColor: group === 'me' ? '#112f77' : 'inherit',
				light: {
					color: '#112f77'
				},
				dark: {
					color:  '#21cadd',
				}
			});
		}
		console.log('getMentionDecorator', group);
		return this.mentionDecorators[group];
	},


	decorateMatches (editor, regEx, grouping, cb) {
		const text = editor.document.getText();
		let ranges = {};

		let match;
		while (match = regEx.exec(text)) {
			const startPos = editor.document.positionAt(match.index);
			const endPos = editor.document.positionAt(match.index + match[0].length);
			const decoration = { range: new vscode.Range(startPos, endPos) };

			console.log('match', match);

			const group = grouping ? grouping(match[0]) : 'default';
			
			if (!ranges[group]) ranges[group] = [];
			ranges[group].push(decoration);
		}

		// console.log('Matched ranges', ranges);
		Object.keys(ranges).forEach((group) => cb(ranges[group], group));
	},

	updateDecorations() {
		// Sanity check
		if (!this.activeEditor) return;

		// Decorate due dates
		this.decorateMatches (
			this.activeEditor,
			/\d{4}-\d{2}-\d{2}/g,
			Todo.getDateColor,		// Group by date color
			(ranges, group) => this.activeEditor.setDecorations(this.getDateDecorator(group), ranges)
		);

		// Decorate empty links, ungrouped
		this.decorateMatches (
			this.activeEditor,
			/\[\]\([^)]*\)/g,
			null,
			(ranges) => this.activeEditor.setDecorations(this.linkDecorator, ranges)
		);

		// Decorate mentions
		this.decorateMatches (
			this.activeEditor,
			/@[A-Z][a-z]*/g,
			(mention) => mention === '@Franta' ? 'me' : 'others',	// FIXME: Get current user from config
			(ranges, group) => this.activeEditor.setDecorations(this.getMentionDecorator(group), ranges)
		);
	},

	triggerUpdateDecorations() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
		this.timeout = setTimeout(() => this.updateDecorations(), 300);
	}

};

export default Decorators;