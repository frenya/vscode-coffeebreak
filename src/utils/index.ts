
/* IMPORT */

import * as vscode from 'vscode';

import embedded from './embedded';
import file from './file';
import folder from './folder';
import init from './init';
import view from './view';

/* UTILS */

const Utils = {
  context: <vscode.ExtensionContext> undefined,
  embedded,
  file,
  folder,
  init,
  view
};

/* EXPORT */

export default Utils;
