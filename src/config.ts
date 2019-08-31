// import * as _ from 'lodash';
import * as vscode from 'vscode';

const myExtension = 'coffeebreak';

let Config = (uri) => {
  // NOTE: I plan to add some extra methods to the result
  let configuration = vscode.workspace.getConfiguration(myExtension, uri);
  return configuration;
};

export default Config;
