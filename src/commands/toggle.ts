
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../consts';
import Editor from '../editor';

function toggleTodo () {

  const { bullet } = Consts.symbols,
        { line, todoBox, todoDone } = Consts.regexes;

  Editor.toggleRules (
    [todoBox, `$1${bullet} $3`],
    [todoDone, `$1${bullet} [ ] $3`],
    [line, `$1${bullet} [ ] $3`]
  );

}

function toggleDone () {

  const { bullet, done } = Consts.symbols,
        { line, todoBox, todoDone } = Consts.regexes;

  Editor.toggleRules (
    [todoDone, `$1${bullet} [ ] $3`],
    [todoBox, `$1${bullet} [${done}] $3`],
    [line, `$1${bullet} [${done}] $3`]
  );

}

/* EXPORT */

export { toggleTodo, toggleDone };
