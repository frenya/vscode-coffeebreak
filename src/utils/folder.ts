
/* IMPORT */

import * as _ from 'lodash';
import * as absolute from 'absolute';
import * as findUp from 'find-up';
import * as path from 'path';
import * as vscode from 'vscode';

/* FOLDER */

const Folder = {

  getAllRootPaths () {

    const {workspaceFolders} = vscode.workspace;

    if ( !workspaceFolders ) return [];

    return workspaceFolders.map ( folder => folder.uri.fsPath );

  },

  getRootPath ( basePath? ) {

    const {workspaceFolders} = vscode.workspace;

    if ( !workspaceFolders ) return;

    const firstRootPath = workspaceFolders[0].uri.fsPath;

    if ( !basePath || !absolute ( basePath ) ) return firstRootPath;

    const rootPaths = workspaceFolders.map ( folder => folder.uri.fsPath ),
          sortedRootPaths = _.sortBy ( rootPaths, [path => path.length] ).reverse (); // In order to get the closest root

    return sortedRootPaths.find ( rootPath => basePath.startsWith ( rootPath ) );

  },

  async getWrapperPathOf ( rootPath, cwdPath, findPath ) {

    const foundPath = await findUp ( findPath, { cwd: cwdPath } );

    if ( foundPath ) {

      const wrapperPath = path.dirname ( foundPath );

      if ( wrapperPath.startsWith ( rootPath ) ) {

        return wrapperPath;

      }

    }

  },

  rootsRe: undefined,

  initRootsRe () {

    const roots = Folder.getAllRootPaths ().sort ().reverse (),
          rootsRe = new RegExp ( `^(${roots.map ( root => _.escapeRegExp ( root ).replace ( /\\\\/g, '(?:\\\\|/)' ) ).join ( '|' )})(.*)$` );

    Folder.rootsRe = rootsRe;

  },

  parsePath ( filePath ): any { //TSC

    if ( !Folder.rootsRe ) {
      console.warn('Roots RegExp not initialized, all paths treated as external');
    }

    const match = Folder.rootsRe ? Folder.rootsRe.exec ( filePath ) : null;

    if ( match ) { // Interal path

      return {
        filePath,
        root: path.basename ( match[1] ),
        rootPath: match[1],
        subdirPath: path.dirname(match[2]),
        relativePath: path.basename(match[2])
      };

    } else { // External path

      return {
        filePath,
        root: path.basename ( path.dirname ( filePath ) ),
        rootPath: path.dirname ( filePath ),
        subdirPath: '',
        relativePath: path.basename ( filePath )
      };

    }

  }

};

/* EXPORT */

export default Folder;
