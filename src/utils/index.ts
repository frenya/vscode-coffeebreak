
/* IMPORT */

import * as vscode from 'vscode';

import editor from './editor';
import embedded from './embedded';
import file from './file';
import folder from './folder';
import init from './init';
import regex from './regex';
import view from './view';

/* UTILS */

const Utils = {
  context: <vscode.ExtensionContext> undefined,
  editor,
  embedded,
  file,
  folder,
  init,
  regex,
  view
};

/* EXPORT */

export default Utils;
