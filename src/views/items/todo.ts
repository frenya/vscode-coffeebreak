
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

    // console.log('Detecting date in', obj.line);
    // Detect due date
    let match = /[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}/.exec(obj.line);
    if (match && match.length) {
      const dueDate = moment(match[0]);
      const today = moment();
      this.description = dueDate.calendar(null, displayFormat);
      if (dueDate.isSame(today, 'day')) {
        this.setTaskIcon(0);
      }
      else if (dueDate.isBefore(today, 'day')) {
        this.setTaskIcon(-1);
      }
      else if (dueDate.isAfter(today, 'day')) {
        this.setTaskIcon(1);
      }
    }
    else this.setTaskIcon ( null );



  }

  setTaskIcon ( due ) {

    const iconPath = Utils.view.getTaskIcon ( due );

    if ( iconPath ) {

      this.iconPath = iconPath;

    }
   
  }

}

/* EXPORT */

export default Todo;
