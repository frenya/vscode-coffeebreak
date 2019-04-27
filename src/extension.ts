
/* IMPORT */

import * as vscode from 'vscode';
import Config from './config';
import Utils from './utils';
import ViewEmbedded from './views/embedded';

/* ACTIVATE */

const activate = function ( context: vscode.ExtensionContext ) {

  const config = Config.get ();

  Config.check ( config );

  ViewEmbedded.expanded = true; //config.embedded.view.expanded;

  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', ViewEmbedded.expanded );
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', !!ViewEmbedded.filter );

  Utils.context = context;
  Utils.folder.initRootsRe ();
  Utils.init.views ();

  context.subscriptions.push (
    vscode.workspace.onDidChangeConfiguration ( () => Utils.embedded.provider && delete Utils.embedded.provider.filesData ),
    vscode.workspace.onDidChangeWorkspaceFolders ( () => Utils.embedded.provider && Utils.embedded.provider.unwatchPaths () ),
    vscode.workspace.onDidChangeWorkspaceFolders ( Utils.folder.initRootsRe )
  );

  return Utils.init.commands ( context );

};

/* EXPORT */

export {activate};
