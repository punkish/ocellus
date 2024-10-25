/* generated: __buildDate__ */

import { updatePlaceHolder, qs2form, form2qs } from './utils.js';
import { getResource } from './querier.js';
import { addListeners, showTooltip, hideTooltip } from './listeners.js';
import { initAdvSearch } from './adv-search.js';
import { globals } from './globals.js';
import { initializeMap } from './mapping/index.js';
import { setEnv } from './utils.js';

function init() {
    setEnv(globals);
    const loc = new URL(location);

    if (loc.search) {
        log.info(`- locSearch: ${loc.search.substring(1)}`);
        qs2form(loc.search.substring(1));

        // create the queryString from the form so all the form fields such 
        // as page and size are also included properly
        const queryString = form2qs();
        getResource(queryString);
    }
    else {
        updatePlaceHolder('images');
    }

    addListeners();
    initAdvSearch();
}

export { 
    init, 
    showTooltip, 
    hideTooltip, 
    initializeMap
}