
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

let Config = {
  get<T>(section: string, defaultValue?: T): T | undefined {
    return configuration.get(section, defaultValue);
  },

  has(section: string): boolean {
    return configuration.has(section);
  },

  inspect<T>(section: string): {defaultValue?: T, globalValue?: T, key: string, workspaceFolderValue?: T, workspaceValue?: T} | undefined {
    return configuration.inspect(section);
  },

  update(section: string, value: any, configurationTarget?: vscode.ConfigurationTarget | boolean): Thenable<void> {
    return configuration.update(section, value, configurationTarget);
  }
};

vscode.workspace.onDidChangeConfiguration ( () => {
  configuration = vscode.workspace.getConfiguration(myExtension);
});

export default Config;
