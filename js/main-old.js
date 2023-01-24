import { $, $$ } from './utils.js';
import { globals } from './globals.js';
import * as listeners from './listeners.js';
import { fancySearch } from '../libs/fancySearch/fancySearch.js';

//let figureSize = globals.figureSize;

/**
 * case 1: blank canvas show the default Ocellus page
 */
const loadBlankWebSite = () => {
    log.info('loadBlankWebSite()');
    listeners.addListeners();
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
    listeners.addListeners();
    qs2form(qs);
    getResource(qs);
}

/**
 * convert form inputs to queryString. All possible inputs
 * are as follows along with their defaults:
 * 
 * page: 1
 * size: 30
 * resource: images
 * q: <no default>
 * <many others> (see globals.validZenodeo)
 * refreshCache: <no default>
 * go: go
 */
const form2qs = () => {
    log.info('- form2qs()');

    const sp = new URLSearchParams();

    $$('form input')
        .filter(i => globals.validQsKeys.includes(i.name))
        .forEach(i => {
            const fld = i.name;
            const value = i.value;

            if (fld === 'q') {
                const spTmp = new URLSearchParams(value);

                spTmp.forEach((v, k) => {
                    if (v === '') {
                        sp.append('q', k);
                    }
                    else {
                        sp.append(k, v);
                    }
                });
            }
            else if (fld === 'refreshCache') {
                if (i.checked) {
                    sp.append('refreshCache', true);
                }
            }
            else {
                sp.append(fld, val);
            }
        });

    return sp.toString();
}

/**
 * convert queryString to form inputs
 */
const qs2form = (qs) => {
    log.info(`- qs2form(qs)
    - qs: ${qs}`);

    const sp = new URLSearchParams(qs);

    // we don't want 'refreshCache' in bookmarked queries
    sp.delete('refreshCache');

    let q = [];

    sp.forEach((val, key) => {
        if (globals.notq.includes(key)) {
            if (key === 'source') {
                const sources = $$('input[name=source]');
                sources.forEach(s => {
                    if (s.value === val) {
                        s.checked = true;
                    }
                })
            }
        }
        else {
            let qt = key;

            if (val) {
                qt = key === 'q' ? val : `${key}=${val}`;
            }

            q.push(qt);
        }
    });

    $('#q').value = q.join('&');
}

const updatePlaceHolder = async (resource) => {
    const count = resource === 'images'
        ? await getCountOfImages()
        : await getCountOfTreatments();
    
    const target = $('#fancySearch').classList.contains('hidden')
        ? 'ns-help'
        : 'fs-help';

    $(`#${target}`).innerText = `search ${count} ${resource}`;
}

const getCountOfImages = async () => {

    if (!globals.cache.imageCount) {
        const url = `${globals.server}/treatmentimages?cols=`;
        const response = await fetch(url);
    
        // if HTTP-status is 200-299
        if (response.ok) {
            const json = await response.json();
            const countOfImages = json.item.result.count;
            globals.cache.imageCount = countOfImages;
        }
    
        // throw an error
        else {
            alert("HTTP-Error: " + response.status);
        }
    }

    return globals.cache.imageCount;
}

const getCountOfTreatments = async () => {

    if (!globals.cache.treatmentCount) {
        const url = `${globals.server}/treatments?cols=`;
        const response = await fetch(url);
    
        // if HTTP-status is 200-299
        if (response.ok) {
            const json = await response.json();
            const countOfTreatments = json.item.result.count;
            globals.cache.treatmentCount = countOfTreatments;
        }
    
        // throw an error
        else {
            alert("HTTP-Error: " + response.status);
        }
    }

    return globals.cache.treatmentCount;
}

const updateUrl = (qs) => {
    log.info(`- updateUrl(qs)
    - qs: ${qs}`);

    history.pushState('', null, `?${qs}`);
}

const getImagesFromZenodeo = () => {

}

const getImagesFromZenodo = () => {

}

const getTreatmentsFromZenodeo = () => {

}

