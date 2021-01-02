
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Document from './document';

/* EDITOR */

const Editor = {

  isSupported (textEditor?: vscode.TextEditor) {
    const doc = textEditor && textEditor.document;
    return doc && Document.isSupported(doc);
  },

  async toggleRules(...rules) {

    const textEditor = vscode.window.activeTextEditor;
    if (!this.isSupported(textEditor)) return;

    const doc = textEditor.document;
    const lineNumbers = _.uniq(textEditor.selections.map(selection => selection.active.line));

    return Document.toggleRules(doc, lineNumbers, rules);
 
  }

};

/* EXPORT */

export default Editor;
