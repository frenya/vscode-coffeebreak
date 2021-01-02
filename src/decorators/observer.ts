import * as vscode from 'vscode';

export class EditorObserver {

  timeout = undefined;
  activeEditor = undefined;

  constructor (context: vscode.ExtensionContext) {
    this.setEditor(vscode.window.activeTextEditor);
    vscode.window.onDidChangeActiveTextEditor(editor => this.setEditor(editor), null, context.subscriptions);
  
    vscode.workspace.onDidChangeTextDocument(event => {
      if (this.activeEditor && event.document === this.activeEditor.document) {
        this.triggerUpdate();
      }
    }, null, context.subscriptions);
    
    // TODO: Better to handle this in subclasses
    vscode.workspace.onDidChangeConfiguration(() => {
      this.triggerUpdate();
    }, null, context.subscriptions);
  }
  
  setEditor (editor: vscode.TextEditor) {
    this.activeEditor = editor;
    if (editor) {
      this.triggerUpdate();
    }
  }

  triggerUpdate() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
    this.timeout = setTimeout(() => this.update(), 300);  
  }

  update() {
    // Abstract
  }

}
