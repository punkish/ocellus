import { $, $$ } from './i-utils.js';
import { globals } from './i-globals.js';
import * as listeners from './i-listeners.js';

let figureSize = globals.figureSize;

/*
case 1: blank canvas
show the default Ocellus page
*/
const case1 = () => {
    log.info('case1()');

    listeners.addListeners();
}

/*
case 2: click on [go] button
get query results and render the page
*/
const case2 = () => {
    log.info('case2()');

    const qs = form2qs();
    updateUrl(qs);
    getImages(qs);
}

/*
case 3: load page from bookmark
fill the form, get query results and render the page
*/
const case3 = (qs) => {
    log.info('case3(qs)');
    log.info(`- qs: ${qs}`);

    case1();
    qs2form(qs);
    getImages(qs);
}

// convert form inputs to queryString
const form2qs = () => {
    log.info('- form2qs()');

    const sp = new URLSearchParams();
    //let source = 'all';

    $$('form input').forEach(i => {
        if (i.id === 'q') {
            const sp_tmp = new URLSearchParams(i.value);
            sp_tmp.forEach((val, key) => {
                if (val === '') {
                    sp.append('q', key);
                }
                else {
                    sp.append(key, val);
                    //source = 'treatments';
                }
            })
        }
        else {
            if (i.id === 'refreshCache') {
                if (i.checked) {
                    sp.append('refreshCache', true);
                }
            }
            else if (i.name === 'source') {
                if (i.checked) {
                    sp.append('source', i.value);
                }
            }
            else {
                sp.append(i.id, i.value);
            }
        }
    })

    return sp.toString();
}

// convert queryString to form inputs
const qs2form = (qs) => {
    log.info('- qs2form(qs)');
    log.info(`  - qs: ${qs}`);

    //const inputs = {};

    const sp = new URLSearchParams(qs);

    // we don't want 'refreshCache' in bookmarked queries
    sp.delete('refreshCache');

    if (sp.has('grid')) {
        const grid = sp.get('grid');
        if (grid === 'small') {
            figureSize = 100;
        }
    }

    const notq = ['source', 'page', 'size', 'grid'];

    let q = [];
    sp.forEach((val, key) => {
        if (notq.includes(key)) {
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
            if (val) {
                if (key === 'q') {
                    q.push(val);
                }
                else {
                    q.push(`${key}=${val}`);
                }
            }
            else {
                q.push(key);
            }
        }
    });

    $('#q').value = q.join('&');
}

const updateUrl = (qs) => {
    log.info('- updateUrl(qs)');
    log.info(`  - qs: ${qs}`);

    history.pushState('', null, `?${qs}`);
}

