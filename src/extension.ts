
/* IMPORT */

import * as vscode from 'vscode';
import Config from './config';
import Consts from './consts';
import Utils from './utils';
import * as Views from './views';
import * as Commands from './commands';
import Decorators from './decorators';
import { getFullname } from './commands/mentions';
var regexp = require('markdown-it-regexp');
import * as CompletionProviders from './completion';
import { open as openWhatsNew } from './views/whatsnew';

/* ACTIVATE */

const activate = function ( context: vscode.ExtensionContext ) {

  Utils.context = context;
  Utils.folder.initRootsRe ();

  Utils.embedded.initProvider();

  Views.init();

  Decorators.init(context);

  context.subscriptions.push (
    vscode.workspace.onDidChangeWorkspaceFolders ( () => Utils.embedded.provider && Utils.embedded.provider.unwatchPaths () ),
    vscode.workspace.onDidChangeWorkspaceFolders ( Utils.folder.initRootsRe )
  );

  // Init commands
  Commands.init(context);

  CompletionProviders.init(context);

  // TODO: Store last active editor using vscode.window.onDidChangeActiveTextEditor(e => e.document.uri), when e is not undefined
  function parser(match, utils) {
    // Sanity check
    if (!vscode.window.activeTextEditor) return match[0];

    // Check for full name in the mentions directory
    return getFullname(match[1], vscode.window.activeTextEditor.document.uri);
  }

  openWhatsNew();

  return {
    extendMarkdownIt: function (md) {
      return md.use(regexp(Consts.regexes.mention, parser));
    }
  };
};

/* EXPORT */

export {activate};
