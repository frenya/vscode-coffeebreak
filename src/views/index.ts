
import * as vscode from 'vscode';
import Config from '../config';

import Embedded from './embedded';

export let ViewEmbedded = null;

export function init () {
  ViewEmbedded = new Embedded();
  vscode.window.registerTreeDataProvider ( ViewEmbedded.id, ViewEmbedded );

  ViewEmbedded.expanded = Config(null).get('expanded');
  ViewEmbedded.filterOwner = '<me>';
  ViewEmbedded.hideLinked = true;

  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered-owner', !!ViewEmbedded.filterOwner );
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', ViewEmbedded.expanded );
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', !!ViewEmbedded.filter );
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-hide-linked', ViewEmbedded.hideLinked );
}

