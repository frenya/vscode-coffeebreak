import * as vscode from 'vscode';
import Item from './item';

class Group extends Item {

  contextValue = 'group';

  constructor(obj, label) {
    super (obj, label, vscode.TreeItemCollapsibleState.Expanded);
  }

}

export default Group;
