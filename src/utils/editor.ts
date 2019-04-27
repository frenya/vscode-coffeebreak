
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../consts';

/* EDITOR */

const Editor = {

  isSupported ( textEditor?: vscode.TextEditor ) {

    return textEditor && ( textEditor.document.languageId === Consts.languageId );

  },

  open ( content ) {

    vscode.workspace.openTextDocument ({ language: Consts.languageId }).then ( ( textDocument: vscode.TextDocument ) => {

      vscode.window.showTextDocument ( textDocument, { preview: false } ).then ( ( textEditor: vscode.TextEditor ) => {

        textEditor.edit ( edit => {

          const pos = new vscode.Position ( 0, 0 );

          edit.insert ( pos, content );

          textEditor.document.save ();

        });

      });

    });

  },

  edits: {

    apply ( textEditor: vscode.TextEditor, edits: vscode.TextEdit[] ) {

      const uri = textEditor.document.uri,
            edit = new vscode.WorkspaceEdit ();

      edit.set ( uri, edits );

      return vscode.workspace.applyEdit ( edit );

    },

    /* MAKE */

    makeDelete ( lineNr: number, fromCh: number, toCh: number = fromCh ) {

      const range = new vscode.Range ( lineNr, fromCh, lineNr, toCh ),
            edit = vscode.TextEdit.delete ( range );

      return edit;

    },

    makeDeleteLine ( lineNr: number ) {

      const range = new vscode.Range ( lineNr, 0, lineNr + 1, 0 ),
            edit = vscode.TextEdit.delete ( range );

      return edit;

    },

    makeInsert ( insertion: string, lineNr: number, charNr: number ) {

      const position = new vscode.Position ( lineNr, charNr ),
            edit = vscode.TextEdit.insert ( position, insertion );

      return edit;

    },

    makeReplace ( replacement: string, lineNr: number, fromCh: number, toCh: number = fromCh ) {

      const range = new vscode.Range ( lineNr, fromCh, lineNr, toCh ),
            edit = vscode.TextEdit.replace ( range, replacement );

      return edit;

    }

  }

};

/* EXPORT */

export default Editor;
