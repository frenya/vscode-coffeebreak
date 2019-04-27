
/* IMPORT */

var moment = require('moment');

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

    if ( icon ) {
      this.setTypeIcon ( obj.type );
    }

    // console.log('Detecting date in', obj.line);
    // Detect due date
    let match = /[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}/.exec(obj.line);
    if (match && match.length) {
      this.description = moment(match[0]).calendar(null, displayFormat);
    }

  }

}

/* EXPORT */

export default Todo;
