import { $, $$ } from './utils.js';
import { globals } from './globals.js';
import { addListeners } from './listeners.js';
import { getCountOfResource, getResource } from './querier.js';

/**
 * case 1: blank canvas shows the default Ocellus page
 */
const loadBlankWebSite = () => {
    log.info('loadBlankWebSite()');
    addListeners();
    updatePlaceHolder('images');
}

/**
 * case 2: click on [go] button gets query results and renders the page
 */
const submitForm = () => {
    log.info('submitForm()');
    const qs = form2qs();
    updateUrl(qs);
    getResource(qs);
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
 * convert form inputs to searchParams. All possible inputs
 * are as follows along with their defaults:
 * 
 * page: 1
 * size: 30
 * resource: images
 * q: <no default>
 * <many others> (see globals.validZenodeo)
 * refreshCache: <no default>
 * go: go
 * 
 */
const form2qs = () => {
    log.info('- form2qs()');

    const sp = new URLSearchParams();

    Array.from($$('form input.query'))
        .filter(i => i.value)
        .forEach(i => {
            
            let key = i.name;
            let val = i.value;

            if (i.name === 'q') {
                const spTmp = new URLSearchParams(i.value);

                spTmp.forEach((v, k) => {
                    if (v === '') {
                        key = 'q';
                        val = k;
                    }
                    else {
                        key = k;
                        val = v;
                    }

                    sp.append(key, val);
                });
            }
            else {
                
                if ((i.type === 'radio' || i.type === 'checkbox')) {
                    if (i.checked || i.checked === 'true') {
                        sp.append(key, val);
                    }
                }
                else {
                    sp.append(key, val);
                }

            }
        });

    const qs = sp.toString();
    return qs;
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

const updatePlaceHolder = async (resource) => {
    const count = await getCountOfResource(resource);
    $('#help-msg').innerText = `search ${count} ${resource}`;
}

const updateUrl = (qs) => {
    log.info('- updateUrl(qs)');
    //const qs = sp.toString();
    history.pushState('', null, `?${qs}`);
}

export { 
    loadBlankWebSite, 
    submitForm, 
    loadBookmarkedWebSite, 
    updatePlaceHolder,
    updateUrl
}