
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
}


class Abstract {

  include = undefined;
  exclude = undefined;
  rootPaths = undefined;
  filesData = undefined; // { [filePath]: todo[] | undefined }
  watcher: vscode.FileSystemWatcher = undefined;

  async get ( rootPaths = Folder.getAllRootPaths (), groupByRoot = true, groupByOwner = true, groupByFile = true, filter ) {

    rootPaths = _.castArray ( rootPaths );

    const config = Config.get ();

    this.include = config.embedded.include;
    this.exclude = config.embedded.exclude;

    if ( !this.filesData || !_.isEqual ( this.rootPaths, rootPaths ) ) {

      this.rootPaths = rootPaths;
      this.unwatchPaths ();
      await this.initFilesData ( rootPaths );
      this.watchPaths ();

    } else {

      await this.updateFilesData ();

    }

    return this.getTodos ( groupByRoot, groupByOwner, groupByFile, filter );

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

  getTodos ( groupByRoot, groupByOwner, groupByFile, filter ) {

    if ( _.isEmpty ( this.filesData ) ) return;

    const todos = {}, // { [ROOT] { [TYPE] => { [FILEPATH] => [DATA] } } }
          filePaths = Object.keys ( this.filesData );

    filePaths.map(pathNormalizer).forEach ( filePath => {

      const data = this.filesData[filePath];

      if ( !data || !data.length ) return;

      const filePathGroup = groupByFile ? filePath : '';

      data.forEach ( datum => {

        if ( filter && !filter(datum) ) return;

        const rootGroup = groupByRoot ? datum.root : '';

        if ( !todos[rootGroup] ) todos[rootGroup] = {};

        const ownerGroup = groupByOwner ? datum.owner : '';

        if ( !todos[rootGroup][ownerGroup] ) todos[rootGroup][ownerGroup] = {};

        if ( !todos[rootGroup][ownerGroup][filePathGroup] ) todos[rootGroup][ownerGroup][filePathGroup] = [];

        todos[rootGroup][ownerGroup][filePathGroup].push ( datum );

      });

    });

    const roots = Object.keys ( todos );

    return roots.length > 1 ? todos : { '': todos[roots[0]] };

  }

}

/* EXPORT */

export default Abstract;
