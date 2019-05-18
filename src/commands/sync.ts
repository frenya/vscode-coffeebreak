
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../consts';
import Editor from '../editor';
import Utils from '../utils';

interface SyncConfiguration {
  tags: string[];
  command: string;
  commandParameters: string[];
  ownerFilter: string;
}


async function syncFile () {

  // Get current editor and check that it's Markdown
  const textEditor = vscode.window.activeTextEditor;
  if ( !Editor.isSupported ( textEditor ) ) return;

  const textDocument = textEditor.document;

  // console.log(textDocument);
  // console.log(textEditor.selections);
  // console.log(lines);

  // Get the synchronization config, quit if not present
  const config = vscode.workspace.getConfiguration('coffeebreak', textDocument.uri).get<SyncConfiguration>('sync');
  // console.log(config);
  if (!config.command) return;

  const ownerFilter = new RegExp(config.ownerFilter);

  // Get the tasks
  // FIXME: This isn't enough - until the tree view asks for data, nothing is parsed
  await Utils.embedded.initProvider ();
  const filesData = Utils.embedded.provider.filesData;
  const tasks = filesData[textDocument.fileName].filter(t => ownerFilter.test(t.type));
  console.log('Tasks:', tasks);

  try {
    let result: any[] = await vscode.commands.executeCommand(config.command, tasks, textDocument.uri);
    console.log('Sync result', result);

    // Sanity check
    if (!result) throw new Error('No response from sync plugin');
  
    // Prepare edits - add url to new tasks
    let edits = [];
  
    result.forEach ( task => {
      const line = textDocument.lineAt(task.lineNr);
  
      // Add link to task.externalURL if necessary
      if (!task.externalURL) return;
      if (line.text.indexOf(task.externalURL) >= 0) return; // Already present
  
      edits.push(vscode.TextEdit.insert(line.range.end, ` [](${task.externalURL})`));
    });
  
    // console.log(edits);
    if (edits.length) {
      await Editor.edits.apply(textEditor, edits);
      await textEditor.document.save();
    }
  
  }
  catch (e) {
    console.error(e);
    vscode.window.showErrorMessage('Synchronization failed with ' + e.toString());
  }

  return;

}

  /*
  if ( !lines.length ) return;

  */

export { syncFile };