const getResource = async (qs) => {
    log.info(`- getResource(qs)
    - qs: ${qs}`);

    // turn on the barber pole
    $('#throbber').classList.remove('nothrob');

    const sp = new URLSearchParams(qs);

    // save page and size to use later to update the results
    const page = sp.get('page');
    const size = sp.get('size');
    sp.delete('page');
    sp.delete('size');

    // what are we getting, images or treatments? adjust the 
    // resource accordingly
    const resource = sp.get('resource') === 'images'
        ? 'treatmentimages'
        : 'treatments';

    const grid = sp.get('grid') || 'normal';
    const figureSize = globals.figureSize[grid];

    //const keys = [];
    let dontHaveToGetImagesFromZenodo = true;

    sp.forEach((val, key) => {

        // remove invalid Zenodeo keys
        if (!globals.validZenodeo.includes(key)) {
            sp.delete(key);
        }
        else {

            // a qs can look like so
            //
            // `phylogeny&keyword=Plantae`
            //
            // in the above, 'phylogeny' is a key with 
            // no val, so we will use that as 'q'
            //
            if (!val) { 
                sp.set('q', key); 
                sp.delete(key);
            }

            // We dontHaveToGetImagesFromZenodo if 
            // any key besides 'q' is used
            else if (key !== 'q') {
                dontHaveToGetImagesFromZenodo = false;
            }
        }
    });

    const queries = [];

    // images from Zenodo and Zenodeo
    queries.push([
        {
            resource: 'images',
            queryString: ''
        },
        {
            resource: 'treatmentimages',
            queryString: ''
        }
    ]);

    // images from Zenodeo
    queries.push([
        {
            resource: 'treatmentimages',
            queryString: ''
        }
    ]);

    // treatments from Zenodeo
    queries.push([
        {
            resource: 'treatments',
            queryString: ''
        }
    ]);

    // let's define the cols to retrieve
    const cols = [ 'treatmentId', 'treatmentTitle', 'zenodoDep' ];

    
    if (dontHaveToGetImagesFromZenodo) {

        // adjust the defauls in case source is different
        if (resource === 'treatments') {
            cols.push(...[ 
                'treatmentDOI', 'articleTitle', 'articleAuthor' 
            ]);
        }
        else if (resource === 'treatmentimages') {
            cols.push(...[ 'httpUri', 'captionText' ]);
        }
    }
    

    const queryString = dontHaveToGetImagesFromZenodo
        ? sp.toString()
        : `${sp.toString()}&${cols.map(c => `cols=${c}`).join('&')}`;

    const url = `${globals.server}/${resource}?${queryString}`;
    const response = await fetch(url);

    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json();
        const records = json.item.result.records;
        const figures = [];

        if (records) {

            records.forEach(r => {

                const rec = {
                    resource,
                    figureSize,
                    treatmentId: r.treatmentId,
                    title: r.treatmentTitle,
                    zenodoRec: r.zenodoDep
                }
                
                if (resource === 'treatmentimages') {

                    // 
                    // Most figures are on Zenodo, but some are on Pensoft,
                    // so the url has to be adjusted accordingly
                    // 
                    const id = r.httpUri.split('/')[4];
                    rec.uri = r.httpUri.indexOf('zenodo') > -1 
                        ? `${globals.zenodoUri}/${id}/thumb${figureSize}` 
                        : r.httpUri;

                    rec.caption = r.captionText
                }
                else if (resource === 'treatments') {
                    rec.treatmentDOI = r.treatmentDOI;
                    rec.articleTitle = r.articleTitle;
                    rec.articleAuthor = r.articleAuthor;
                }

                const figure = makeFigure(rec);
                figures.push(figure);
            });
        }

        renderPage({
            figureSize,
            figures,
            qs, 
            count: json.item.result.count, 
            prev: page > 1 ? page - 1 : 1, 
            next: parseInt(page) + 1,
            size,
            cacheHit: json.cacheHit || false
        });
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status);
    }
}

