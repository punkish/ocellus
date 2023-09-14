import { $, $$ } from './base.js';
import { updatePlaceHolder, form2qs, updateUrl } from './utils.js';
import { globals } from './globals.js';
import { addListeners } from './listeners.js';
import { getResource } from './querier.js';

/**
 * case 1: blank canvas shows the default Ocellus page
 */
const loadBlankWebSite = () => {
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

/**
 * convert queryString to form inputs. Right now qs2form() fills 
 * only the normal search form. TODO: be able to fill fancy search
 * form as well.
 */
const qs2form = (qs) => {
    log.info(`- qs2form(qs)
    - qs: ${qs}`);

    const sp = new URLSearchParams(qs);

    // we don't want 'refreshCache' in bookmarked queries
    sp.delete('refreshCache');

    // temp array to store values for input field 'q'
    const q = [];

    sp.forEach((val, key) => {

        // ignore all keys that are not valid for Zenodeo
        if (globals.params.validZenodeo.includes(key)) {

            // for keys that won't go into 'q'
            if (globals.params.notValidQ.includes(key)) {

                if (key === 'resource') {
                    Array.from($$('input[name=resource]'))
                        .filter(i => i.value === val)[0].checked = "true";
                }
                else {
                    $(`input[name=${key}]`).value = val;
                }

            }

            // all the keys that will go into 'q'
            else {

                // default value
                let value = key;
    
                if (val) {
                    value = key === 'q' 
                        ? val 
                        : `${key}=${val}`;
                }
    
                q.push(value);
            }

        }
        
    });

    $('#q').value = q.join('&');
}

export { 
    loadBlankWebSite, 
    loadBookmarkedWebSite, 
    updateUrl
}