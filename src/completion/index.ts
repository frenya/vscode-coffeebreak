
import * as vscode from 'vscode';

import { MentionsCompletionItemProvider } from './mentions';
import { DateCompletionItemProvider } from './date';

export function init (context: vscode.ExtensionContext) {
  // Register completion providers
  const selector = { scheme: 'file', language: 'markdown' };
  const completionItemProvider = new MentionsCompletionItemProvider();
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(selector, completionItemProvider, '@'));

  const dateCompletionItemProvider = new DateCompletionItemProvider();
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(selector, dateCompletionItemProvider, '/'));
}