const getImages = async function(qs) {
    log.info('- getImages(qs)');
    log.info(`  - qs: ${qs}`);

    const sp = new URLSearchParams(qs);
    const source = sp.get('source');

    // we don't need the following keys in the search
    const notsp = [ 'source', 'grid' ];
    notsp.forEach(n => sp.delete(n));

    // 
    // a qs can look like so
    //
    // phylogeny&keyword=plantae
    //
    // in the above, 'phylogeny' is a key with 
    // no val, so we will use that as 'q'
    sp.forEach((v, k) => {
        if (!v) { 
            sp.set('q', k); 
            sp.delete(k) 
        }
    });

    // make copies of the searchparams, one for images
    // and another for treatments
    const sp_i = new URLSearchParams(sp.toString());
    const sp_t = new URLSearchParams(sp.toString());
    
    const validZenodo = [
        'id',
        'subtype',
        'communities',
        'q',
        'creator',
        'title',
        'keywords'
    ];

    sp_i.forEach((v, k) => {
        if (!validZenodo.includes(k)) {
            sp_i.delete(k);
        }
    })

    const validZenodeo = [
        'treatmentId',
        'treatmentTitle',
        'treatmentVersion',
        'treatmentDOI',
        'treatmentLSID',
        'zenodoDep',
        'zoobankId',
        'articleId',
        'articleTitle',
        'articleAuthor',
        'articleDOI',
        'publicationDate',
        'journalTitle',
        'journalYear',
        'journalVolume',
        'journalIssue',
        'pages',
        'authorityName',
        'authorityYear',
        'kingdom',
        'phylum',
        'order',
        'family',
        'genus',
        'species',
        'status',
        'taxonomicNameLabel',
        'rank',
        'geolocation',
        'isOnLand',
        'validGeo',
        'collectionCode',
        'q',
        'updateTime',
        'checkinTime',
        'httpUri',
        'captionText'
    ];

    sp_t.forEach((v, k) => {
        
        if (!validZenodeo.includes(k)) {
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
        resource: 'treatments',
        queryString: `${treatmentQueryString}&httpUri=ne()&cols=treatmentTitle&cols=zenodoDep&cols=httpUri&cols=captionText`
    }

    if (source === 'all') {
        queries.push(
            getResource(imageQuery), 
            getResource(treatmentQuery)
        );
    }
    else if (source === 'Zenodo') {
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
            const uniq = {};

            const recs = results.recs;
            recs.forEach(r => {
                const figure = makeFigure({
                    figureSize, 
                    treatmentId: r.treatmentId, 
                    title: r.title,
                    zenodoRec: r.zenodoRec, 
                    uri: r.uri,
                    caption: r.caption
                });

                uniq[r.uri] = figure;
            });

            renderPage({
                figureSize,
                figures: Object.values(uniq), 
                qs, 
                count: results.count, 
                prev: results.prev, 
                next: results.next,
                cacheHit: results.cacheHit
            });
        })
}

const getResource = async ({ resource, queryString }) => {
    log.info('- getResource()');
    log.info(`  - resource: ${resource}`);
    log.info(`  - queryString: ${queryString}`);

    const url = `${O.zenodeo3Uri}/${resource}?${queryString}`;
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
                else if (resource === 'treatments') {

                    /*
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

const makeFigure = ({ figureSize, treatmentId, title, zenodoRec, uri, caption }) => {
    log.info('- makeFigure()');
    // log.info(`  - figureSize: ${figureSize}`);
    // log.info(`  - treatmentId: ${treatmentId}`);
    // log.info(`  - title: ${title}`);
    // log.info(`  - zenodoRec: ${zenodoRec}`);
    // log.info(`  - uri: ${uri}`);
    // log.info(`  - caption: ${caption}`);

    let zenodoLink = '';

    if (zenodoRec) {
        zenodoLink = `<a href="${globals.zenodoUri}/${zenodoRec}" target="_blank">more on Zenodo</a><br></br>`;
    }

    let treatmentReveal = '';
    let treatmentLink = '';

    if (treatmentId) {
        treatmentReveal = `<div class="treatmentId reveal" data-reveal="${treatmentId}">T</div>`;
        treatmentLink = `<a href="${globals.tbUri}/${treatmentId}" target="_blank">more on TreatmentBank</a>`;
    }

    const onerror = `this.onerror=null; setTimeout(() => { this.src='${uri}' }, 1000);`;
    const img = `<img src="/img/bug.gif" width="${figureSize}" data-src="${uri}" class="lazyload" data-recid="${treatmentId}" onerror="${onerror}">`
    
    let imageLink = '';
    if (treatmentLink) {
        imageLink = `<a href="${globals.tbUri}/${treatmentId}" target="_blank">${img}</a>`;
    }
    else if (zenodoLink) {
        imageLink = `<a href="${globals.zenodoUri}/${zenodoRec}" target="_blank">${img}</a>`;
    }

    let figcaptionClass = 'noblock';
    if (figureSize === 250) {
        figcaptionClass = 'visible';
    }
    
    return `<figure class="figure-${figureSize}">
    <div class="switches">
        ${treatmentReveal}
        <div class="close"></div>
    </div>
    ${imageLink}
    <figcaption class="${figcaptionClass}">
        <a class="transition-050">Zenodo ID: ${zenodoRec}</a>
        <div class="closed">
            <b class="figTitle">${title}</b><br>
            ${caption}<br>
            ${zenodoLink}
            ${treatmentLink}
        </div>
    </figcaption>
</figure>`
}

const renderPage = ({ figureSize, figures, qs, count, prev, next, cacheHit }) => {
    log.info('- renderPage()');
    log.info(`  - figureSize: ${figureSize}px`);
    log.info(`  - figures: ${figures.length} figures`);
    log.info(`  - qs: ${qs}`);
    log.info(`  - count: ${count}`);
    log.info(`  - prev: ${prev}`);
    log.info(`  - next: ${next}`);

    $('#grid-images').classList.add(`columns-${figureSize}`);

    renderFigures(figures, qs, prev, next);
    renderSearchCriteria(qs, count, cacheHit);
}

const renderFigures = (figures, qs, prev, next) => {
    log.info('- renderFigures()');
    // log.info(`  - page: ${page}`);
    // log.info(`  - size: ${size}`);

    if (figures.length) {
        $('#grid-images').innerHTML = figures.join('');
        renderPager(qs, prev, next);
    }
    else {
        $('#grid-images').innerHTML = '<p class="nada">sorry, no images found</p>';
    }

    $('#throbber').classList.add('nothrob');
    listeners.addListenersToFigcaptions();
    listeners.addListenersToFigureTypes();
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

    const criteria = [];
    
    searchParams.delete('page');
    searchParams.delete('size');
    searchParams.delete('source');
    searchParams.delete('grid');
    
    searchParams.forEach((v, k) => {
        if (k === 'q') {
            criteria.push(`<span class="crit-key">${v}</span> is in the text`);
        }
        else {
            criteria.push(`<span class="crit-key">${k}</span> is <span class="crit-val">${v}</span>`);
        }
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
   const aboutCount = count - (count % 5);
   str = `about <span class="crit-count">${aboutCount}</span> records found where ${str}`;
   str += cacheHit ? '💥' : '';
    
    $('#search-criteria').innerHTML = str;
}

export { case1, case2, case3 }