
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../consts';
import Document from '../document';
import Editor from '../editor';
import Utils from '../utils';
import { pathNormalizer } from '../utils/embedded/providers/abstract';
import { SyncTaskType } from '../utils/embedded/providers/js';

interface SyncConfiguration {
  command: string;
}

async function extractMyTasks (fileName) {

  // Get the tasks
  await Utils.embedded.initProvider ();
  const fd = await Utils.embedded.provider.getFileData(fileName);

  // tslint:disable-next-line:triple-equals
  if (fd == null) {
    throw new Error(`"${fileName}" not found in ${JSON.stringify(Object.keys(Utils.embedded.provider.filesData), null, 2)}`);
  }

  return await Utils.embedded.provider.getTodosFromFileData(fd, t => t.sync);

}

function externalLinkEdits (textDocument, tasks) {
  // Prepare edits - add url to new tasks
  let edits = [];

  tasks.forEach(t => {
    const line = textDocument.lineAt(t.lineNr);

    // Add link to task.externalURL if necessary
    if (!t.externalURL) return;
    if (line.text.indexOf(t.externalURL) >= 0) return; // Already present

    edits.push(vscode.TextEdit.insert(line.range.end, ` [](${t.externalURL})`));
  });

  return edits; 
}


async function syncFile () {

  // Get current editor and check that it's Markdown
  const textEditor = vscode.window.activeTextEditor;
  if ( !Editor.isSupported ( textEditor ) ) return;

  const textDocument = textEditor.document;

  // Get the synchronization config, quit if not present
  // TODO: Replace with Config(uri)
  const { command, ...options } = vscode.workspace.getConfiguration('coffeebreak', textDocument.uri).get<SyncConfiguration>('sync');

  // Get workspace owner's tasks, quit if none found
  const tasks: SyncTaskType[] = await extractMyTasks(pathNormalizer(textDocument.fileName));
  if (!tasks.length) {
    // TODO: Add link to FAQ where own task filtering is explained
    vscode.window.showWarningMessage('No own tasks found. Check FAQ for possible reasons.');
    return;
  }

  // Group the tasks based on the sync command
  const syncCommandLists = _.groupBy(tasks, t => t.sync.command || command);
  console.log(syncCommandLists);

  // console.log('Tasks:', tasks);
  // console.log(filesData[textDocument.fileName]);

  try {
    await Promise.all(Object.keys(syncCommandLists).map(async cmd => {
      // Sanity check
      if (!cmd) return;

      let result: SyncTaskType[] = await vscode.commands.executeCommand(cmd, syncCommandLists[cmd], textDocument.uri, options);
      if (!result) throw new Error('No response from sync plugin');
      else console.log('Got result', result);

      // Create necessary edit operations to add the external links to tasks
      const edits = externalLinkEdits(textDocument, result);
      // await Editor.edits.apply(textEditor, edits);
      await Document.edits.apply(textDocument, edits);
    }));

    await textEditor.document.save();
  }
  catch (e) {
    console.error(e);
    vscode.window.showErrorMessage('Synchronization failed with ' + e.toString());
  }

}

/**
 * Displan JSON window with all the tasks
 * 
 * @param tasks Array of task objects
 * @param uri URI of the file that is being synchronized
 * @param options Extra data for the sync
 * @returns An array of newly created tasks with their id's filled
 */
async function showTasks (tasks: any[], uri: vscode.Uri, options: object) {
  const content = JSON.stringify(options) + '\n' + JSON.stringify(tasks, null, 2);
  vscode.workspace.openTextDocument({ content, language: 'json' })
    .then((doc: vscode.TextDocument) => vscode.window.showTextDocument(doc, 1, false));
  return tasks;
}



  /*
  if ( !lines.length ) return;

  */

export { syncFile, showTasks };
