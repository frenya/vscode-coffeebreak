import * as _ from 'lodash';
import * as vscode from 'vscode';
import { myExtension } from '../config';
import * as PublicCommands from './public';
import * as PrivateCommands from './private';

export function init (context: vscode.ExtensionContext) {
  // Initialize public commands
  const {commands} = vscode.extensions.getExtension(`frenya.vscode-${myExtension}`).packageJSON.contributes;

  commands.forEach(({ command, title }) => {
    const handler = PublicCommands[handlerName(command)];

    if (!handler) console.warn('No handler found for command', command);
    else context.subscriptions.push(vscode.commands.registerCommand(command, handler));
  });

  _.forEach(PrivateCommands, (fn, name) => {
    context.subscriptions.push(vscode.commands.registerCommand(commandName(name), fn));
  });
}

export const commandName = handlerName => `${myExtension}.${handlerName}`;
export const handlerName = commandName => _.last(commandName.split('.')) as string;

/**
 * Returns a command url usable in Markdown strings.
 * 
 * @param handlerName Second part of the command name, will be prefixed with extension name.
 * @param params Array of arguments. They will be url encoded.
 */
export const createCommandUrl = (handlerName, ...params) => {
  const encodedParams = encodeURIComponent(JSON.stringify(params));
  return vscode.Uri.parse(`command:${commandName(handlerName)}?${encodedParams}`);
};
