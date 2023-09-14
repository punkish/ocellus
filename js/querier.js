import { $, $$ } from './base.js';
import { globals } from './globals.js';
import { makeFigure, renderPage } from './renderers.js';

const getCountOfResource = async (resource) => {
    if (!globals.cache[resource]) {
        const url = `${globals.server}/${resource}?cols=`;
        const response = await fetch(url);
    
        // if HTTP-status is 200-299
        if (response.ok) {
            const json = await response.json();
            const count = json.item.result.count;
            globals.cache[resource] = count;
        }
    
        // throw an error
        else {
            alert("HTTP-Error: " + response.status);
        }
    }

    return globals.cache[resource];
}

const getResource = async (qs) => {
    log.info('- getResource(qs)');

    // turn on the barber pole
    $('#throbber').classList.remove('nothrob');

    const sp = new URLSearchParams(qs);

    // save page and size to use later to update the results
    const page = sp.get('page');
    const size = sp.get('size');
    const grid = sp.get('grid') || 'normal';
    const figureSize = globals.figureSize[grid];

    // what are we getting, images or treatments?
    const resource = sp.get('resource');
   // let termFreq = false;
    let term;
    if (sp.has('q')) {
        term = sp.get('q');
    }

    // make an array from searchParams (sp) to iterate over
    // so we can safely remove keys from the sp
    Array.from(sp).forEach(([key, val]) => {

        if (globals.params.validZenodeo.includes(key)) {

            if (!val) { 

                // a qs can look like so
                //
                // `phylogeny&keyword=Plantae`
                //
                // where 'phylogeny' is a "key" with 
                // no val, so we will use that as 'q'

                sp.set('q', key); 
                sp.delete(key);
                term = key;
            }
        }

        // remove invalid Zenodeo keys
        else {
            sp.delete(key);
        }
    });

    // let's define the cols to retrieve from Zenodeo
    const cols = [ 
        'treatmentId', 'treatmentTitle', 'zenodoDep', 'treatmentDOI', 
        'articleTitle', 'articleAuthor', 'httpUri', 'caption'
    ].join('&cols=');
    
    // cols.map(c => `cols=${c}`).join('&')
    let queryString = `${sp.toString()}&cols=${cols}`;

    if (term) {
        queryString += `&termFreq=true`;
    }

    const queries = [];    
    queries.push(getResults({ resource, queryString, figureSize }));

    Promise.all(queries)
        .then(results => {

            // this is where we store combined results from 
            // different queries
            const res = {
                resource,
                prev: page > 1 ? page - 1 : 1,
                next: parseInt(page) + 1,
                size,
                count: 0,
                recs: []
            };

            // there can be two sets of results, one for images 
            // and the other for treatments. And, if the results 
            // are for images, they can have one or two sources, 
            // Zenodo and/or Zenodeo
            results.forEach(r => {

                if (typeof(r) != 'undefined') {
                    res.recs.push(...r.recs);
                    res.count += r.count;
                    res.termFreq = r.termFreq;
                    res.cacheHit = r.cacheHit;
                    res.stored = r.stored;
                    res.ttl = r.ttl;
                }

            });

            return res;
        })
        .then(results => {
            const figures = results.recs.map(rec => makeFigure({
                resource, 
                figureSize,
                rec
            }));

            const resultsObj = {
                figureSize,
                figures,
                qs, 
                count: results.count, 
                prev: results.prev, 
                next: results.next,
                stored: results.stored,
                ttl: results.ttl,
                cacheHit: results.cacheHit
            };

            if (results.termFreq) {
                resultsObj.termFreq = results.termFreq;
                resultsObj.term = term;
            }

            renderPage(resultsObj);
        });
}

const getResults = async ({ resource, queryString, figureSize }) => {
    log.info(`- getResults({ resource, queryString, figureSize })
    - resource: ${resource}
    - queryString: ${queryString},
    - figureSize: ${figureSize}`);

    const url = `${globals.server}/${resource}?${queryString}`;
    const response = await fetch(url);

    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json();
        const records = json.item.result.records;

        const results = {
            resource,
            count: 0,
            recs: [],
            termFreq: json.item.result.termFreq,
            prev: '',
            next: '',
            stored: json.stored,
            ttl: json.ttl,
            cacheHit: json.cacheHit || false
        };

        if (records) {
            results.count = results.count + json.item.result.count;

            records.forEach(r => {
                const record = {};

                // if (source === 'images') {

                //     // there is no treatmentId associated with 
                //     // Zenodo images
                //     record.treatmentId = r.treatmentId;
                //     //record.title = r.metadata.title;
                //     record.title = r.treatmentTitle;
                //     record.zenodoRec = r.zenodoDep;

                //     // set a default thumbnail in case preview  
                //     // is not available on Zenodo
                //     record.uri = 'thumbs' in r.links 
                //         ? r.links.thumbs[figureSize]
                //         : '/img/kein-preview.png';

                //     record.caption = r.metadata.description;
                // }
                //if (resource === 'images') {
                    record.treatmentId = r.treatmentId;
                    record.treatmentTitle = r.treatmentTitle;
                    record.zenodoRec = r.zenodoDep;
                    record.figureSize = figureSize;

                    // Most figures are on Zenodo, so adjust their url 
                    // accordingly
                    const id = r.httpUri.split('/')[4];

                    // if the figure is on zenodo, show their thumbnails unless 
                    // it is an svg, in which case, show it directly
                    if (r.httpUri.indexOf('zenodo') > -1) {
                        if (r.httpUri.indexOf('.svg') > -1) {
                            record.uri = '/img/kein-preview.png';
                        }
                        else {
                            record.uri = `${globals.zenodoUri}/${id}/thumb${figureSize}`;
                        }
                    }

                    // but some are on Pensoft, so use the uri directly
                    else {
                        record.uri = r.httpUri;
                    }
                    
                    record.captionText = r.captionText;
                    record.treatmentDOI = r.treatmentDOI;
                    record.articleTitle = r.articleTitle;
                    record.articleAuthor = r.articleAuthor;

                results.recs.push(record);
            })

            return results;
        }
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status);
    }
}

const getImagesFromZenodeo = () => {

}

const getImagesFromZenodo = () => {

}

const getTreatmentsFromZenodeo = () => {

}

export {
    getCountOfResource,
    getResource
}