const getImages_old = async function(qs) {
    log.info(`- getImages(qs)
    - qs: ${qs}`);

    $('#throbber').classList.remove('nothrob');

    const sp = new URLSearchParams(qs);
    const source = sp.get('source');

    // we don't need the following keys in the search
    const notsp = [ 'source', 'grid' ];
    notsp.forEach(n => sp.delete(n));

    /**
     * a qs can look like so
     *
     * `phylogeny&keyword=plantae`
     *
     * in the above, 'phylogeny' is a key with 
     * no val, so we will use that as 'q'
     */
    sp.forEach((v, k) => {
        if (!v) { 
            sp.set('q', k); 
            sp.delete(k) 
        }
    });

    /**
     * make copies of the searchparams, one for images
     * and another for treatments
     */
    const sp_i = new URLSearchParams(sp.toString());
    const sp_t = new URLSearchParams(sp.toString());

    sp_i.forEach((v, k) => {
        if (!globals.validZenodo.includes(k)) {
            sp_i.delete(k);
        }
    })

    sp_t.forEach((v, k) => {
        if (!globals.validZenodeo.includes(k)) {
            sp_t.delete(k);
        }
    })

    const imageQueryString = sp_i.toString();
    const treatmentQueryString = sp_t.toString();

    const queries = [];

    const imageQuery = {
        resource: 'images',
        queryString: imageQueryString
    };

    const treatmentQuery = {
        //resource: 'treatments',
        //queryString: `${treatmentQueryString}&httpUri=ne()&cols=treatmentTitle&cols=zenodoDep&cols=httpUri&cols=captionText`
        resource: 'treatmentimages',
        queryString: `${treatmentQueryString}&cols=httpUri&cols=treatmentTitle&cols=zenodoDep&cols=treatmentId&cols=captionText`
    }

    // if (source === 'all') {
    //     queries.push(
    //         getResource(imageQuery), 
    //         getResource(treatmentQuery)
    //     );
    // }
    // else if (source === 'Zenodo') {
    //     queries.push(getResource(imageQuery));
    // }
    // else if (source === 'treatments') {
    //     queries.push(getResource(treatmentQuery));
    // }

    if (source === 'images') {
        queries.push(getResource(imageQuery));
    }
    else if (source === 'treatments') {
        queries.push(getResource(treatmentQuery));
    }

    const page = sp.get('page');
    const size = sp.get('size');

    Promise.all(queries)
        .then(results => {
            const res = {
                prev: page > 1 ? page - 1 : 1,
                next: parseInt(page) + 1,
                size: size,
                count: 0,
                recs: []
            };

            results.forEach(r => {
                if (typeof(r) != 'undefined') {
                    res.recs.push(...r.recs);
                    res.count += r.count;

                    res.cacheHit = r.cacheHit;
                }
            })

            return res;
        })
        .then(results => {
            const figures = [];

            results.recs.forEach(r => {
                const figure = makeFigure({
                    figureSize, 
                    treatmentId: r.treatmentId, 
                    title: r.title,
                    zenodoRec: r.zenodoRec, 
                    uri: r.uri,
                    caption: r.caption
                });

                figures.push(figure);
            });

            renderPage({
                figureSize,
                figures,
                qs, 
                count: results.count, 
                prev: results.prev, 
                next: results.next,
                cacheHit: results.cacheHit
            });
        })
}

