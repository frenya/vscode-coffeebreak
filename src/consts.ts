
/* IMPORT */

import * as _ from 'lodash';
import Config from './config';

/* CONSTS */

const Consts = {
  languageId: 'todo',
  regexes: {
    todoEmbedded: new RegExp ('(?:-\\s*\\[ \\])(?:( (?:@[^\\s]*)?))(.*)', 'g' ),
  }
};

type IConsts = typeof Consts;

export default Consts as IConsts;