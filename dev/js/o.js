import {globals} from './o-globals.js';
import {preparePage} from './o-prep.js';
import {makeMap} from './o-map.js';
import {getResource} from './o-treatments.js';

const init = () => {
    const url = new URL(location);
    const sp = url.searchParams;

    // update globals as needed
    if (sp.has('view')) {
        globals.view = sp.get('view');
    }

    preparePage(sp);
    return;

/*
- map
    make base map
    make H3 or treatments

- treatments
    get treatments
    get figures

- images
    get images
*/

    // remove non-zql query params
    globals.not_q.forEach(p => {
        if (sp.has(p)) sp.delete(p);
    });

    let queryString = sp.toString();
    if (!queryString) {
        queryString = 'cols=treatmentId';
    }

    const resource = 'treatments';
    if (globals.view === 'map') {
        makeMap(resource, queryString);
    }
    else {
        getResource(resource, queryString);
    }
}

export {init}