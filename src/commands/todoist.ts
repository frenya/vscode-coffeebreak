
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import * as HTTP from 'https';
import Consts from '../consts';
import Editor from '../editor';
import Utils from '../utils';
import * as uuid from 'uuid';
import * as UrlPattern from 'url-pattern';
import * as rp from 'request-promise';

interface TodoistConfiguration {
  project_id: number;
  priority: number;
  labels: number[];
  assigned_by_uid: number;
  responsible_uid: number;
}

const TodoistTaskUrl = new UrlPattern('https\\://todoist.com/showTask?id=:id');

async function updateToken () {

  const token = await vscode.window.showInputBox ({ placeHolder: 'Please, insert Todoist API token ...' });
  Utils.context.workspaceState.update('todoistToken', token);
  return token;

}

async function getToken () {

  let token = Utils.context.workspaceState.get('todoistToken');

  if (!token) {
    token = await vscode.commands.executeCommand('coffeebreak.updateToken');
  }

  return token;

}

/**
 * Push a list of tasks into Todoist
 * 
 * @param tasks Array of task objects to synchronize to Todoist
 * @param uri URI of the file that is being synchronized, used to pull local sync config
 * @returns An array of newly created tasks with their id's filled
 */
async function todoistSync (tasks: any[], uri: vscode.Uri) {

  // Sanity check - this command should be called by CoffeeBreak extension with appropriate arguments
  // missing arguments probably mean that the user has call the command directly
  if (!tasks || !uri) {
    vscode.window.showWarningMessage('Arguments are missing. Please, call the "Coffee Break: Synchronize file with external task manager" command!"');
    return;
  }

  // Make sure we have an authentication token
  const token = await getToken();
  if (!token) {
    throw new Error('No Todoist token available');
  }
  // else console.log(token);

  // Get the local config
  const defaults = vscode.workspace.getConfiguration('todoist-sync', uri).get<TodoistConfiguration>('defaults');

  const cmds = tasks.map(constructTodoistCommand);

  // console.log('Synchronizing to Todoist', defaults, tasks, cmds);

  console.log('Sending commands', JSON.stringify(cmds, null, 2));
  const response = await callTodoistSyncAPI(token, JSON.stringify(cmds));

  console.log('Got response from Todoist');
  console.log(response);

  // Check sync_status and warn in some commands not successfully completed
  Object.keys(response.sync_status).forEach(cmdId => {
    if (typeof response.sync_status[cmdId] === 'object') {
      console.warn(response.sync_status[cmdId].error);
      vscode.window.showWarningMessage(response.sync_status[cmdId].error);
    }
  });

  // Return an array of newly created tasks with id's
  return tasks
    // Only process tasks that were sucessfully added, i.e. their temp_id was converted into id
    .filter(x => x.temp_id && response.temp_id_mapping[x.temp_id])
    // Construct external URL and add it to the task record
    .map(x => ({ externalURL: TodoistTaskUrl.stringify({ id: response.temp_id_mapping[x.temp_id] }), ...x }));

  function constructTodoistCommand (task) {
    const documentLink = ` vscode://file/${encodeURIComponent(task.filePath)}:${task.lineNr+1} ((☰))`;
    let args = Object.assign({}, defaults || {}, {
      content: task.message.trim() + documentLink,
      date_string: task.dueDate,
      auto_parse_labels: false
    }, TodoistTaskUrl.match(task.externalURL));

    if (args.id) {
      args.id = parseInt(args.id);
      return {
        type: 'item_update',
        uuid: uuid(),
        args
      };
    }
    else {
      task.temp_id = uuid();
      return {
        type: 'item_add',
        temp_id: task.temp_id,
        uuid: uuid(),
        args
      };
    }
  }
  
}

async function callTodoistSyncAPI (token, commands) {

  const options = {
    method: "GET",
    uri: 'https://todoist.com/api/v7/sync',
    qs:  { token, commands },
    headers: { "User-Agent": "Request-Promise" },
    json: true
  };

  return rp(options);
}

export { updateToken, todoistSync };
