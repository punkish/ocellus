import { $, $$ } from './i-utils.js';
import { globals } from './i-globals.js';
import { pager } from './i-pager.js';

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
                if (resource === 'treatments') {
                    globals.views.treatments.countOfTreatments = json.item.result.count;
                    //globals.views._links = json.item._links;
                    getFigureCitations(records);
                }
                else if (resource === 'figurecitations') {
                    return records;
                }
            }
        }        
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status)
    }
}

/*
 * If the response from querying treatments is successful,
 * `getFigureCitat ions` fetches the figures
 */
const getFigureCitations = function(treatments) {

    // Create a promise for quering figures for the treatments returned from `getResource()`
    Promise.all(treatments.map(t => getResource({
        resource: 'figurecitations', 
        queryString: `treatmentId=${t.treatmentId}`
    })))
        .then(all => {
            const result = [];
            all.filter(r => r && r.length).forEach(r => result.push(...r));
            return result;
        })
        .then(result => {
            const uniq = {};
            result.forEach(r => {
                const figure = makeGrid(250, r.httpUri, r.captionText, r.treatmentId);
                uniq[r.httpUri] = figure;
            });

            globals.views.treatments.figures = Object.values(uniq);
            globals.views.treatments.countOfFigures = globals.views.treatments.figures.length;
            
            const {sp, page, size, fpage, fsize} = extractParamsFromUrl(new URL(location));
            showPage({sp, page, size, fpage, fsize});
        })
}

const extractParamsFromUrl = (url) => {
    const sp = url.searchParams;

    // if the query has page and size, save them
    const page = sp.has('page') ? sp.get('page') : globals.page;
    const size = sp.has('size') ? sp.get('size') : globals.size;

    // if the query doesn't have hash params, set them to default values
    const hash = url.hash
        .slice(1)
        .split('&')
        .reduce((map, obj) => { 
            const a = obj.split('='); 
            map[a[0]] = a[1]; 
            return map; 
        }, {});

    
    const fpage = parseInt(hash.fpage || globals.fpage);
    const fsize = parseInt(hash.fsize || globals.fsize);

    return {sp, page, size, fpage, fsize}
}

const makeGrid = (size, httpUri, captionText, treatmentId) => {

    /*
    * Most figures are on Zenodo, but some are on Pensoft,
    * so the url has to be adjusted accordingly
    */
    const id = httpUri.split('/')[4];
    const i = httpUri.indexOf('zenodo') > -1 ? `${globals.zenodoUri}/${id}/thumb${size}` : httpUri;

    return `<figure class="figure-${size}">
    <div class="switches">
        <div class="close"></div>
    </div>
    <picture>
        <img src="../img/bug.gif" width="${size}" data-src="${i}" class="lazyload" data-recid="${id}">
    </picture>
    <figcaption>
        <a class="transition-050">rec ID: ${id}</a>
        <div class="desc hidden noblock">
            ${captionText}. 
            <a class='showTreatment' href='${O.zenodeo3Uri}/treatments?treatmentId=${treatmentId}'>more</a>
        </div>
    </figcaption>
</figure>`
}

