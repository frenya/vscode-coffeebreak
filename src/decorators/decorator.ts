import * as vscode from 'vscode';
import * as _ from 'lodash';
import * as path from 'path';
import Config from '../config';
import Consts from '../consts';
import { createCommandUrl } from '../commands';
import Editor from '../editor';
import Utils from '../utils';
import { EditorObserver } from './observer';

export class Decorator extends EditorObserver {

  decorators = {};

  constructor (context: vscode.ExtensionContext) {
    super(context);
  }

  registerGroupDecorator (group: string, style: Object) {
    this.decorators[group] = {
      type: vscode.window.createTextEditorDecorationType(style),
      ranges: [],
    };
  }

  /*
  applyGroupDecorator (group: string) {
    const d = this.decorators[group];
    this.activeEditor.setDecorations(d.type, d.ranges);
  }
  */

  // TODO: Rename to getColorDecorator
  getDateDecorator (dateColor: string) {
    if (!this.decorators[dateColor]) {
      this.registerGroupDecorator(dateColor, { color: '#' + dateColor });
    }
    return this.decorators[dateColor];
  }

  decorateMatches (regEx, callback) {
    const doc = this.activeEditor.document;
    decorateMatchesInDocument(doc, regEx, callback);
  }

  update() {
    // Eligibility check
    if (!Editor.isSupported(this.activeEditor)) {
      // console.warn('Document is not eligible', this.activeEditor.document);
      return;
    }

    // Reset ranges
    Object.keys(this.decorators).forEach(key => this.decorators[key].ranges = []);

    // Populate ranges for all group decorators
    this.updateDecorations();

    // And apply them
    Object.keys(this.decorators).forEach(group => {
      const d = this.decorators[group];
      this.activeEditor.setDecorations(d.type, d.ranges);
    });
  }

  updateDecorations() {
    // Abstract
  }
}

/**
 * Get document range from a regex match.
 * 
 * @param doc Document to use
 * @param match The match, i.e. result of .exec method
 * @param group Group within the match whose range to return
 */
export function getMatchRange (doc: vscode.TextDocument, match, group = 0) {
  const start = doc.positionAt(match.index);
  const end = doc.positionAt(match.index + match[group].length);

  // Debug check - range should never be empty
  // if so, signal a warning and provide debug info
  if (start.isEqual(end)) {
    console.warn('Invalid range', doc.uri.toString(), Consts.regexes.tag.lastIndex, JSON.stringify(start), match, match.index, match.input.substr(match.index));
  }

  return new vscode.Range(start, end);
}

export function decorateMatchesInDocument (doc, regEx, callback) {
  const text = doc.getText();

  // Sanity check
  if (!callback) return;

  let match;
  while (match = regEx.exec(text)) {
    const range = getMatchRange(doc, match);
    callback(match, range);
  }
}
