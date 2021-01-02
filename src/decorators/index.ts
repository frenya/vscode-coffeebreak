import * as vscode from 'vscode';

import { CoffeebreakDecorator } from './coffeebreak';

let mainDecorator = undefined;

export function init (context: vscode.ExtensionContext) {
  mainDecorator = new CoffeebreakDecorator(context);  
}

export default { init };