
/* IMPORT */

import * as _ from 'lodash';
import * as querystring from 'querystring';
import * as vscode from 'vscode';
import Config from '../../../config';
import EmbeddedView from '../../../views/embedded';
import Folder from '../../folder';

/* ABSTRACT */

export const pathNormalizer = filePath => filePath.replace ( /\\/g, '/' ).normalize();

export interface TaskType {
  todo: string;
  owner: string;
  myself: boolean;
  message: string;
  code: string;
  rawLine: string;
  line: string;
  lineNr: number;
  filePath: string;
  root: string;
  rootPath: string;
  relativePath: string;
  dueDate?: string;
  externalURL?: string;
  sync?: {
    command?: string;
  };
}


class Abstract {

  include = undefined;
  exclude = undefined;
  rootPaths = undefined;
  filesData = undefined; // { [filePath]: todo[] | undefined }
  watcher: vscode.FileSystemWatcher = undefined;

  async get ( rootPaths = Folder.getAllRootPaths (), filter ) {

    rootPaths = _.castArray ( rootPaths );

    const config = Config(null);
    this.include = config.get('include');
    this.exclude = config.get('exclude');

    if ( !this.filesData || !_.isEqual ( this.rootPaths, rootPaths ) ) {

      this.rootPaths = rootPaths;
      this.unwatchPaths ();
      await this.initFilesData ( rootPaths );
      this.watchPaths ();

    } else {

      await this.updateFilesData ();

    }

    return this.getTodos ( filter );

  }

  async watchPaths () {

    /* HANDLERS */

    const refresh = _.debounce ( () => EmbeddedView.refresh (), 250 );

    const add = event => {
      if ( !this.filesData ) return;
      const filePath = pathNormalizer ( event.fsPath );
      if ( this.filesData.hasOwnProperty ( filePath ) ) return;
      if ( !this.isIncluded ( filePath ) ) return;
      this.filesData[filePath] = undefined;
      refresh ();
    };

    const change = event => {
      if ( !this.filesData ) return;
      const filePath = pathNormalizer ( event.fsPath );
      if ( !this.isIncluded ( filePath ) ) return;
      this.filesData[filePath] = undefined;
      refresh ();
    };

    const unlink = event => {
      if ( !this.filesData ) return;
      const filePath = pathNormalizer ( event.fsPath );
      delete this.filesData[filePath];
      refresh ();
    };

    /* WATCHING */

    this.include.forEach ( glob => {

      this.watcher = vscode.workspace.createFileSystemWatcher ( glob );

      this.watcher.onDidCreate ( add );
      this.watcher.onDidChange ( change );
      this.watcher.onDidDelete ( unlink );

    });

  }

  unwatchPaths () {

    if ( !this.watcher ) return;

    this.watcher.dispose ();

  }

  getIncluded ( filePaths ) {

    const micromatch = require ( 'micromatch' ); // Lazy import for performance

    return micromatch ( filePaths, this.include, { ignore: this.exclude, dot: true } );

  }

  isIncluded ( filePath ) {

    return !!this.getIncluded ([ filePath ]).length;

  }

  async initFilesData ( rootPaths ) {

    this.filesData = {};

  }

  async updateFilesData () {}

  getTodos ( filter ) {

    if ( _.isEmpty ( this.filesData ) ) return;

    const todos = {}, // { [ROOT] { [TYPE] => [DATA] } }
          filePaths = Object.keys ( this.filesData );

    const addTodo = (todo, root, owner) => {
      if (!todos[root]) todos[root] = {};
      if (!todos[root][owner]) todos[root][owner] = [];
      todos[root][owner].push(todo);
    };

    filePaths.map(pathNormalizer).forEach ( filePath => {
      // Get the tasks in a file, return if empty
      const data = this.filesData[filePath];
      if ( !data || !data.length ) return;

      data.forEach ( datum => {
        if ( filter && !filter(datum) ) return;

        addTodo(datum, datum.root || '', datum.owner || '');

        // Use labels to add the task to other folders too
        if (datum.label) {
          addTodo(datum, datum.label, datum.owner || '');
          if ( !todos[datum.label] ) todos[datum.label] = {};
        }
      });

    });

    const roots = Object.keys ( todos );

    return roots.length > 1 ? todos : { '': todos[roots[0]] };

  }

}

/* EXPORT */

export default Abstract;
