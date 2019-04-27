
/* IMPORT */

var moment = require('moment');
import Utils from '../../utils';

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
      const dueDate = moment(matchDate[0]);
      const today = moment();
      this.description = dueDate.calendar(null, displayFormat);
      if (dueDate.isSame(today, 'day')) {
        this.setTaskIcon('d28019');
      }
      else if (dueDate.isBefore(today, 'day')) {
        this.setTaskIcon('d03535');
      }
      else if (dueDate.isAfter(today, 'day')) {
        this.setTaskIcon('21cadd');
      }
    }
    else this.setTaskIcon('333333');

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

}

/* EXPORT */

export default Todo;
