import * as vscode from 'vscode';
import * as _ from 'lodash';
import * as path from 'path';
import Config from '../config';
import Consts from '../consts';
import { createCommandUrl } from '../commands';
import Editor from '../editor';
import Utils from '../utils';

import Todo from '../views/items/todo';

import styles from './styles';
import { mySyncSettings } from '../commands/mentions';
import { Decorator, getMatchRange } from './decorator';

export class CoffeebreakDecorator extends Decorator {

  constructor (context: vscode.ExtensionContext) {
    super(context);

    // Used for empty links
    this.registerGroupDecorator('link', styles.syncLink);
    this.registerGroupDecorator('missing', styles.missingMention);
    this.registerGroupDecorator('checkbox', { /* no extra styling, only the hover message will be set */ });

  }
  
  getMentionDecorator (group) {
    // Lazy initialization of the decorator types
    if (!this.decorators[group]) {
      this.registerGroupDecorator(group, styles.mention);
    }
    return this.decorators[group];
  }

  getMentionHoverMessage (mention, owner, uri) {

    const username = mention.substr(1);

    const detailLine = (attribute, title = null) => {
      if (owner[attribute]) return owner[attribute];

      const commandUri = createCommandUrl('addMentionDetail', username, attribute, uri.path);
      return `[Add ${title || attribute}](${commandUri})`;
    };

    let contents = null;

    if (owner) {
      // Create bullets with custom attributes
      // i.e. any string or number value in the object
      const { fullname, email, sync, ...m } = owner;
      
      const keys = _.sortBy(Object.keys(m));
      const bullets = keys.map(k => {
        const v = m[k];
        return ((typeof v === 'string') || (typeof v === 'number')) ? `\n* *${k}*: ${v}` : '';
      }).join('');

      contents = new vscode.MarkdownString(`**${username}**\n\n* ${detailLine('fullname', 'full name')}\n* ${detailLine('email')}${bullets}`);
    }
    else {
      const commandUri1 = createCommandUrl('createMention', username);
      const commandUri2 = createCommandUrl('createMention', username, uri.path);
      contents = new vscode.MarkdownString(`Click here to add *${username}* to [workspace](${commandUri1}) or [project](${commandUri2})`);
    }

    // To enable command URIs in Markdown content, you must set the `isTrusted` flag.
    // When creating trusted Markdown string, make sure to properly sanitize all the
    // input content so that only expected command URIs can be executed
    contents.isTrusted = true;

    return contents;
  }

  getSyncConfigHoverMessage (syncSettings) {

    if (syncSettings) {
      return new vscode.MarkdownString(`Sync settings:\n\n\`\`\`json\n${JSON.stringify(syncSettings, null, 2)}\n\`\`\``);
    }
    return new vscode.MarkdownString(`Task will not be synchronized`);

  }

  lineIsIncompleteTask (range: vscode.Range) {
    const line = this.activeEditor.document.lineAt(range.start.line);
    return !!line && Consts.regexes.todoEmbedded.test(line.text);
  }

  updateDecorations() {
    const uri = this.activeEditor.document.uri;
    const config = Config(uri);

    // Add hover message to task boxes
    const syncSettings = config.get('sync');
    this.decorateMatches (Consts.regexes.todoBoxGlobal, (match, range) => {
      const taskSyncSettings = mySyncSettings(config, match[2] || '<unassigned>');
      let hoverMessage = this.getSyncConfigHoverMessage(taskSyncSettings ? Object.assign({}, syncSettings, taskSyncSettings) : null);
      this.decorators['checkbox'].ranges.push({ range: getMatchRange(this.activeEditor.document, match, 1), hoverMessage });
    });

    // Decorate due dates
    this.decorateMatches (Consts.regexes.date, (match, range) => {
      const dateColor = Todo.getDateColor(match[0]);
      if (this.lineIsIncompleteTask(range)) {
        this.getDateDecorator(dateColor).ranges.push({ range });
      }
    });

    // Decorate empty links, ungrouped
    this.decorateMatches (Consts.regexes.emptyLink, (match, range) => {
      this.decorators['link'].ranges.push({ range });
    });

    // Decorate mentions
    const mentionTags: object = config.get('mentions');
    this.decorateMatches (Consts.regexes.mentionGlobal, (match, range) => {

      const m = mentionTags[match[1]];
      let group = m ? 'others' : 'missing';
      let hoverMessage = this.getMentionHoverMessage(match[0], m, uri);
      this.getMentionDecorator(group).ranges.push({ range, hoverMessage });
    });

  }

}
