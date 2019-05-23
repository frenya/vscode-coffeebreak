
/* IMPORT */

import * as vscode from 'vscode';
import config from './config';
import Utils from './utils';
import Decorators from './decorators';
import ViewEmbedded from './views/embedded';
import { HashTagsCompletionItemProvider } from './hashtags_completion_item_provider';
import { DateCompletionItemProvider } from './date_completion_item_provider';

/* ACTIVATE */

const activate = function ( context: vscode.ExtensionContext ) {

  config.watchChanges(context);

  ViewEmbedded.expanded = config.get('expanded');

  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', ViewEmbedded.expanded );
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', !!ViewEmbedded.filter );
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-hide-linked', false );
  
  Utils.context = context;
  Utils.folder.initRootsRe ();
  Utils.init.views ();

  Decorators.init(context);

  context.subscriptions.push (
    vscode.workspace.onDidChangeConfiguration ( () => Utils.embedded.provider && delete Utils.embedded.provider.filesData ),
    vscode.workspace.onDidChangeWorkspaceFolders ( () => Utils.embedded.provider && Utils.embedded.provider.unwatchPaths () ),
    vscode.workspace.onDidChangeWorkspaceFolders ( Utils.folder.initRootsRe )
  );

  // Register completion providers
  const selector = { scheme: 'file', language: 'markdown' };
  const completionItemProvider = new HashTagsCompletionItemProvider();
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(selector, completionItemProvider, '@'));

  const dateCompletionItemProvider = new DateCompletionItemProvider();
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(selector, dateCompletionItemProvider, '/'));

  // Init commands
  return Utils.init.commands ( context );

};

/* EXPORT */

export {activate};
