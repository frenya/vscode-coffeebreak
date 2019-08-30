
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';

interface InspectValue {
  key: string;
  defaultValue: any;
  globalValue: any;
  workspaceFolderValue: any;
  workspaceValue: any;
}

async function createMention (mention, uri = null) {

    const project = !!uri;
    
    const config = vscode.workspace.getConfiguration('coffeebreak', uri);
    if (!mention) {
        mention = await vscode.window.showInputBox ({ placeHolder: 'Enter username without the @ sign ...' });
    }

    const value = <InspectValue>config.inspect('mentions');
    let mentions = (project ? value.workspaceFolderValue : value.workspaceValue) || {};

    if (mentions[mention]) return;
    else mentions[mention] = {};

    // Update the config value
    // NOTE: we apparently must update the key that is defined in contributions in package.json, not just part of it
    const configTarget = project ? vscode.ConfigurationTarget.WorkspaceFolder : vscode.ConfigurationTarget.Workspace;
    const result = await config.update('mentions', mentions, configTarget);

    vscode.window.showInformationMessage(`Added @${mention}`);

}

async function addMentionDetail (mention, attribute, uri = null) {

  console.log(mention, attribute, uri);

  const config = vscode.workspace.getConfiguration('coffeebreak', uri);
  const attributeValue = await vscode.window.showInputBox ({ placeHolder: `Enter value for ${attribute} ...`});

  const value = <InspectValue>config.inspect('mentions');
  const project = !!(value.workspaceFolderValue && value.workspaceFolderValue[mention]);

  let mentions = (project ? value.workspaceFolderValue : value.workspaceValue) || {};

  if  (!mentions[mention]) mentions[mention] = {};
  mentions[mention][attribute] = attributeValue;

  // Update the config value
  // NOTE: we apparently must update the key that is defined in contributions in package.json, not just part of it
  const configTarget = project ? vscode.ConfigurationTarget.WorkspaceFolder : vscode.ConfigurationTarget.Workspace;
  const result = await config.update('mentions', mentions, configTarget);

  vscode.window.showInformationMessage(`Set ${mention}.${attribute} to ${attributeValue}`);

}

export { createMention, addMentionDetail };
