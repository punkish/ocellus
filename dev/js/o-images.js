import { $, $$ } from './o-utils.js';
import { globals } from './o-globals.js';
import { pager } from './o-pager.js';
import * as grid from './o-grid.js';

/*
* if getResource() is run for the first time (by submitting 
* the form) then `page` defaults to 1 and `size` to 30. On 
* the other hand, if getResource() runs because a bookmark 
* was loaded then that bookmark contains the `page` and 
* `size` parameters
*/
const getResource = async function({ resource, queryString }) {
    let url = `${O.zenodeo3Uri}/${resource}?${queryString}`;
    const response = await fetch(url);
    
    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json();

        if (json.item.search.cols === '') {
            return json.item.result.count;
        }
        else {
            const records = json.item.result.records;

            if (records) {
                const layout = grid.makeLayout(records);
                grid.showPage(layout);
            }
        }    
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status);
    }
}

const figPageClick = function(e) {
    const url = new URL(e.currentTarget.href);

    const {sp, page, size, fpage, fsize} = extractParamsFromUrl(url);
    showPage({sp, page, size, fpage, fsize});

    e.stopPropagation()
    e.preventDefault()
}

const outputResult = ({total, subtotal, page, size}) => {
    size = parseInt(size)
    let html;

    if (total == 0) {
        html = `No treatments found.`;
    }
    else {
        html = `Found ${niceNumbers(total)} treatments`;

        if (subtotal == 0) {
            html += `, but no related figures found. Please search again.`;
        }
        else {
            const fromTreatments = ((page - 1) * size) + 1;
            const toTreatments = fromTreatments + size - 1;

            let n;
            let str;

            if (toTreatments > total) {
                n = niceNumbers(total - fromTreatments + 1);
                str = `last ${n} treatments.`;
            }
            else {
                n = niceNumbers(size);
                str = `${nth(page)} batch of ${n} treatments.`;
            }

            html += `, showing the figures from the ${str}`;
        }
    }
    
    $('#search-results').innerHTML = html
}

const updateUrl = (sp, page, size, fpage, fsize) => {
    sp.sort();
    const pagesize = `page=${page}&size=${size}`;
    const hash = `fpage=${fpage}&fsize=${fsize}`;
    const qs = sp.toString();

    const pager = sp.has('page') ? `${qs}#${hash}` : `${qs}&${pagesize}#${hash}`;
    const url = 'o.html?' + (qs ? pager : `${pagesize}#${hash}`);
    
    history.pushState({}, '', url)
}

const toggleFigcaption = function (e) {
    const current_figcaption = e.currentTarget.parentNode.querySelector('.desc');
    if (current_figcaption.classList.contains("hidden")) {

        // close all
        $$('figcaption div.desc').forEach(f => {
            f.classList.add("hidden");
            f.classList.add("noblock");
        })

        // show current
        current_figcaption.classList.remove("hidden");
        current_figcaption.classList.remove("noblock");
    }
    else {

        // hide it
        current_figcaption.classList.add("hidden");
        current_figcaption.classList.add("noblock");
    }    
}

export { getResource }