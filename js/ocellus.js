/* generated: __buildDate__ */

import { updatePlaceHolder, qs2form, form2qs } from './utils.js';
import { getResource } from './querier.js';
import { addListeners, showTooltip, hideTooltip } from './listeners.js';
import { initAdvSearch } from './adv-search.js';
import { globals } from './globals.js';
import { initializeMap } from './mapping/index.js';

function setEnv(globals) {
    const cond1 = window.location.hostname === 'ocellus.localhost';
    const cond2 = window.location.hostname === 'ocellus.local';
    const cond3 = window.location.hostname === '127.0.0.1';
    const cond4 = window.location.hostname === 'localhost';
    window.log.level = 'INFO';

    if (!(cond1 || cond2 || cond3 || cond4)) {
        globals.uri.zenodeo = 'https://test.zenodeo.org/v3';
        globals.uri.maps = 'https://maps.zenodeo.org';
        window.log.level = 'ERROR';
    }
    
}

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