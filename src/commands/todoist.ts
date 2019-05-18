
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
	tags: string[];
  command: string;
  commandParameters: string[];
  ownerFilter: string;
}

const TodoistTaskUrl = new UrlPattern('https\\://todoist.com/showTask?id=:id');



async function getToken () {

  let token = Utils.context.workspaceState.get('todoistToken');

  if (!token) {
    token = await vscode.window.showInputBox ({ placeHolder: 'Please, insert Todoist API token ...' });
    if (token) Utils.context.workspaceState.update('todoistToken', token);
  }

  return token;

}

async function todoistSync (tasks, uri) {

  // Make sure we have an authentication token
  const token = await getToken();
  if (!token) {
    console.warn('No Todoist token available');
    return;
  }
  else console.log(token);

  // Get the local config
  const defaults = vscode.workspace.getConfiguration('todoist-sync', uri).get<TodoistConfiguration>('defaults');

  const cmds = tasks.map(constructTodoistCommand);

  console.log('Synchronizing to Todoist', defaults, tasks, cmds);

  const response = await callTodoistSyncAPI(token, cmds);

  console.log('Got response from Todoist');
  // console.log(response.data.sync_token);
  console.log(response, response.temp_id_mapping);


  return tasks.filter(x => !!x.temp_id).map(x => ({ externalURL: TodoistTaskUrl.stringify({ id: response.temp_id_mapping[x.temp_id] }), ...x }));

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

const endpoint = 'https://todoist.com/api/v7/sync';

async function callTodoistSyncAPI (token, commands) {

  console.log('Sending commands', JSON.stringify(commands));

  const options = {
    method: "GET",
    uri: endpoint,
    qs:  {
      token,
      /* sync_token: '*',
      resource_types: '["projects", "labels"]', */
      commands: JSON.stringify(commands)
    },
    headers: {
      "User-Agent": "Request-Promise"
    },
    json: true
  };

  return rp(options);
}

export { todoistSync };

/*
project_id
priority
labels Array of Integer
assigned_by_uid
responsible_uid
*/