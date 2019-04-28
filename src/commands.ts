
/* IMPORT */

import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import Config from './config';
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
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', true );
  ViewEmbedded.refresh ();

}

function viewEmbeddedClearFilter () {
  ViewEmbedded.filter = false;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', false );
  ViewEmbedded.refresh ();
}

/* FILE CREATION */

async function newFile () {

  const title = await vscode.window.showInputBox ({ placeHolder: 'Folder / Title ...' });
  const comps = title.split('/');   // TODO: Same logic for Windows?

  let folder = Utils.folder.getRootPath();
  let name = comps[0].trim() || 'Untitled';
  let suffix: any = '';

  const paths = Utils.folder.getAllRootPaths();

  if (comps.length > 1) {
    folder = paths.find((p: string) => path.basename(p).toLowerCase().startsWith(name.toLowerCase())) || folder;

    name = comps[1].trim() || 'Untitled';
  }

  // Get current date
  let date = new Date().toISOString().substr(0, 10);

  // SNIPPET
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



/* EXPORT */

export { viewRevealTodo, viewEmbeddedCollapse, viewEmbeddedExpand, viewEmbeddedFilter, viewEmbeddedClearFilter, openTaskURL, newFile };
