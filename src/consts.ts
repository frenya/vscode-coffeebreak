
/* IMPORT */

import * as _ from 'lodash';
import Config from './config';

/* CONSTS */

const Consts = {
  languageId: 'markdown',
  symbols: {
    bullet: '-',
    done: 'x'
  },
  dateColors: {
    overdue: 'd03535',
    dueSoon: 'd28019',
    // future: '21cadd',
    future: '21cadd',
    undated: '333333'
  },
  regexes: {
    line: /^(\s*)([*+-]?\s*)(.*)$/,
    todo: /^(\s*)([*+-]\s+\[[ xX]\]\s*)(.*)$/,
    todoBox: /^(\s*)([*+-]\s+\[ \]\s*)(.*)$/,
    todoDone: /^(\s*)([*+-]\s+\[[xX]\]\s*)(.*)$/,
    todoEmbedded: new RegExp ('(?:-\\s*\\[ \\])(?:( (?:@[^\\s]*)?))(.*)', 'g' ),  // FIXME: Not consistent with regexes above
  }
};

type IConsts = typeof Consts;

export default Consts as IConsts;
