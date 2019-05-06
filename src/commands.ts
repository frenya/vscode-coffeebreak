
/* IMPORT */

import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import Config from './config';
import Consts from './consts';
import Editor from './editor';
import ItemFile from './views/items/item';
import ItemTodo from './views/items/todo';
import Utils from './utils';
import ViewEmbedded from './views/embedded';

/* VIEW */

function viewRevealTodo ( todo: ItemTodo ) {

  if ( todo.obj.todo ) {

    const startIndex = todo.obj.rawLine.indexOf ( todo.obj.todo ),
          endIndex = startIndex + todo.obj.todo.length;

    Utils.file.open ( todo.obj.filePath, true, todo.obj.lineNr, startIndex, endIndex );

  } else {

    Utils.file.open ( todo.obj.filePath, true, todo.obj.lineNr );

  }

}

function openTaskURL ( todo: ItemTodo ) {
  // console.log(todo);
  vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(todo.obj.externalURL));
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
  ViewEmbedded.filterRe = filter ? new RegExp ( _.escapeRegExp ( filter ), 'i' ) : false;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', true );
  ViewEmbedded.refresh ();

}

function viewEmbeddedClearFilter () {
  ViewEmbedded.filter = false;
  ViewEmbedded.filterRe = false;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', false );
  ViewEmbedded.refresh ();
}

async function viewEmbeddedFilterByOwner () {

  const filter = await vscode.window.showInputBox ({ value: '@Franta' });
  if (filter != null) viewEmbeddedFilterByType(filter || '<unassigned>');

}

async function viewEmbeddedFilterByType (type) {

  // Avoid unnecessary refreshes
  if ( ViewEmbedded.filterType === type ) return;

  ViewEmbedded.filterType =type;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered-owner', !!type );
  if (type) {
    ViewEmbedded.expanded = true;
    vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', true );
  }
  ViewEmbedded.refresh ( true );

}

async function viewEmbeddedFilterMyTasks () {
  viewEmbeddedFilterByType('@Franta');
}

async function viewEmbeddedFilterUnassignedTasks () {
  viewEmbeddedFilterByType('<unassigned>');
}

async function viewEmbeddedFilterAllTasks () {
  viewEmbeddedFilterByType(null);
}

async function viewEmbeddedFilterByDate () {

  const filter = await vscode.window.showInputBox ({ value: new Date().toISOString().substr(0, 10) });
  if (filter != null) viewEmbeddedDueTasks(filter || '2999-12-31');

}

async function viewEmbeddedDueTasks (date) {

  // TODO: Avoid unnecessary refreshes
  // if ( !filter || ViewEmbedded.filter === filter ) return;

  ViewEmbedded.filterDueDate = date;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered-due', !!date );
  if (date) {
    ViewEmbedded.expanded = true;
    vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', true );
  }
  ViewEmbedded.refresh ( true );

}

async function viewEmbeddedDueToday () {
  viewEmbeddedDueTasks(new Date().toISOString().substr(0, 10));
}

async function viewEmbeddedDueAnytime () {
  viewEmbeddedDueTasks(null);
}


async function viewEmbeddedShowLinkedTasks () {

  ViewEmbedded.hideLinked = false;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-hide-linked', false );
  ViewEmbedded.refresh ( true );

}

async function viewEmbeddedHideLinkedTasks () {

  ViewEmbedded.hideLinked = true;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-hide-linked', true );
  ViewEmbedded.refresh ( true );

}

/* FILE CREATION */

async function newFile () {

  const title = await vscode.window.showInputBox ({ placeHolder: 'Note title [, Folder]' });

  // Sanity check (null means Esc was pressed)
  // tslint:disable-next-line:triple-equals
  if (title == null) return;

  const comps = title.split(',');

  let folder = Utils.folder.getRootPath();
  let name = comps[0].trim() || 'Untitled';
  let suffix: any = '';

  if (comps.length > 1) {
    const paths = Utils.folder.getAllRootPaths();
    folder = paths.find((p: string) => path.basename(p).toLowerCase().startsWith(comps[1].trim().toLowerCase())) || folder;
  }

  // Get current date
  let date = new Date().toISOString().substr(0, 10);

  // SNIPPET
  // Find first non-colliding name
  while (fs.existsSync(`${folder}/${date} ${name}${suffix}.md`)) {
    suffix = (suffix || 0) - 1;
  }

  var uri: vscode.Uri = vscode.Uri.parse(`untitled:${folder}/${date} ${name}${suffix}.md`);
  vscode.workspace.openTextDocument(uri).then((doc: vscode.TextDocument) => {
      vscode.window.showTextDocument(doc, 1, false).then(e => {
          if (name !== 'Untitled') {
            e.edit(edit => { edit.insert(new vscode.Position(0, 0), `# ${name}\n\n`); });
          }
      });
  }, (error: any) => {
      console.error(error);
      debugger;
  });
}

/* TOGGLE RULES */

async function toggleRules ( ...rules ) {

  const textEditor = vscode.window.activeTextEditor;

  if ( !Editor.isSupported ( textEditor ) ) return;

  const textDocument = textEditor.document,
        lines = _.uniq ( textEditor.selections.map ( selection => textDocument.lineAt ( selection.active.line ) ) );

  if ( !lines.length ) return;

  const edits = [];

  lines.forEach ( line => {

    rules.find ( ([ regex, replacement ]) => {

      if ( !regex.test ( line.text ) ) return false;

      const nextText = line.text.replace ( regex, replacement );

      edits.push ( ..._.filter ( _.flattenDeep ( lines.map ( line => Editor.edits.makeDiff ( line.text, nextText, line.lineNumber ) ) ) ) );

      return true;

    });

  });

  if ( !edits.length ) return;

  await Editor.edits.apply ( textEditor, edits );

}

/* COMMANDS */

function toggleTodo () {

  const {bullet} = Consts.symbols,
        {line, todoBox, todoDone} = Consts.regexes;

  toggleRules (
    [todoBox, `$1${bullet} $3`],
    [todoDone, `$1${bullet} [ ] $3`],
    [line, `$1${bullet} [ ] $3`]
  );

}

function toggleDone () {

  const {bullet, done} = Consts.symbols,
        {line, todoBox, todoDone} = Consts.regexes;

  toggleRules (
    [todoDone, `$1${bullet} [ ] $3`],
    [todoBox, `$1${bullet} [${done}] $3`],
    [line, `$1${bullet} [${done}] $3`]
  );

}

/* EXPORT */

export {
  viewRevealTodo, viewEmbeddedCollapse, viewEmbeddedExpand, 
  viewEmbeddedFilter, viewEmbeddedClearFilter, 
  openTaskURL, newFile, 
  toggleTodo, toggleDone,
  viewEmbeddedFilterMyTasks, viewEmbeddedFilterUnassignedTasks, viewEmbeddedFilterAllTasks, viewEmbeddedFilterByOwner,
  viewEmbeddedDueToday, viewEmbeddedDueAnytime, viewEmbeddedFilterByDate,
  viewEmbeddedShowLinkedTasks, viewEmbeddedHideLinkedTasks
};
