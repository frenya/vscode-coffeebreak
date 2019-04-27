
/* IMPORT */

import * as _ from 'lodash';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as vscode from 'vscode';
import Consts from '../consts';

/* VIEW */

const View = {

  uris: {},

  getURI ({ filePath, relativePath }) {

    if ( View.uris[filePath] ) return View.uris[filePath];

    const uri = vscode.Uri.file ( filePath );

    uri['label'] = _.trimStart ( relativePath, '\\/' );

    View.uris[filePath] = uri;

    return uri;

  },

  icons: {},

};

/* EXPORT */

export default View;
