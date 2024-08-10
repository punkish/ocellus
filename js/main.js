// import { $, $$ } from './base.js';
import { updatePlaceHolder, qs2form, form2qs, updateUrl } from './utils.js';
// import { globals } from './globals.js';
import { addListeners } from './listeners.js';
import { getResource } from './querier.js';
// import { qs2form } from './utils2.js';

/**
 * case 1: blank canvas shows the default Ocellus page
 */
const loadBlankWebSite = async () => {
    log.info('loadBlankWebSite()');
    addListeners();
    updatePlaceHolder('images');
}

/**
 * case 3: load page from bookmark fill the form, get query results and 
 * render the page
 */
const loadBookmarkedWebSite = (qs) => {
    log.info('loadBookmarkedWebSite(qs)');
    log.info(`- qs: ${qs}`);
    addListeners();
    qs2form(qs);

    // get the qs from the form so hidden fields such as page and size 
    // are also included properly in the qs
    qs = form2qs();
    getResource(qs);
}

export { 
    loadBlankWebSite, 
    loadBookmarkedWebSite, 
    updateUrl,
    qs2form
}