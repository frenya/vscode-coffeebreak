
/* IMPORT */

import * as _ from 'lodash';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as vscode from 'vscode';

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

  getTaskIcon ( due ) { // -1 for overdue, 0 for due today, 1 for future, null for undated

    // due today
    let color = 'd28019';

    // Determine icon color
    if (due == null) {
      color = '333333';
    }
    else if (due < 0) {
      color = 'd03535';
    }
    else if (due > 0) {
      color = '21cadd';
    }

    if ( View.icons[color] ) return View.icons[color];

    const { context } = require ( '.' ).default; // Avoiding a cyclic dependency
    const iconPath = path.join ( context.storagePath, `task-color-${color}.svg` );

    mkdirp.sync ( context.storagePath );

    if ( !fs.existsSync ( iconPath ) ) {

      const image = `<?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve"><circle fill="#${color}" cx="8" cy="8" r="5.4"/></svg>`;

      fs.writeFileSync ( iconPath, image );

    }

    View.icons[color] = iconPath;

    return iconPath;

  }

};

/* EXPORT */

export default View;
