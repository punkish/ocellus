/* generated: __buildDate__ */

import * as main from './main.js';

const loglevel = window.location.hostname === 'localhost' 
    ? 'INFO'
    : 'ERROR';

log.level = log[loglevel];

const init = () => {
    const loc = new URL(location);
    let qs = loc.search;
    
    const searchType = loc.hash && loc.hash === '#fs'
        ? 'fs'
        : '';

    main.initializeFancySearch(searchType);

    if (qs) {
        if (qs.substring(0, 1) === '?') {
            qs = qs.substring(1);
        }

        main.loadBookmarkedWebSite(qs);
    }
    else {
        main.loadBlankWebSite();
    }
}

export { init }