const getResource_old = async ({ resource, queryString }) => {
    log.info(`- getResource()
    - resource: ${resource}
    - queryString: ${queryString}`);

    const url = `${globals.server}/${resource}?${queryString}`;
    const response = await fetch(url);

    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json();
        const records = json.item.result.records;

        const images = {
            count: 0,
            recs: [],
            prev: '',
            next: '',
            cacheHit: json.cacheHit || false
        };

        if (records) {
            images.count = images.count + json.item.result.count;

            records.forEach(r => {
                if (resource === 'images') {
                    let thumb = '/img/kein-preview.png';
                    if ('thumbs' in r.links) {
                        thumb = r.links.thumbs[figureSize];
                    }

                    images.recs.push({
                        treatmentId: '',
                        title: r.metadata.title,
                        zenodoRec: r.id,
                        uri: thumb,
                        caption: r.metadata.description
                    })
                }
                else if (resource === 'treatmentimages') {

                    /**
                     * Most figures are on Zenodo, but some are on Pensoft,
                     * so the url has to be adjusted accordingly
                     */
                    const id = r.httpUri.split('/')[4];
                    const uri = r.httpUri.indexOf('zenodo') > -1 ? 
                        `${globals.zenodoUri}/${id}/thumb${figureSize}` : 
                        r.httpUri;

                    images.recs.push({
                        treatmentId: r.treatmentId,
                        title: r.treatmentTitle,
                        zenodoRec: r.zenodoDep,
                        uri,
                        caption: r.captionText
                    })
                }
            })

            return images;
        }
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status);
    }
}

const makeFigure = (obj) => {
    const { resource, figureSize, treatmentId, title, zenodoRec } = obj;
    
    const zenodoLink = zenodoRec
        ? `<a href="${globals.zenodoUri}/${zenodoRec}" target="_blank">more on Zenodo</a><br></br>`
        : '';

    let treatmentReveal = '';
    let treatmentLink = '';

    if (treatmentId) {
        treatmentReveal = `<div class="treatmentId reveal" data-reveal="${treatmentId}">T</div>`;
        treatmentLink = `<a href="${globals.tbUri}/${treatmentId}" target="_blank">more on TreatmentBank</a>`;
    }

    let content = '';
    let caption = '';

    if (resource === 'treatmentimages') {
        const uri = obj.uri || '';
        caption = obj.caption || '';

        const onerror = `this.onerror=null; setTimeout(() => { this.src='${uri}' }, 1000);`;
        const img = `<img src="img/bug.gif" width="${figureSize}" data-src="${uri}" class="lazyload" data-recid="${treatmentId}" onerror="${onerror}">`
        
        if (treatmentLink) {
            content = `<a href="${globals.tbUri}/${treatmentId}" target="_blank">${img}</a>`;
        }
        else if (zenodoLink) {
            content = `<a href="${globals.zenodoUri}/${zenodoRec}" target="_blank">${img}</a>`;
        }
    }
    else {
        const treatmentDOI = obj.treatmentDOI || '';
        const articleTitle = obj.articleTitle || '';
        const articleAuthor = obj.articleAuthor || '';
        content = `<p class="articleTitle">${articleTitle}</p>
<p class="treatmentDOI">${treatmentDOI}</p>
<p class="articleAuthor">${articleAuthor}</p>`;
    }

    const figcaptionClass = figureSize === 250 
        ? 'visible' 
        : 'noblock';
    
    return `<figure class="figure-${figureSize} ${treatmentId ? 'tb' : ''}">
    <div class="switches">
        ${treatmentReveal}
        <div class="close"></div>
    </div>
    ${content}
    <figcaption class="${figcaptionClass}">
        <a class="transition-050">Zenodo ID: ${zenodoRec}</a>
        <div class="closed">
            <b class="figTitle">${title}</b><br>
            ${caption}<br>
            
            ${zenodoLink}
            ${treatmentLink}
        </div>
    </figcaption>
</figure>`;
}

const renderPage = ({ figureSize, figures, qs, count, prev, next, cacheHit }) => {
    log.info(`- renderPage()
    - figureSize: ${figureSize}px
    - figures: ${figures.length} figures
    - qs: ${qs}
    - count: ${count}
    - prev: ${prev}
    - next: ${next}`);

    $('#grid-images').classList.add(`columns-${figureSize}`);

    renderFigures(figures, qs, prev, next);
    renderSearchCriteria(qs, count, cacheHit);
    $('#throbber').classList.add('nothrob');
}

const renderFigures = (figures, qs, prev, next) => {
    log.info('- renderFigures()');

    if (figures.length) {
        $('#grid-images').innerHTML = figures.join('');
        renderPager(qs, prev, next);
        listeners.addListenersToFigcaptions();
        listeners.addListenersToFigureTypes();
    }
    // else {
    //     $('#grid-images').innerHTML = '<p class="nada">sorry, no images found</p>';
    // }
}

