import { $, $$ } from './utils.js';
import { globals } from './globals.js';
import { makeFigure, renderPage } from './renderers.js';

const getCountOfResource = async (source) => {
    if (!globals.cache[source]) {
        const resource = source === 'zenodoImages'
            ? 'images'
            : 'treatments';

        const url = `${globals.server}/${resource}?cols=`;
        const response = await fetch(url);
    
        // if HTTP-status is 200-299
        if (response.ok) {
            const json = await response.json();
            const count = json.item.result.count;
            globals.cache[source] = count;
        }
    
        // throw an error
        else {
            alert("HTTP-Error: " + response.status);
        }
    }

    return globals.cache[source];
}

const getResource = async (qs) => {
    log.info('- getResource(qs)');

    // turn on the barber pole
    $('#throbber').classList.remove('nothrob');

    const sp = new URLSearchParams(qs);

    // save page and size to use later to update the results
    const page = sp.get('page');
    const size = sp.get('size');
    // sp.delete('page');
    // sp.delete('size');

    const grid = sp.get('grid') || 'normal';
    const figureSize = globals.figureSize[grid];

    // what are we getting, images or treatments?
    const resource = sp.get('resource');

    // a flag to decide whether or not images have to be 
    // retrived from Zenodo
    let haveToGetImagesFromZenodo = true;

    // make an array from searchParams (sp) to iterate over
    // so we can safely remove keys from the sp
    Array.from(sp).forEach(([key, val]) => {

        if (globals.params.validZenodeo.includes(key)) {

            if (val) { 

                // We haveToGetImagesFromZenodo only if 
                // no other key besides 'q' is used. If any 
                // key other than 'q' is used then we 
                // set haveToGetImagesFromZenodo to false
                if (key !== 'q') {
                    haveToGetImagesFromZenodo = false;
                }
            }

            // a qs can look like so
            //
            // `phylogeny&keyword=Plantae`
            //
            // where 'phylogeny' is a "key" with 
            // no val, so we will use that as 'q'
            else {
                sp.set('q', key); 
                sp.delete(key);
            }
        }

        // remove invalid Zenodeo keys
        else {
            sp.delete(key);
        }
    });

    // let's define the cols to retrieve from Zenodeo
    const cols = [ 'treatmentId', 'treatmentTitle', 'zenodoDep' ];
    
    if (!haveToGetImagesFromZenodo) {

        // adjust the defauls in case source is different
        if (resource === 'treatments') {
            cols.push(...[ 
                'treatmentDOI', 'articleTitle', 'articleAuthor' 
            ]);
        }
        else if (resource === 'images') {
            cols.push(...[ 'httpUri', 'captionText' ]);
        }
    }
    
    const newQs = sp.toString();
    const zQs = `${newQs}&${cols.map(c => `cols=${c}`).join('&')}`;
    const queries = [];

    if (resource === 'images') {
        const q = {
            source: 'treatmentimages',
            queryString: zQs,
            figureSize
        }

        queries.push(getResults(q));

        if (haveToGetImagesFromZenodo) {

            const q = {
                source: 'images',
                queryString: newQs,
                figureSize
            }

            queries.push(getResults(q));
        }
    }
    else {

        const q = {
            source: 'treatments',
            queryString: zQs,
            figureSize
        }

        queries.push(getResults(q));
    }

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
                    res.cacheHit = r.cacheHit;
                }
            })

            return res;
        })
        .then(results => {
            const figures = results.recs.map(rec => makeFigure({
                resource, 
                figureSize,
                rec
            }));

            renderPage({
                figureSize,
                figures,
                qs, 
                count: results.count, 
                prev: results.prev, 
                next: results.next,
                cacheHit: results.cacheHit
            });
        });
}

const getResults = async ({ source, queryString, figureSize }) => {
    log.info(`- getResults({ source, queryString, figureSize })
    - source: ${source}
    - queryString: ${queryString},
    - figureSize: ${figureSize}`);

    const url = `${globals.server}/${source}?${queryString}`;
    const response = await fetch(url);

    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json();
        const records = json.item.result.records;

        const results = {
            //source,
            resource: source === 'treatments'
                ? 'treatments'
                : 'images',
            count: 0,
            recs: [],
            prev: '',
            next: '',
            cacheHit: json.cacheHit || false
        };

        if (records) {
            results.count = results.count + json.item.result.count;

            records.forEach(r => {
                const record = {};

                if (source === 'images') {

                    // there is no treatmentId associated with 
                    // Zenodo images
                    record.treatmentId = '';
                    record.title = r.metadata.title;
                    record.zenodoRec = r.id;

                    // set a default thumbnail in case preview  
                    // is not available on Zenodo
                    record.uri = 'thumbs' in r.links 
                        ? r.links.thumbs[figureSize]
                        : '/img/kein-preview.png';

                    record.caption = r.metadata.description;
                }
                else if (source === 'treatmentimages') {
                    record.treatmentId = r.treatmentId;
                    record.title = r.treatmentTitle;
                    record.zenodoRec = r.zenodoDep;

                    // Most figures are on Zenodo, but some are on
                    // Pensoft, so adjust the url accordingly
                    const id = r.httpUri.split('/')[4];
                    record.uri = r.httpUri.indexOf('zenodo') > -1 
                        ? `${globals.zenodoUri}/${id}/thumb${figureSize}` 
                        : r.httpUri;
                    
                    record.caption = r.captionText;
                }
                else if (source === 'treatments') {
                    record.treatmentId = r.treatmentId;
                    record.title = r.treatmentTitle;
                    record.zenodoRec = r.zenodoDep;
                    record.treatmentDOI = r.treatmentDOI;
                    record.articleTitle = r.articleTitle;
                    record.articleAuthor = r.articleAuthor;
                }

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