import * as _ from 'lodash';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ItemTodo from '../views/items/todo';
import Utils from '../utils';

export function openTaskURL ( todo: ItemTodo ) {
  // console.log(todo);
  vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(todo.obj.externalURL));
}

export async function newFile () {

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

