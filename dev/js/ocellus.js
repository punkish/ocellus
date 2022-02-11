/* generated: __buildDate__ */
// import { $, $$ } from './i-utils.js';
// import * as listeners from './i-listeners.js';
// import { globals } from './i-globals.js';
import { case1, case3 } from './i-main.js';

log.level = log[O.loglevel];

const init = () => {
    const loc = new URL(location);
    let qs = loc.search;

    if (qs) {
        if (qs.substring(0, 1) === '?') {
            qs = qs.substring(1);
        }

        case3(qs);
    }
    else {
        case1();
    }
}

//export { init, case2 }
export { init }