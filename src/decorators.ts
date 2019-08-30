import * as vscode from 'vscode';
import Consts from './consts';
import Todo from './views/items/todo';
import Editor from './editor';
	  
const Decorators = {

	timeout: undefined,

  decorators: {},

	activeEditor: undefined,

	init (context: vscode.ExtensionContext) {
    // Used for empty links
    // TODO: Deprecated, remove
    this.registerGroupDecorator('link', {
			light: {
				color: '#bbb'
			},
			dark: {
				color:  '#444'
			}
    });

    this.registerGroupDecorator('missing', {
      light: {
        color: '#d03535'
      },
      dark: {
        color:  '#d03535',
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
    
    vscode.workspace.onDidChangeConfiguration(() => {
      this.triggerUpdateDecorations();
    }, null, context.subscriptions);
  
    /*
		vscode.languages.registerHoverProvider({ scheme: 'file', language: 'markdown' }, {
			provideHover(document, position, token) {
        const mentionTags: string[] = config.get('mentions');

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

			  if (mentionTags.includes(mention)) return;
		  
			  const commandUri = vscode.Uri.parse(`command:coffeebreak.createMention?${encodeURIComponent(JSON.stringify([mention]))}`);
			  const contents = new vscode.MarkdownString(`[Click here to add *${mention}* ](${commandUri})`);
	  
			  // To enable command URIs in Markdown content, you must set the `isTrusted` flag.
			  // When creating trusted Markdown string, make sure to properly sanitize all the
			  // input content so that only expected command URIs can be executed
			  contents.isTrusted = false;
	  
			  return new vscode.Hover(contents);
			}
    });
    */
	  	  
  },
  
  registerGroupDecorator (group: string, style: Object) {
    this.decorators[group] = {
      type: vscode.window.createTextEditorDecorationType(style),
      ranges: [],
    };
  },

  applyGroupDecorator (group: string) {
    const d = this.decorators[group];
    this.activeEditor.setDecorations(d.type, d.ranges);
  },

	getDateDecorator (dateColor: string) {
		if (!this.decorators[dateColor]) {
      this.registerGroupDecorator(dateColor, { color: '#' + dateColor });
		}
		return this.decorators[dateColor];
	},

	getMentionDecorator (group) {
    // Lazy initialization of the decorator types
		if (!this.decorators[group]) {
      this.registerGroupDecorator(group, {
        light: {
          color: '#112f77'
        },
        dark: {
          color:  '#21cadd',
        }
      });
		}
		return this.decorators[group];
	},

  getMentionHoverMessage (mention, owner, uri) {

    const username = mention.substr(1);

    const detailLine = (attribute, title = null) => {
      if (owner[attribute]) return owner[attribute];

      const commandUri = vscode.Uri.parse(`command:coffeebreak.addMentionDetail?${encodeURIComponent(JSON.stringify([username, attribute, uri]))}`);
      return `[Add ${title || attribute}](${commandUri})`;
    };

    const contents = new vscode.MarkdownString(`**${username}**\n\n* ${detailLine('fullname', 'full name')}\n* ${detailLine('email')}`);

    // To enable command URIs in Markdown content, you must set the `isTrusted` flag.
    // When creating trusted Markdown string, make sure to properly sanitize all the
    // input content so that only expected command URIs can be executed
    contents.isTrusted = true;

    return contents;
  },

  getMissingMentionHoverMessage (mention, uri) {
    const username = mention.substr(1);
    const commandUri1 = vscode.Uri.parse(`command:coffeebreak.createMention?${encodeURIComponent(JSON.stringify([username]))}`);
    const commandUri2 = vscode.Uri.parse(`command:coffeebreak.createMention?${encodeURIComponent(JSON.stringify([username, uri]))}`);
    const contents = new vscode.MarkdownString(`Click here to add *${username}* to [workspace](${commandUri1}) or [project](${commandUri2})`);

    // To enable command URIs in Markdown content, you must set the `isTrusted` flag.
    // When creating trusted Markdown string, make sure to properly sanitize all the
    // input content so that only expected command URIs can be executed
    contents.isTrusted = true;

    return contents;
  },

	decorateMatches (regEx, callback) {
    const editor = this.activeEditor;
		const text = editor.document.getText();

    // Sanity check
    if (!callback) return;

		let match;
		while (match = regEx.exec(text)) {
			const startPos = editor.document.positionAt(match.index);
      const endPos = editor.document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);
      callback(match[0], range);
		}
	},

	updateDecorations() {
		// Sanity check
    if (!this.activeEditor || !Editor.isSupported(this.activeEditor)) return;

    // Reset ranges
    Object.keys(this.decorators).forEach(key => this.decorators[key].ranges = []);
    
		// Decorate due dates
		this.decorateMatches (Consts.regexes.date, (match, range) => {
      const dateColor = Todo.getDateColor(match);
      this.getDateDecorator(dateColor).ranges.push({ range });
    });

		// Decorate empty links, ungrouped
		this.decorateMatches (Consts.regexes.emptyLink, (match, range) => {
      this.decorators.link.ranges.push({ range });
    });

		// Decorate mentions
    const mentionTags: object = vscode.workspace.getConfiguration('coffeebreak', this.activeEditor.document.uri).get('mentions');
		this.decorateMatches (Consts.regexes.mention, (mention, range) => {
      const m = mentionTags[mention.substr(1)];
      let group = m ? 'others' : 'missing';
      let hoverMessage = group === 'missing' ? this.getMissingMentionHoverMessage(mention, this.activeEditor.document.uri) : this.getMentionHoverMessage(mention, m, this.activeEditor.document.uri);
      this.getMentionDecorator(group).ranges.push({ range, hoverMessage });
    });

    Object.keys(this.decorators).forEach(group => this.applyGroupDecorator(group));
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