const renderTreatments = () => {

}

const renderPager = (qs, prev, next) => {
    log.info('- renderPager()');
    log.info(`  - qs: ${qs}`);
    log.info(`  - prev: ${prev}`);
    log.info(`  - next: ${next}`);

    const sp = new URLSearchParams(qs);
    sp.delete('page');

    $('#pager').innerHTML = `<a href="?${sp.toString()}&page=${prev}">prev</a> <a href="?${sp.toString()}&page=${next}">next</a>`;
    $('#pager').classList.add('filled');
    listeners.addListenersToPagerLinks();
}

const renderSearchCriteria = (qs, count, cacheHit) => {
    log.info('- renderSearchCriteria(qs, count)');
    log.info(`  - qs: ${qs}`);
    log.info(`  - count: ${count}`);

    const searchParams = new URLSearchParams(qs);
    const page = searchParams.get('page');
    const size = searchParams.get('size');
    const from = ((page - 1) * size) + 1;
    let to = parseInt(from) + parseInt(size - 1);
    if (to > count) {
        to = count;
    }

    if (!count) {
        count = 'sorry, no';
    }

    const criteria = [];
    globals.notInSearchCriteria.forEach(p => searchParams.delete(p));
    
    searchParams.forEach((v, k) => {
        let c;

        if (k === 'q') {
            c = `<span class="crit-key">${v}</span> is in the text`;
        }
        else if (k === 'keywords') {
            c = `<span class="crit-key">keyword</span> is <span class="crit-val">${v}</span>`;
        }
        else {
            c = `<span class="crit-key">${k}</span> is <span class="crit-val">${v}</span>`;
        }

        criteria.push(c);
    })

    let str;
    const len = criteria.length;

    if (len === 1) {
        str = criteria[0];
    }
    else if (len === 2) {
        str = `${criteria[0]} and ${criteria[1]}`;
    }
    else {
        str = `${criteria.slice(0, len - 2).join(', ')}, and ${criteria[len - 1]}`;
    }

    /*
    **1107** records found where **hake** is in the text… **19** unique images from the first **30** records are shown below.
    **1107** records found where **hake** is in the text… **27** unique images from records **31–60**  are shown below.
    */
    //… <span class="crit-count">${globals.results.figures.length}</span> unique images from records ${from}–${to} are shown below
    //const aboutCount = count - (count % 5);
    str = `<span class="crit-count">${count}</span> images found where ${str}`;
    str += cacheHit ? '<span aria-label="cache hit" data-pop="top" data-pop-no-shadow data-pop-arrow>💥</span>' : '';
    
    $('#search-criteria').innerHTML = str;
}

const initializeFancySearch = (searchType) => {

    const doSomethingWithQuery = function(query) {
        query.source = 'treatments';

        const sp = new URLSearchParams(query);

        const validFormFields = [
            'page',
            'size',
            'refreshCache'
        ];

        validFormFields.forEach(f => {
            const fld = $(`input[name=${f}`);
            const val = fld.value;

            if (f === 'refreshCache' && fld.checked) {
                sp.append('refreshCache', true);
            }
            else {
                sp.append(f, val);
            }
            
        });

        const qs = sp.toString();
        updateUrl(qs);
        getImages(qs);
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

    /**
     * 'values' can be
     *      - an empty string
     *      - an array of options
     *      - a function that returns an array of options
     *      - an object with
     *          - a URL that returns an array of options OR
     *          - a URL + a callback that converts the results of the URL 
     *            into an array of options
     */
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
                url: `${globals.server}/authors?q=`, 
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

    if (searchType) {
        listeners.toggleSearch();
    }
}

export { 
    loadBlankWebSite, 
    submitForm, 
    loadBookmarkedWebSite, 
    initializeFancySearch, 
    updatePlaceHolder 
}