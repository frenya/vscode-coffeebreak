import * as vscode from 'vscode';
import Consts from './consts';
import Todo from './views/items/todo';
import Editor from './editor';

const mentionRegex = /@[A-Z][a-zA-Z]*/g;
	  
const Decorators = {

	timeout: undefined,

	dateDecorators: {},
	mentionDecorators: {},
	linkDecorator: undefined,

	activeEditor: undefined,

	mentionTags: [],

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
	
		this.mentionTags = vscode.workspace.getConfiguration().get('coffeebreak.mentions');

		vscode.languages.registerHoverProvider('markdown', {
			provideHover(document, position, token) {
        if (!this.mentionTags) {
          this.mentionTags = vscode.workspace.getConfiguration().get('coffeebreak.mentions');
        }

        const line = document.lineAt(position.line); 
			  // console.log(line.text, position.line, position.character);
	  
			  let match;
			  let mention = null;
			  while (match = mentionRegex.exec(line.text)) {
				const startPos = new vscode.Position(position.line, match.index + 1);
				const endPos = startPos.translate(0, match[0].length - 1);
				const range = new vscode.Range(startPos, endPos);
				// console.log('Checking range', range);
				if (range.contains(position)) mention = document.getText(range);
			  }
	  
			  if (!mention) return;

			  // console.log('Checking if ', mention, 'in', this.mentionTags, this);

			  if (this.mentionTags.includes(mention)) return;
		  
			  const commandUri = vscode.Uri.parse(`command:coffeebreak.createMention?${encodeURIComponent(JSON.stringify([mention]))}`);
			  const contents = new vscode.MarkdownString(`[Click here to add *${mention}* ](${commandUri})`);
	  
			  // To enable command URIs in Markdown content, you must set the `isTrusted` flag.
			  // When creating trusted Markdown string, make sure to properly sanitize all the
			  // input content so that only expected command URIs can be executed
			  contents.isTrusted = true;
	  
			  return new vscode.Hover(contents);
			}
		});
	  	  
	},

	getDateDecorator (dateColor) {
		if (!this.dateDecorators[dateColor]) {
			this.dateDecorators[dateColor] = vscode.window.createTextEditorDecorationType({
				color: '#' + dateColor
			});
		}
		return this.dateDecorators[dateColor];
	},

	getMentionDecorator (group) {
		if (!this.mentionDecorators[group]) {
			if (group === 'missing') {
				this.mentionDecorators[group] = vscode.window.createTextEditorDecorationType({
					// backgroundColor: group === 'me' ? '#112f77' : 'inherit',
					// fontWeight: group === 'me' ? '800' : 'inherit',
					light: {
						color: '#d03535'
					},
					dark: {
						color:  '#d03535',
					}
				});
			}
			else {
				this.mentionDecorators[group] = vscode.window.createTextEditorDecorationType({
					// backgroundColor: group === 'me' ? '#112f77' : 'inherit',
					// fontWeight: group === 'me' ? '800' : 'inherit',
					light: {
						color: '#112f77'
					},
					dark: {
						color:  '#21cadd',
					}
				});
			}
		}
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

			const group = grouping ? grouping(match[0]) : 'default';
			
			if (!ranges[group]) ranges[group] = [];
			ranges[group].push(decoration);
		}

		// console.log('Matched ranges', ranges);
		Object.keys(ranges).forEach((group) => cb(ranges[group], group));
	},

	updateDecorations() {
		// Sanity check
		if (!this.activeEditor || !Editor.isSupported(this.activeEditor)) return;

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
			mentionRegex,
			(mention) => {
				const index = this.mentionTags.indexOf(mention.substr(1));
				if (index < 0) return 'missing';
				return index === 0 ? 'me' : 'others';
			},
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