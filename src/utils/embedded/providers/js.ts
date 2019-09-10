
/* IMPORT */

import * as _ from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';
import stringMatches from 'string-matches';
import Config from '../../../config';
import Consts from '../../../consts';
import File from '../../file';
import Folder from '../../folder';
import Abstract, { pathNormalizer, TaskType } from './abstract';
import { isItMyself, mySyncSettings } from '../../../commands/mentions';

const dateRegex = /\s[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}/;
const linkRegex = Consts.regexes.emptyLink;

/* JS */

class JS extends Abstract {

  async getFilePaths ( rootPaths ) {

    const globby = require ( 'globby' ); // Lazy import for performance

    return _.flatten ( await Promise.all ( rootPaths.map ( cwd => globby ( this.include, { cwd, ignore: this.exclude, dot: true, absolute: true } ) ) ) );

  }

  async initFilesData ( rootPaths ) {

    const filePaths = await this.getFilePaths ( rootPaths );

    this.filesData = {};

    await Promise.all ( _.map ( filePaths, async ( filePath: string ) => {

      this.filesData[pathNormalizer(filePath)] = await this.getFileData ( pathNormalizer(filePath) );

    }));

  }

  async updateFilesData () {

    if ( _.isEmpty ( this.filesData ) ) return;

    await Promise.all ( _.map ( this.filesData, async ( val, filePath ) => {

      if ( val ) return;

      this.filesData[pathNormalizer(filePath)] = await this.getFileData ( pathNormalizer(filePath) );

    }));

  }

  async getFileData ( filePath ): Promise<TaskType[]> {

    const data = [],
          content = await File.read ( filePath );

    if ( !content ) return data;

    const lines = content.split ( /\r?\n/ );

    const fileUri = vscode.Uri.file(filePath);
    const config = Config(fileUri);
    let defaultOwner = '<unassigned>';

    const parsedPath = Folder.parsePath ( filePath );
    if (parsedPath.relativePath.startsWith('@')) defaultOwner = path.basename(filePath, path.extname(filePath));

    lines.forEach ( ( rawLine, lineNr ) => {

      const line = _.trimStart ( rawLine ),
            matches = stringMatches ( line, Consts.regexes.todoEmbeddedGlobal );

      if ( !matches.length ) return;

      matches.forEach ( match => {
        let owner = match[1].trim();
        let username = owner.substr(1) || defaultOwner;
        let task: TaskType = {
          todo: match[0],
          owner: owner || defaultOwner,
          myself: false,
          message: match[2],
          code: line.slice ( 0, line.indexOf ( match[0] ) ),
          rawLine,
          line,
          lineNr,
          filePath,
          root: parsedPath.root,
          rootPath: parsedPath.rootPath,
          relativePath: parsedPath.relativePath
        };

        this.extractRegex(task, dateRegex, 0, 'dueDate');
        this.extractRegex(task, linkRegex, 1, 'externalURL');
        this.extractRegex(task, Consts.regexes.label, 1, 'label');

        // Detect "my" tasks
        task.myself = isItMyself(config, username); // TODO: Maybe useless, could be replaced with !!task.sync
        task.sync = mySyncSettings(config, username);


        data.push (task);
      });

    });

    return data;

  }

  // Extract a regex from obj.message, store it in attribute name
  extractRegex (obj: TaskType, regex: RegExp, group: number, attributeName: string): TaskType {

    // Detect due date
    let match = regex.exec(obj.message);
    if (match && match.length > group) obj[attributeName] = match[group].trim();

    // Remove the regex from message
    obj.message = obj.message.replace(regex, '');

    return obj;

  }

}

/* EXPORT */

export default JS;
