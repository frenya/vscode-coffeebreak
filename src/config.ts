
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';

const myExtension = 'coffeebreak';

/*
interface Configuration {
  include: string[];
  exclude: string[];
  expanded: boolean;
  mentions: string[];
  sync: {
    command: string;
    ownerFilter: string;
  };
}
*/

let configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(myExtension);

vscode.workspace.onDidChangeConfiguration ( () => {
  configuration = vscode.workspace.getConfiguration(myExtension);
});

export default config;
