
/* IMPORT */

import * as vscode from 'vscode';
import Item from './items/item';

/* VIEW */

class View implements vscode.TreeDataProvider<Item> {

  constructor () {
  }

  getTreeItem ( item: Item ): vscode.TreeItem {
    return item;
  }

  async getChildren ( item?: Item ): Promise<Item[]> {
    return [];
  }

}

/* EXPORT */

export default View;
