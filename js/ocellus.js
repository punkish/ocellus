/* generated: __buildDate__ */

import { $, $$ } from './utils.js';
import { globals } from './globals.js';
import { fancySearch } from '../libs/fancySearch/fancySearch.js';
import { toggleSearch, toggleResource } from './listeners.js';
import { loadBookmarkedWebSite, loadBlankWebSite, updateUrl } from './main.js';
import { getResource } from './querier.js';

// set loglevel to 'INFO' on local development machine and to 'ERROR' on prod
const loglevel = window.location.hostname === 'localhost' 
    ? 'INFO'
    : 'ERROR';

log.level = log[loglevel];

const init = () => {
    const loc = new URL(location);
    
    // default searchType is normalSearch. Set it to fancySearch if #fs is 
    // in URL hash
    const searchType = loc.hash === '#fs'
        ? 'fs'
        : 'ns';

    initializeFancySearch(searchType);

    if (searchType === 'fs') {
        toggleResource();
    }

    if (loc.search) {
        const qs = loc.search.substring(1);
        loadBookmarkedWebSite(qs);
    }
    else {
        loadBlankWebSite();
    }
}

const initializeFancySearch = (searchType) => {
    log.info(`initializing fancySearch`);

    const doSomethingWithQuery = (query) => {
        const sp = new URLSearchParams(query);

        // add resource, page and size from the form to the query
        const resource = Array.from($$('input[name=resource]'))
            .filter(i => i.checked)[0]
            .value;

        const page = $('input[name=page').value;
        const size = $('input[name=size').value;

        sp.append('resource', resource);
        sp.append('page', page);
        sp.append('size', size);

        const qs = sp.toString();
        updateUrl(qs);
        getResource(qs);
    };

    const cbMaker = (facet) => {
        return async (response) => {
            const json = await response.json();
            const res = [];

            if (json.item.result.records) {
                json.item.result.records.forEach(r => res.push(r[facet]));
            }
            else {
                res.push('nothing found… please try again');
            }

            return res;
        }
    }

    const yearsArray = (from, to) => {
        const length = to - from;
        return Array.from({ length }, (_, index) => index + from)
            .map(e => String(e));
    }

    //
    // 'values' can be
    //      - an empty string
    //      - an array of options
    //      - a function that returns an array of options
    //      - an object with
    //          - a URL that returns an array of options OR
    //          - a URL + a callback that converts the results of the URL 
    //            into an array of options
    const facets = [
        {   
            "key": "text contains",
            "actualKey": "q", 
            "values": "", 
            "prompt": "search the full text of treatments",
            "noDuplicates": true 
        },
        {   "key": "title",
            "actualKey": "title", 
            "values": "", 
            "prompt": "search within the title",
            "noDuplicates": true 
        },
        {   "key": "authority", 
            "actualKey": "authorityName",
            "values": {
                url: `${globals.server}/treatmentAuthors?q=`, 
                cb: cbMaker('author')
            },
            "prompt": "type at least 3 letters to choose an author",
            "noDuplicates": true 
        },
        // {   "key": "keywords", 
        //     "actualKey": "keywords",
        //     "values": {
        //         url: `${server}/v3/keywords?q=`, 
        //         cb: cbMaker('keyword')
        //     },
        //     "prompt": "type at least 3 letters to choose a keyword",
        //     "noDuplicates": false 
        // },
        {   "key": "family", 
            "actualKey": "family",
            "values": {
                url: `${globals.server}/families?q=`, 
                cb: cbMaker('family')
            },
            "prompt": "type at least 3 letters to choose a family",
            "noDuplicates": false 
        },
        {   "key": "kingdom", 
            "actualKey": "kingdom",
            "values": {
                url: `${globals.server}/kingdoms?q=`, 
                cb: cbMaker('kingdom')
            },
            "prompt": "type at least 3 letters to choose a kingdom",
            "noDuplicates": false 
        },
        {   "key": "phylum", 
            "actualKey": "phylum",
            "values": {
                url: `${globals.server}/phyla?q=`, 
                cb: cbMaker('phylum')
            },
            "prompt": "type at least 3 letters to choose a phylum",
            "noDuplicates": false 
        },
        {   "key": "class", 
            "actualKey": "class",
            "values": {
                url: `${globals.server}/classes?q=`, 
                cb: cbMaker('class')
            },
            "prompt": "type at least 3 letters to choose a class",
            "noDuplicates": false 
        },
        {   "key": "genus", 
            "actualKey": "genus",
            "values": {
                url: `${globals.server}/genera?q=`, 
                cb: cbMaker('genus')
            },
            "prompt": "type at least 3 letters to choose a genus",
            "noDuplicates": false 
        },
        {   "key": "order", 
            "actualKey": "order",
            "values": {
                url: `${globals.server}/orders?q=`, 
                cb: cbMaker('order')
            },
            "prompt": "type at least 3 letters to choose an order",
            "noDuplicates": false 
        },
        {   "key": "taxon", 
            "actualKey": "taxon",
            "values": {
                url: `${globals.server}/taxa?q=`, 
                cb: cbMaker('taxon')
            },
            "prompt": "type at least 3 letters to choose a taxon",
            "noDuplicates": false 
        },
        {   "key": "journal year", 
            "actualKey": "journalYear",
            "values": yearsArray(1995, 2022), 
            "prompt": "pick a year of publication",
            "noDuplicates": true 
        },
        // {   "key": "countries", 
        //     "actualKey": "countries",
        //     "values": [ "Afghanistan","Aland Islands","Albania","Algeria" ], 
        //     "prompt": "choose a country",
        //     "noDuplicates": false 
        // }
    ];

    new fancySearch({
        selector: $('#fs-container'), 
        helpText: 'search images',
        facets,
        cb: doSomethingWithQuery
    });

    $('#fancySearch').classList.add('hidden');
    $('#fancySearch').classList.add('noblock');

    if (searchType === 'fs') {
        toggleSearch();
    }
}

export { init }