const showPage = function({sp, page, size, fpage, fsize}) {
    
    // if (page !== globals.views.currentPage) {
    //     getResource('treatments', )
    // }
    // else {

    //console.log('showing pages')
    // const url = new URL(location);
    // const sp = url.searchParams;

    // // if the query has page and size, save them
    // const page = sp.has('page') ? sp.get('page') : globals.page;
    // const size = sp.has('size') ? sp.get('size') : globals.size;

    // // queryObj.delete('page');
    // // queryObj.delete('size');

    // // const queryString = decodeURIComponent(queryObj.toString());

    // // if the query doesn't have hash params, set them to default values
    // const hash = url.hash
    //     .slice(1)
    //     .split('&')
    //     .reduce((map, obj) => { 
    //         const a = obj.split('='); 
    //         map[a[0]] = a[1]; 
    //         return map; 
    //     }, {});

    
    // const fpage = parseInt(hash.fpage || globals.fpage);
    // const fsize = parseInt(hash.fsize || globals.fsize);

    // slice the figures out of the RESULTS array
    // if page = 1 and size = 30, the slice will be from 0, 29
    // page/fp = 1 -> slice(0, 29)
    // page/fp = 2 -> slice(30, 59)
    // page/fp = 3 -> slice(60, 61)

        const from = parseInt((fpage - 1) * fsize);
        let to = parseInt(from + fsize);
        if (to >= globals.views.treatments.countOfFigures) to = globals.views.treatments.countOfFigures;
        
        const figures = globals.views.treatments.figures.slice(from, to);
        console.log(figures);
        $('#grid-treatments').innerHTML = figures.join('');

        updateUrl(sp, page, size, fpage, fsize);

        outputResult({
            total: globals.views.treatments.countOfTreatments,
            subtotal: globals.views.treatments.countOfFigures,
            page,
            size,
            fpage,
            fsize,
            htmlElement: $('#search-results'),
            resource: 'treatments',
            subresource: 'figures'
        });

        const queryString = decodeURIComponent(sp.toString());
        //showPager(queryString, page, size, fpage, fsize);

        $$('div.close').forEach(c => c.addEventListener('click', smoke));
        $$('figcaption > a').forEach(f => f.addEventListener('click', toggleFigcaption));
        $$('.showTreatment').forEach(t => t.addEventListener('click', showTreatment));
        $('#throbber').classList.add('nothrob');
        globals.hiddenClasses
            .forEach(c => $('#treatments').classList.remove(c));
    //}
}

const showPager = (queryString, page, size, fpage, fsize) => {
    const makeRow = (cells) => {
        const row = cells.map(cell => `<td class="pager-cell">${cell}</td>`).join('');
        return `<tr class="pager-row">${row}</tr>`;
    }

    const makeTable = (rows) => `<table class="pager">${rows.join('')}</table>`;

    const row = pager({
        total: globals.views.treatments.countOfTreatments, 
        subtotal: globals.views.treatments.countOfFigures,
        queryString,
        page,
        size,
        fpage,
        fsize,
        resource: 'treatments',
        subresource: 'figures',
    });

    const rows = [makeRow(row)];

    if (globals.views.treatments.countOfFigures > 0) {
        const row = pager({
            total: globals.views.treatments.countOfFigures, 
            subtotal: '',
            queryString,
            page,
            size,
            fpage,
            fsize,
            resource: 'figures',
            subresource: ''
        });

        rows.push(makeRow(row));
    }
    
    const table = makeTable(rows)
    $('#treatments-pager').innerHTML = table;
    $$('.pager-cell a').forEach(p => p.addEventListener('click', figPageClick));
}

const figPageClick = function(e) {
    const url = new URL(e.currentTarget.href);

    const {sp, page, size, fpage, fsize} = extractParamsFromUrl(url);
    showPage({sp, page, size, fpage, fsize});

    e.stopPropagation()
    e.preventDefault()
}

