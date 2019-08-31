
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../consts';
import Editor from '../editor';
import Utils from '../utils';
import { TaskType } from '../utils/embedded/providers/abstract';

interface SyncConfiguration {
  command: string;
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

  // Get the tasks
  await Utils.embedded.initProvider ();
  await Utils.embedded.provider.get ( undefined, true, true, false, null );

  const filesData = Utils.embedded.provider.filesData;
  const tasks: TaskType[] = filesData[textDocument.fileName].filter(t => t.myself);
  // console.log('Tasks:', tasks);

  // Sanity check
  if (!tasks.length) {
    vscode.window.showWarningMessage('No own tasks found. Check FAQ for possible reasons.'); // TODO: Add link to FAQ where own task filtering is explained
    return;
  }

  try {
    let result: TaskType[] = await vscode.commands.executeCommand(config.command, tasks, textDocument.uri);
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

/**
 * Push a list of tasks into Todoist
 * 
 * @param tasks Array of task objects to synchronize to Todoist
 * @param uri URI of the file that is being synchronized, used to pull local sync config
 * @returns An array of newly created tasks with their id's filled
 */
async function showTasks (tasks: any[], uri: vscode.Uri) {
  const content = JSON.stringify(tasks, null, 2);
  vscode.workspace.openTextDocument({ content, language: 'json' })
    .then((doc: vscode.TextDocument) => vscode.window.showTextDocument(doc, 1, false));
  return tasks;
}



  /*
  if ( !lines.length ) return;

  */

export { syncFile, showTasks };
