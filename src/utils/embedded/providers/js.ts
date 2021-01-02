
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import stringMatches from 'string-matches';
import Config from '../../../config';
import Consts from '../../../consts';
import Abstract, { pathNormalizer } from './abstract';
import { isItMyself, mySyncSettings } from '../../../commands/mentions';
const metadataParser = require('markdown-yaml-metadata-parser');

const dateRegex = /\s[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}/;
const linkRegex = Consts.regexes.emptyLink;

/**
 * Type of task extracted from a Markdown document.
 */
export interface TaskType {
  todo: string;

  /** Task owner mention (including the "@"" character) */
  owner: string;

  /** True when task owner matches workspace user */
  myself: boolean;

  /** This is the actual text of the task (without the user mention) */
  text: string;

  /** Line in the original document including all whitespace */
  rawLine: string;

  line: string;

  /** Line number in the document, zero based */
  lineNr: number;

  /** Fully qualified file path */
  filePath?: string;

  /** Workspace folder name */
  root?: string;

  /** Workspace folder path */
  rootPath?: string;

  /** Relative path of the document within its workspace folder */
  relativePath?: string;

  /** Due date string in the YYYY-MM-DD format */
  dueDate?: string;

  /** Link to the line in the original document */
  backlinkURL?: string;

}

export interface SyncTaskType extends TaskType {

  /** When synced to external service, the url identifying the task in the external service */
  externalURL?: string;

  /** Local sync settings (combination of workspace, folder and task owner's settings) */
  sync?: {
    command?: string;
  };
  
}

class JS extends Abstract {

  tagList = {};

  parseContent (content, fileData) {
    fileData.data = [];

    const lines = content.split ( /\r?\n/ );

    const fileUri = vscode.Uri.file(fileData.filePath);
    const config = Config(fileUri);
    let defaultOwner = '<unassigned>';
  
      // Parse YAML header (if present), split content and metadata
    const result = metadataParser(content);
    // console.log(result);
    fileData.sources = result.metadata.sources;
    // const contentOffset = content.length - result.content.length;
    // content = result.content;

    lines.forEach ( ( rawLine, lineNr ) => {

      const line = _.trimStart ( rawLine ),
            matches = stringMatches ( line, Consts.regexes.todoEmbeddedGlobal );
  
      if ( !matches.length ) return;
  
      matches.forEach ( match => {
        let owner = match[1].trim();
        let username = owner.substr(1) || defaultOwner;
        let task: SyncTaskType = {
          todo: match[0],
          owner: owner || defaultOwner,
          myself: false,
          text: match[2],
          rawLine,
          line,
          lineNr,
        };
  
        this.extractRegex(task, dateRegex, 0, 'dueDate');
        this.extractRegex(task, linkRegex, 1, 'externalURL');
        this.extractRegex(task, Consts.regexes.label, 1, 'label');
  
        // Detect "my" tasks
        task.myself = isItMyself(config, username); // TODO: Maybe useless, could be replaced with !!task.sync
        task.sync = mySyncSettings(config, username);
  
        fileData.data.push(task);
      });
    });

    // console.log(fileData);
    return fileData;
  }

  // Extract a regex from obj.text, store it in attribute name
  extractRegex (obj: TaskType, regex: RegExp, group: number, attributeName: string): TaskType {

    // Detect due date
    let match = regex.exec(obj.text);
    if (match && match.length > group) obj[attributeName] = match[group].trim();

    // Remove the regex from text
    obj.text = obj.text.replace(regex, '').trim();

    return obj;

  }

  async getTodos (filterFn: Function = () => true) {
    const filesData = await this.getFilesData();

    const todos = {}; // { [ROOT] { [TYPE] => [DATA] } }

    const addTodo = (todo, root, owner) => {
      if (!todos[root]) todos[root] = {};
      if (!todos[root][owner]) todos[root][owner] = [];
      todos[root][owner].push(todo);
    };
      
    await Promise.all(Object.keys(filesData).map(async filePath => {
      // Get the tasks in a file, return if empty
      const data = await this.getTodosFromFileData(filesData[filePath], filterFn);
      
      data.forEach ( datum => {
        addTodo(datum, datum.root || '', datum.owner || '');
      
        // Use labels to add the task to other folders too
        if (datum.label) {
          addTodo(datum, datum.label, datum.owner || '');
          if ( !todos[datum.label] ) todos[datum.label] = {};
        }
      });
    }));

    const roots = Object.keys ( todos );
    return roots.length > 1 ? todos : { '': todos[roots[0]] };
  }

  async getTodosFromFileData (fileData, filterFn: Function = () => true) {
    return fileData.data.filter(filterFn).map(todo => {
      const { data, ...fileMetadata } = fileData;
      Object.assign(todo, fileMetadata);

      // Add document backlink
      todo.backlinkURL = `vscode://file/${encodeURIComponent(todo.filePath)}:${todo.lineNr+1}`;

      return todo;
    });
  }

}

/* EXPORT */

export default JS;


