
/* IMPORT */

import * as _ from 'lodash';

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
    mention: /@[A-Z][a-zA-Z]*/g,
    label: /#(\w+)/g,
    // NOTE: This is the regex used in task extraction
    // date: /\s[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}/;
    date: /\d{4}-\d{2}-\d{2}/g,
    emptyLink: /\[\]\(([^)]*)\)/g,
  }
};

type IConsts = typeof Consts;

export default Consts as IConsts;
