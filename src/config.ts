// import * as _ from 'lodash';
import * as vscode from 'vscode';

const myExtension = 'coffeebreak';

let Config = (uri: vscode.Uri) => vscode.workspace.getConfiguration(myExtension, uri);

export default Config;
