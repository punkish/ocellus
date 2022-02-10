import { $, $$ } from './o-utils.js';
import { globals } from './o-globals.js';
import { addListeners, setView } from './o-listeners.js';
import * as common from './o-common.js';
import * as treatments from './o-treatments.js';
import * as map from './o-map.js';
import * as images from './o-images.js';

/**
 * @function init
 * @description This is where it all starts.
 */
const init = () => {

    // check browser bar
    const url = new URL(location);
    const searchParams = url.searchParams;

    // update 'globals.view' if applicable
    // (default 'globals.view' is 'images')
    if (searchParams.has('view')) {
        globals.view = searchParams.get('view');
    }

    loadPage(url, searchParams);
}

/**
 * @function loadPage
 * @param {Object} url - instance of URL class
 * @param {Object} sp - instance of URLSearchParams class
 * @summary loads the page with chrome and, optionally, results.
 */
const loadPage = (url, searchParams) => {

    // remove any param that is not a part of the query
    globals.not_q.forEach(p => searchParams.delete(p));
    common.preparePage(searchParams);

    let layout;

    // browser bar has params
    if (url.search) {

        // create query and get result
        const result = getResource(qs);
        layout = prepareLayout(result);
        
    }

    //common.preparePage(layout);
    addListeners(layout);

    if (globals.view === 'map') {
        map.makeMap();
    }
}

const getResource = (sp) => {

    // clean up a bit… remove 'refreshCache' in case
    // someone has appended that to a bookmark. We 
    // certainly don't want to 'refreshCache' from 
    // bookmarks
    for (let key of sp.keys()) {
        if (!globals.validQueryParams.includes(key)) {
            sp.delete(key);
        }
    }

    const qs = sp.toString();
    let result;

    if (globals.view === 'images') {
        result = images.getResource(qs);
    }
    else if (globals.view === 'treatments') {
        result = treatments.getResource(qs);
    }
    else if (globals.view === 'map') {
        result = map.getResource(qs);
    }

    return result;
}

const prepareLayout = (result) => {
    if (globals.view === 'images') {
        return images.layout(result);
    }
    else if (globals.view === 'treatments') {
        return treatments.layout(result);
    }
    else if (globals.view === 'map') {
        return map.layout(result);
    }
}



/*
--- from loaded page -----------------------
case 2: click on [go] button
    get results for query
    make layout
    reveal results
    update browser bar
    add listeners

case 3: click on an in-page link (event)
    get results for query
    make layout
    reveal results
    update browser bar
    add listeners
*/

export { init }