import * as _ from 'lodash';
import * as vscode from 'vscode';
import ItemTodo from '../views/items/todo';
import { ViewEmbedded } from '../views';
import Utils from '../utils';

export function viewRevealTodo ( todo: ItemTodo ) {

  if ( todo.obj.todo ) {

    const startIndex = todo.obj.rawLine.indexOf ( todo.obj.todo ),
          endIndex = startIndex + todo.obj.todo.length;

    Utils.file.open ( todo.obj.filePath, true, todo.obj.lineNr, startIndex, endIndex );

  } else {

    Utils.file.open ( todo.obj.filePath, true, todo.obj.lineNr );

  }

}

export function viewEmbeddedCollapse () {
  ViewEmbedded.expanded = false;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', false );
  ViewEmbedded.refresh ( true );
}

export function viewEmbeddedExpand () {
  ViewEmbedded.expanded = true;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', true );
  ViewEmbedded.refresh ( true );
}

export async function viewEmbeddedFilter () {

  const filter = await vscode.window.showInputBox ({ placeHolder: 'Filter string...' });

  if ( !filter || ViewEmbedded.filter === filter ) return;

  ViewEmbedded.filter = filter;
  ViewEmbedded.filterRe = filter ? new RegExp ( _.escapeRegExp ( filter ), 'i' ) : false;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', true );
  ViewEmbedded.refresh ();

}

export function viewEmbeddedClearFilter () {
  ViewEmbedded.filter = false;
  ViewEmbedded.filterRe = false;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', false );
  ViewEmbedded.refresh ();
}

export async function viewEmbeddedFilterByOwner (owner) {

  // tslint:disable-next-line:triple-equals
  if (owner == null) {
    owner = await vscode.window.showInputBox ({ value: ViewEmbedded.filterOwner });
    // tslint:disable-next-line:triple-equals
    if (owner == null) return;
    else owner = owner || '<unassigned>';
  }

  // Avoid unnecessary refreshes
  if ( ViewEmbedded.filterOwner === owner ) return;

  ViewEmbedded.filterOwner = owner;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered-owner', !!owner );
  if (owner) {
    ViewEmbedded.expanded = true;
    vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', true );
  }
  ViewEmbedded.refresh ( true );

}

export async function viewEmbeddedFilterMyTasks () {
  viewEmbeddedFilterByOwner('<me>');
}

export async function viewEmbeddedFilterAllTasks () {
  viewEmbeddedFilterByOwner('');
}

export async function viewEmbeddedFilterByDate () {

  const filter = await vscode.window.showInputBox ({ value: new Date().toISOString().substr(0, 10) });
  // tslint:disable-next-line:triple-equals
  if (filter != null) viewEmbeddedDueTasks(filter || '2999-12-31');

}

export async function viewEmbeddedDueTasks (date) {

  // Avoid unnecessary refreshes
  if ( ViewEmbedded.filterDueDate === date ) return;

  ViewEmbedded.filterDueDate = date;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered-due', !!date );
  if (date) {
    ViewEmbedded.expanded = true;
    vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', true );
  }
  ViewEmbedded.refresh ( true );

}

export async function viewEmbeddedDueToday () {
  viewEmbeddedDueTasks(new Date().toISOString().substr(0, 10));
}

export async function viewEmbeddedDueAnytime () {
  viewEmbeddedDueTasks(null);
}


export async function viewEmbeddedShowLinkedTasks () {

  ViewEmbedded.hideLinked = false;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-hide-linked', false );
  ViewEmbedded.refresh ( true );

}

export async function viewEmbeddedHideLinkedTasks () {

  ViewEmbedded.hideLinked = true;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-hide-linked', true );
  ViewEmbedded.refresh ( true );

}

