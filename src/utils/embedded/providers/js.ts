
/* IMPORT */

import * as _ from 'lodash';
import * as path from 'path';
import stringMatches from 'string-matches';
import Consts from '../../../consts';
import File from '../../file';
import Folder from '../../folder';
import Abstract, { pathNormalizer } from './abstract';

const dateRegex = /\s[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}/;
const linkRegex = /\[\]\(([^)]*)\)/;


/* JS */

class JS extends Abstract {

  async getFilePaths ( rootPaths ) {

    const globby = require ( 'globby' ); // Lazy import for performance

    return _.flatten ( await Promise.all ( rootPaths.map ( cwd => globby ( this.include, { cwd, ignore: this.exclude, dot: true, absolute: true } ) ) ) );

  }

  async initFilesData ( rootPaths ) {

    const filePaths = await this.getFilePaths ( rootPaths );

    this.filesData = {};

    /*
    await Promise.all ( filePaths.map ( async ( filePath: string ) => {

      this.filesData[filePath] = await this.getFileData ( filePath );

    }));
    */

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

  async getFileData ( filePath ) {

    const data = [],
          content = await File.read ( filePath );

    if ( !content ) return data;

    const lines = content.split ( /\r?\n/ );

    let defaultType = '<unassigned>';

    const parsedPath = Folder.parsePath ( filePath );
    if (parsedPath.relativePath.startsWith('@')) defaultType = path.basename(filePath, path.extname(filePath));

    lines.forEach ( ( rawLine, lineNr ) => {

      const line = _.trimStart ( rawLine ),
            matches = stringMatches ( line, Consts.regexes.todoEmbedded );

      if ( !matches.length ) return;

      matches.forEach ( match => {

        data.push (
          this.extractRegex(
            this.extractRegex({
                todo: match[0],
                type: match[1].trim() || defaultType,
                message: match[2],
                code: line.slice ( 0, line.indexOf ( match[0] ) ),
                rawLine,
                line,
                lineNr,
                filePath,
                root: parsedPath.root,
                rootPath: parsedPath.rootPath,
                relativePath: parsedPath.relativePath
              }, 
              dateRegex, 0, 'dueDate'
            ),
            linkRegex, 1, 'externalURL'
          )
        );
      
      });

    });

    return data;

  }

  // Extract a regex from obj.message, store it in attribute name
  extractRegex (obj, regex, group, attributeName) {

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
