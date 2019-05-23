
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import config from '../config';

async function createMention (mention) {

    if (!mention) {
        mention = await vscode.window.showInputBox ({ placeHolder: 'Enter username without the @ sign ...' });
    }

    // console.log(mention);

    let mentions = <string[]>config.get('mentions');

    if (mentions.includes(mention)) return;
    else mentions.push(mention);

    // Update the config value
    // NOTE: we apparently must update the key that is defined in contributions in package.json, not just part of it
    const result = config.update('mentions', mentions, false);

    vscode.window.showInformationMessage(`Added @${mention}`);

}

export { createMention };
