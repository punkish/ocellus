/* generated: __buildDate__ */

import { updatePlaceHolder, qs2form, form2qs } from './utils.js';
import { getResource } from './querier.js';
import { addListeners, showTooltip, hideTooltip } from './listeners.js';
import { 
    // getJournalTitles, 
    // getCollectionCodes, 
    journalTitleAc,
    collectionCodeAc
} from './adv-search.js';
import { initializeMap } from './mapping/index.js';

// set loglevel to 'INFO' on local development machine and to 'ERROR' on prod
log.level = log[setLoglevel(window.location.hostname)];

function setLoglevel(hostname) {
    return hostname === 'localhost' 
        ? 'INFO'
        : 'ERROR';
}

function init() {
    const parsedHash = new URLSearchParams(window.location.hash.substring(1));
    const show = parsedHash ? parsedHash.get("show") : 'index';
    
    if (show === 'maps') {
        initializeMap({ 
            mapContainer: 'map', 
            baseLayerSource: 'geodeo', 
            drawControl: false 
        });
    }
    else {
        const loc = new URL(location);

        if (loc.search) {
            log.info(`- locSearch: ${loc.search.substring(1)}`);
            qs2form(loc.search.substring(1));
    
            // create the queryString from the form so all the form fields such as 
            // page and size are also included properly
            const queryString = form2qs();
            getResource(queryString);
        }
        else {
            updatePlaceHolder('images');
        }
    
        addListeners();
        journalTitleAc();
        collectionCodeAc();
    }
}

export { 
    init, 
    showTooltip, 
    hideTooltip, 
    // getJournalTitles, 
    // getCollectionCodes, 
    // journalTitleAc,
    // collectionCodeAc,
    initializeMap
}