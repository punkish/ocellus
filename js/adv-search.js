import { $, $$ } from './base.js';
import { globals } from './globals.js';

async function getDataFromZenodeo({url, segment, display, value}) {
    console.log(`getting ${segment}`)
    const response = await fetch(url);

    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json();

        if ('item' in json) {
            const records = json.item.result.records;

            if (records) {
                globals.cache[segment] = records.map(r => {
                    return {
                        display: r[display],
                        value: r[value]
                    }
                });
            }
        }
        else {
            globals.cache[segment] = json;
        }

        return globals.cache[segment];
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status);
    }
}

async function getCollectionCodes() {
    const url = `${globals.uri.zenodeo}/collectioncodes?cols=collectionCode&cols=name&size=4300`;
    return await getDataFromZenodeo({
        url,
        segment: 'collectionCodes',
        display: 'collectionCode',
        value: 'collectionCode'
    })
}

async function getJournalTitles() {
    const url = `${globals.uri.zenodeo}/journals?size=1100&sortby=journalTitle:asc`;
    return await getDataFromZenodeo({
        url,
        segment: 'journals',
        display: 'journalTitle',
        value: 'journalTitle'
    })
}

function makeAutoComplete({ selector, minChars, cb, display, value }) {
    return new autoComplete({

        // 'selector': The input field to which the autoComplete will be 
        //      attached
        selector,

        // 'minChars': The number of characters typed to trigger the 
        //      autoComplete
        minChars,

        // delay: 150,

        // 'term' is what is typed by the user
        // 'suggest' is a callback that takes an array of results matching 
        //      the 'term' and constructs a widget of suggestions, This array 
        //      of filtered suggestions is based on the provided term:
        //      ['suggestion 1', 'suggestion 2', 'suggestion 3', ...]
        // 'cb' feeds the choices
        source: async function(term, suggest) {
            term = term.toLowerCase();
            const choices = await cb();

            // 'matches' is an array of object { display, value }
            //      'display' is visible to the user
            //      'value' is sent back in the form
            //      'display' and 'value' can be the same
            const matches = [];

            for (let i=0; i < choices.length; i++) {
                
                if (~choices[i].display.toLowerCase().indexOf(term)) {
                    matches.push({
                        display: choices[i].display,
                        value: choices[i].value
                    });
                }

            }
            
            suggest(matches);
        },
        renderItem: function (item, search){
            
            // escape special characters
            search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
            const disp = item.display.replace(re, "<b>$1</b>");
            return `<div class="autocomplete-suggestion" data-id="${item.value}">${disp}</div>`;
        },
        onSelect: function(e, term, item){
            document.querySelector(selector).value = item.getAttribute('data-id');
        }
        
    });
}

function initAdvSearch() {
    makeAutoComplete({
        selector: 'input[name="as-journalTitle"]',
        minChars: 2, 
        cb: getJournalTitles, 
        display: 'journalTitle', 
        value: 'journalTitle'
    });

    makeAutoComplete({
        selector: 'input[name="as-collectionCode"]',
        minChars: 2, 
        cb: getCollectionCodes, 
        display: 'collectionCode', 
        value: 'collectionCode'
    });
}

export { initAdvSearch }