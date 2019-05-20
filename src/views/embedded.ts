
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Utils from '../utils';
import File from './items/file';
import Item from './items/item';
import Group from './items/group';
import Placeholder from './items/placeholder';
import Todo from './items/todo';
import View from './view';

/* EMBEDDED */

//TODO: Collapse/Expand without rebuilding the tree https://github.com/Microsoft/vscode/issues/54192

class Embedded extends View {

  id = 'coffeebreak.views.coffeeBreak';
  clear = false;
  expanded = true;
  filter: string | false = false;
  filterRe: RegExp | false = false;
  filterOwner: string | false = false;
  filterDueDate: string | false = false;
  hideLinked = false;
  filePathRe = /^(?!~).*(?:\\|\/)/;

  getTreeItem ( item: Item ): vscode.TreeItem {

    if ( item.collapsibleState !== vscode.TreeItemCollapsibleState.None ) {
      item.collapsibleState = this.expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed;
    }

    return item;

  }

  async getEmbedded () {

    await Utils.embedded.initProvider ();

    return await Utils.embedded.provider.get ( undefined, this.config.embedded.view.groupByRoot, this.config.embedded.view.groupByOwner, this.config.embedded.view.groupByFile, this.isItemVisible.bind(this) );

  }

  isItemVisible (obj) {
    // Filter linked
    if (this.hideLinked && obj.externalURL) return false;

    // Filter by type if applicable
    if (this.filterOwner && obj.type !== this.filterOwner) return false;

    // Filter by due date if applicable
    if (this.filterDueDate && (!obj.dueDate || obj.dueDate > this.filterDueDate)) return false;

    // Filter by text if applicable
    if (this.filterRe && !this.filterRe.test(obj.message)) return false;

    return true;
  }

  async getChildren ( item?: Item ): Promise<Item[]> {

    if ( this.clear ) {

      setTimeout ( this.refresh.bind ( this ), 0 );

      return [];

    }

    // Check the item's data or load the whole tree when item is null (i.e. rendering root)
    let obj = item ? item.obj : await this.getEmbedded ();

    // Collapse unnecessary groups
    while ( obj && '' in obj ) obj = obj[''];

    if ( _.isEmpty ( obj ) ) return [new Placeholder ( 'No embedded todos found' )];

    if ( _.isArray ( obj ) ) {

      return obj.map ( obj => {

        return new Todo ( obj, obj.message, true );

      });

    } else if ( _.isObject ( obj ) ) {

      const keys = Object.keys ( obj ).sort ();

      return keys.map ( key => {

        const val = obj[key];

        if ( this.filePathRe.test ( key ) ) {
          const uri = Utils.view.getURI ( val[0] );
          return new File ( val, uri );
        } 
        else {
          return new Group(val, key);
        }

      });

    }

  }

  refresh ( clear? ) {

    this.clear = !!clear;

    super.refresh ();

  }

}

/* EXPORT */

export default new Embedded ();
