
/* IMPORT */

import * as moment from 'moment';
import Utils from '../../utils';
import Consts from '../../consts';

import Item from './item';

const displayFormat = {
  sameDay: '[Today]', 
  nextDay: '[Tomorrow]', 
  nextWeek: 'dddd', 
  sameElse: 'dddd, MMM DD'
};

const dateRegex = /\s[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}/;
const linkRegex = /\[\]\(([^)]*)\)/;

/* TODO */

class Todo extends Item {

  contextValue = 'todo';

  constructor ( obj, label, icon = false ) {

    super ( obj, label );

    this.tooltip = obj.message;

    this.command = {
      title: 'Reveal',
      command: 'coffeebreak.viewRevealTodo',
      arguments: [this]
    };

    // Detect due date
    let matchDate = dateRegex.exec(label);
    if (matchDate && matchDate.length) {
      this.setTaskIcon(Todo.getDateColor(matchDate[0]));
    }
    else this.setTaskIcon(Todo.getDateColor(null));

    // Remove the date from label
    this.label = this.label.replace(dateRegex, '');

    // Detect external service link
    let matchLink = linkRegex.exec(label);
    if (matchLink && matchLink.length) {
      const url = matchLink[1];
      console.log('Detected url', url);
      this.contextValue = 'todo-linked';
      this.obj.externalURL = url;
    }

    // Remove the date from label
    this.label = this.label.replace(linkRegex, '');

  }

  setTaskIcon (color) {
    this.iconPath = Utils.view.getTaskIcon(color) || this.iconPath;
  }

  static getDateColor (dateStr) {
    if (dateStr) {
      const dueDate = moment(dateStr);
      const today = moment();
      if (dueDate.isSame(today, 'day')) {
        return Consts.dateColors.dueSoon;
      }
      else if (dueDate.isBefore(today, 'day')) {
        return Consts.dateColors.overdue;
      }
      else if (dueDate.isAfter(today, 'day')) {
        return Consts.dateColors.future;
      }
    }
    else return Consts.dateColors.undated;
  }

}

/* EXPORT */

export default Todo;