const showTreatment = async function(e) {
    const url = e.target.href
    // const mouseX = e.pageX
    // const mouseY = e.pageY

    getTreatment(url);
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

// Javascript: Ordinal suffix for numbers
// https://stackoverflow.com/a/15810761
const nth = function(n) {
    if ( isNaN(n) || n % 1 ) return n;

    const s = n % 100;

    if ( s > 3 && s < 21 ) return n + 'th';

    switch( s % 10 ) {
        case 1:  return n + 'st';
        case 2:  return n + 'nd';
        case 3:  return n + 'rd';
        default: return n + 'th';
    }
}

const niceNumbers = (n) => {
    const nice = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    return n < 10 ? nice[n - 1].toLowerCase() : n
}

const getTreatment = async function(url) {
    const response = await fetch(url);
    
    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json();
        const r = json.item.result.records[0];

        const figs = json.item.result["related-records"].figureCitations.map(r => {

            /*
            * Most figures are on Zenodo, but some are on Pensoft,
            * so the url has to be adjusted accordingly
            */
            let i;
            if (r.httpUri.indexOf('zenodo') > -1) {
                i = `${O.globals.zenodoUri}/${r.httpUri.split('/')[4]}/thumb50`;
            }
            else {
                i = r.httpUri;
            }
            
            return `<img src ="${i}">`
        })
        

        let str = `<h2>${r.treatmentTitle}</h2>`

        str += `<div class="figs">${figs.join(' ')}</div>`

        str += '<div class="cite">'
        if (r.authorityName) str += `${r.authorityName}. `
        if (r.authorityYear) str += `${r.authorityYear}. `
        if (r.articleTitle) str += `${r.articleTitle}. `
        if (r.journalTitle) str += `${r.journalTitle}`
        if (r.journalYear) str += `${r.journalYear}, `
        if (r.journalVolume) str += `vol. ${r.journalVolume}, `
        if (r.journalIssue) str += `${r.journalIssue}, `
        if (r.pages) str += `pp. ${r.pages}`
        str += '</div>'

        if (r.status) str += `<div class="status"><b>status:</b> ${r.status}</div>`

        str += '<ul class="classification">'
        if (r.kingdom) str += `<li class="${r.rank === 'kingdom' ? 'rank' : ''}">${r.kingdom}</li>`
        if (r.phylum)  str += `<li class="${r.rank === 'phylum'  ? 'rank' : ''}">${r.phylum}</li>`
        if (r.order)   str += `<li class="${r.rank === 'order'   ? 'rank' : ''}">${r.order}</li>`
        if (r.family)  str += `<li class="${r.rank === 'family'  ? 'rank' : ''}">${r.family}</li>`
        if (r.genus)   str += `<li class="${r.rank === 'genus'   ? 'rank' : ''}">${r.genus}</li>`
        if (r.species) str += `<li class="${r.rank === 'species' ? 'rank' : ''}">${r.species}</li>`
        str += '</ul>'

        $('#treatmentDetails').querySelector('div.text').innerHTML = str
        $('#treatmentDetails').classList.remove("hidden")
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status)
    }
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

const smoke = function (e) {

    // http://jsfiddle.net/Y7Ek4/22/
    let intervalId = 0

    const animatePoof = function() {
        let bgTop = 0
        let frame = 0
        const frames = 6
        const frameSize = 32
        const frameRate = 80
    
        function animate() {
            if (frame < frames) {
                sel_puff.style.backgroundPosition = "0 "+bgTop+"px"
                bgTop = bgTop - frameSize
                frame++
                setTimeout(animate, frameRate)
            }
        }
        
        animate()
        //setTimeout("sel_puff.style.visibility = 'hidden'", frames * frameRate)
    }

    const hide = function() {
        let opacity = Number(t.style.opacity)
        
        if (opacity > 0) { 
            opacity = opacity - 0.1
            t.style.opacity = opacity 
        }
        else { 
            clearInterval(intervalId)
            t.style.display = 'none'
        }

        // if (sel_hideUnhide.classList.contains("hide")) {
        //     show(sel_hideUnhide)
        // }
    }

    const xOffset = 24
    const yOffset = 24
    
    // show #puff
    sel_puff.style.left = e.pageX - xOffset + 'px'
    sel_puff.style.top = e.pageY - yOffset + 'px'
    sel_puff.style.display = 'inline'
    sel_puff.style.visibility = 'visible'
    sel_puff.style.opacity = 1

    // animate the puff
    animatePoof()

    // hide the figure /////////////////////
    // https://stackoverflow.com/a/29168819
    const t = e.currentTarget.parentNode.parentNode
    hidden.push(t)
    sel_hiddenFigures.innerHTML = ` (${hidden.length} hidden) <a id="hide-unhide" href="#unhide">unhide</a>`
    document.getElementById('hide-unhide').addEventListener('click', unhide)
    t.style.opacity = 1

    intervalId = setInterval(hide, 50)
}

export { getResource }