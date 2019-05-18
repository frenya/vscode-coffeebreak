
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';

async function createMention (mention) {

    if (!mention) {
        mention = await vscode.window.showInputBox ({ placeHolder: 'Enter username without the @ sign ...' });
    }

    // console.log(mention);

    let config = vscode.workspace.getConfiguration('coffeebreak.mentions');
    let tags = <string[]>config.get('tags');

    if (tags.includes(mention)) return;
    else tags.push(mention);

    // Update the config value
    // NOTE: we apparently must update the key that is defined in contributions in package.json, not just part of it
    const result = vscode.workspace.getConfiguration().update('coffeebreak.mentions', { tags }, false);

    vscode.window.showInformationMessage(`Added @${mention}`);

}

export { createMention };
