
/* IMPORT */

import * as _ from 'lodash';
import * as diff from 'diff';
import * as vscode from 'vscode';
import Consts from './consts';
import Utils from './utils';

const Document = {

  isSupported (doc?: vscode.TextDocument) {
    return doc && (doc.languageId === Consts.languageId) && Utils.embedded.provider.isIncluded(doc.uri.fsPath);
  },

  async toggleRules (doc: vscode.TextDocument, lineNumbers: number[], rules, cb?) {
    const lines = lineNumbers.map(lineNr => doc.lineAt(lineNr));
  
    // Sanity check
    if ( !lines.length ) return;
  
    const edits = [];

    lines.forEach ( line => {
      // Apply the first matching rule and push the corresponding edits
      const appliedRule = rules.find(([ regex, replacement ]) => {
        if (!regex.test ( line.text ) ) return false;
  
        const nextText = line.text.replace ( regex, replacement );
        edits.push( ...this.edits.makeDiff(line.text, nextText, line.lineNumber));
        return true;
      });
  
      if (cb && appliedRule) {
        cb(doc, line, appliedRule);
      }
  
    });
  
    if ( !edits.length ) return;
  
    await this.edits.apply(doc, edits);
  },

  edits: {

    apply (doc: vscode.TextDocument, edits: vscode.TextEdit[] ) {
      const edit = new vscode.WorkspaceEdit ();
      edit.set (doc.uri, edits);
      return vscode.workspace.applyEdit (edit);
    },

    makeDiff (before: string, after: string, lineNr: number = 0) {
      // Sanity check
      if ( before === after ) return;

      const changes = diff.diffWordsWithSpace (before, after);

      let index = 0;

      return _.filter(changes.map(change => {
        if ( change.added ) {
          return this.makeInsert(change.value, lineNr, index);
        } 
        else if ( change.removed ) {
          const edit = this.makeDelete(lineNr, index, index + change.value.length);
          index += change.value.length;
          return edit;
        }
        else {
          // This signals no change, value is unchanged text portion
          index += change.value.length;
        }
      }));
    },

    makeDelete ( lineNr: number, fromCh: number, toCh: number = fromCh ) {
      const range = new vscode.Range ( lineNr, fromCh, lineNr, toCh );
      return vscode.TextEdit.delete (range);
    },

    makeInsert ( insertion: string, lineNr: number, charNr: number ) {
      const position = new vscode.Position (lineNr, charNr);
      return vscode.TextEdit.insert (position, insertion);
    }

  }

};

export default Document;
