console.log('hi');

import * as _ from 'lodash';
import * as Benchmark from 'benchmark';
(window as any).Benchmark = Benchmark;
console.log(_.extend({}, {}));

import * as p from 'papaparse';

import {
  csvString
} from './data'

import {
  csvParse
} from 'd3-dsv';

console.log(parseData(csvString, ','));

let suite = new Benchmark.Suite;
// add tests 
suite.add('parseData', () => {
  parseData(csvString, ',');
})
/*.add('parseDataNoQuotes', () => {
  parseDataNoQuotes(csvStringSimple, ',');
})
*/
.add('d3 dsv', () => {
  csvParse(csvString);
})
.add('papaparse', () => {
  p.parse(csvString, {
    delimiter: ","
  });
})
// add listeners 
.on('cycle', function(event: any) {
  let div = document.createElement('div');
  div.textContent = String(event.target);
  let out = document.getElementById('output');
  out.appendChild(div);
  console.log(String(event.target));
})
.on('complete', function() {
  let div = document.createElement('div');
  div.textContent = 'Fastest is ' + this.filter('fastest').map('name');
  let out = document.getElementById('output');
  out.appendChild(div);
})
// run async 
.run({ 'async': true });

function parseData(data: string, delimiter: string) {
  let len = data.length;
  const CHR_DELIMITER = delimiter.charCodeAt(0);
  const CHR_QUOTE = 34; // "
  const CHR_LF = 10; // \n
  const CHR_CR = 13; // \r
  enum STATE {
    ESCAPED,
    ESCAPED_FIRST_QUOTE,
    UNESCAPED,
    NEW_FIELD,
    NEW_ROW,
    CR
  }
  const { ESCAPED, ESCAPED_FIRST_QUOTE, UNESCAPED, NEW_FIELD, NEW_ROW, CR } = STATE;
  let state = NEW_ROW;
  let offsets = [];
  let i = -1;
  let char;
  while (i < len - 2) {
    i++;
    if (state === NEW_ROW) {
      offsets.push(i);
    }
    char = data[i].charCodeAt(0);
    switch (state) {
    case NEW_ROW:
    case NEW_FIELD:
      switch (char) {
      case CHR_QUOTE:
        state = ESCAPED;
        break;
      case CHR_CR:
        state = CR;
        break;
      case CHR_LF: //non-compliant
        state = NEW_ROW;
        break;
      default:
        state = UNESCAPED;
        break;
      }
      break;

    case ESCAPED:
      // skip ahead until we see another quote
      i = data.indexOf('"', i);
      if (i < 0) {throw 'mismatched quote';}
      char = data[i].charCodeAt(0);
      switch (char) {
      case CHR_QUOTE:
        state = ESCAPED_FIRST_QUOTE;
        break;
      default: continue;
      }
      break;

    case ESCAPED_FIRST_QUOTE:
      switch (char) {
      case CHR_QUOTE:
        state = ESCAPED;
        break;
      case CHR_DELIMITER:
        state = NEW_FIELD;
        break;
      case CHR_CR:
        state = CR;
        break;

      case CHR_LF: //non-compliant
        state = NEW_ROW;
        break;

      default:
        throw 'quote in escaped field not followed by quote, delimiter, or carriage return';
      }
      break;

    case UNESCAPED:
      switch (char) {
      case CHR_DELIMITER:
        state = NEW_FIELD;
        break;
      case CHR_CR:
        state = CR;
        break;

      case CHR_LF: //non-compliant
        state = NEW_ROW;
        break;

      default: continue;
      }
      break;

    case CR:
      switch (char) {
      case CHR_LF:
        state = NEW_ROW;
        break;
      default:
        throw 'CR not followed by newline';
      }
      break;

    default:
      throw 'state not recognized';
      }
    }
    return offsets;
  }

  /*
function parseDataNoQuotes(data: string, delimiter: string) {
    let len = data.length;
    let i = 0;
    let offsets = [0];
    let k = 0;
    while (i < len) {
      k = data.indexOf('\n', i);
      if (k > 0) {
        offsets.push(k);
      } else {
        break;
      }
      i = k+1;
    }
    return offsets;
  }
*/