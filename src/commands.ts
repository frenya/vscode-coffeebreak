
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Config from './config';
import ItemFile from './views/items/item';
import ItemTodo from './views/items/todo';
import Utils from './utils';
import ViewEmbedded from './views/embedded';

/* COMMANDS */

async function openEmbedded () {

  await Utils.embedded.initProvider ();

  const config = Config.get (),
        todos = await Utils.embedded.provider.get ( undefined, config.embedded.file.groupByRoot, config.embedded.file.groupByType, config.embedded.file.groupByFile ),
        content = Utils.embedded.provider.renderTodos ( todos );

  if ( !content ) return vscode.window.showInformationMessage ( 'No embedded todos found' );

  Utils.editor.open ( content );

}

/* VIEW */

function viewOpenFile ( file: ItemFile ) {

  if (file.resourceUri) {
    Utils.file.open ( file.resourceUri.fsPath, true, 0 );
  }

}

function viewRevealTodo ( todo: ItemTodo ) {

  if ( todo.obj.todo ) {

    const startIndex = todo.obj.rawLine.indexOf ( todo.obj.todo ),
          endIndex = startIndex + todo.obj.todo.length;

    Utils.file.open ( todo.obj.filePath, true, todo.obj.lineNr, startIndex, endIndex );

  } else {

    Utils.file.open ( todo.obj.filePath, true, todo.obj.lineNr );

  }

}

/* VIEW EMBEDDED */

function viewEmbeddedCollapse () {
  ViewEmbedded.expanded = false;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', false );
  ViewEmbedded.refresh ( true );
}

function viewEmbeddedExpand () {
  ViewEmbedded.expanded = true;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', true );
  ViewEmbedded.refresh ( true );
}

async function viewEmbeddedFilter () {

  const filter = await vscode.window.showInputBox ({ placeHolder: 'Filter string...' });

  if ( !filter || ViewEmbedded.filter === filter ) return;

  ViewEmbedded.filter = filter;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', true );
  ViewEmbedded.refresh ();

}

function viewEmbeddedClearFilter () {
  ViewEmbedded.filter = false;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', false );
  ViewEmbedded.refresh ();
}

/* EXPORT */

export { openEmbedded, viewOpenFile, viewRevealTodo, viewEmbeddedCollapse, viewEmbeddedExpand, viewEmbeddedFilter, viewEmbeddedClearFilter };
