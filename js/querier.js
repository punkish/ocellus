import { $ } from './base.js';
import { globals } from './globals.js';
import { makeSlider, renderPage } from './renderers.js';
import { toggleWarn } from './listeners.js';

function updateTotal(totals, cur) {
    totals.images += cur.num_of_images;
    totals.treatments += cur.num_of_treatments;
    totals.species += cur.num_of_species;
    totals.journals += cur.num_of_journals;
    return totals;
}

const getCountOfResource = async (resource, getYearlyCounts, validGeo) => {
    const segment = validGeo ? `${resource}-geo` : resource;

    if (!globals.cache[segment].yearlyCounts) {
        let url = `${globals.uri.zenodeo}/${resource}?`
        
        if (validGeo) {
            url += 'validGeo=true&';
        }

        url += `cols=`;

        if (getYearlyCounts) {
            url += '&yearlyCounts=true';
        }
        
        const response = await fetch(url, globals.fetchOpts);
        
        // if HTTP-status is 200-299
        if (response.ok) {
            const json = await response.json();
            const count = json.item.result.count;

            if (getYearlyCounts) {
                const yearlyCounts = json.item.result.yearlyCounts;

                const startingValue = {
                    images: 0,
                    treatments: 0,
                    species: 0,
                    journals: 0
                };

                const totals = yearlyCounts.reduce(updateTotal, startingValue);
                globals.cache[segment].yearlyCounts = yearlyCounts;
                globals.cache[segment].totals = totals;
            }
            else {
                globals.cache[segment].totals[resource] = count;
            }
        }
    
        // throw an error
        else {
            alert("HTTP-Error: " + response.status);
        }
    }

    return globals.cache[segment];    
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
    sp.delete('resource');
    let term;
    
    if (sp.has('q')) {
        term = sp.get('q');
    }

    const validParams = resource === 'images'
        ? globals.params.validImages
        : globals.params.validTreatments;

    validParams.push(...globals.params.validCommon);

    // make an array from searchParams (sp) to iterate over
    // so we can safely remove keys from the sp
    let allParamsValid = true;

    Array.from(sp).forEach(([key, val]) => {

        if (validParams.includes(key)) {

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
            toggleWarn(`"${key}" is not a valid param`);
            allParamsValid = false;
        }
    });

    if (allParamsValid === false) {
        return;
    }

    // let's define the cols to retrieve from Zenodeo
    const cols = resource === 'images'
        ? `${globals.cols.images.join('&cols=')}`
        : `${globals.cols.treatments.join('&cols=')}`;

    // cols.map(c => `cols=${c}`).join('&')
    let queryString = `${sp.toString()}&cols=${cols}`;

    if (term) {
        queryString += `&termFreq=true`;
    }

    // get yearlyCounts, but only if the query is not for a treatmentId
    if (!sp.has('treatmentId')) {
        queryString += `&yearlyCounts=true`;
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
                    res.yearlyCounts = r.yearlyCounts;
                    res.cacheHit = r.cacheHit;
                    res.stored = r.stored;
                    res.ttl = r.ttl;
                }

            });

            return res;
        })
        .then(results => {
            const slides = results.recs.map(rec => makeSlider({
                resource, 
                figureSize,
                rec
            }));

            const resultsObj = {
                resource,
                figureSize,
                slides,
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

            if (results.yearlyCounts) {
                resultsObj.yearlyCounts = results.yearlyCounts;
            }

            renderPage(resultsObj);
        });
}

const getResults = async ({ resource, queryString, figureSize }) => {
    log.info(`- getResults({ resource, queryString, figureSize })
    - resource: ${resource}
    - queryString: ${queryString},
    - figureSize: ${figureSize}`);

    const url = `${globals.uri.zenodeo}/${resource}?${queryString}`;
    const response = await fetch(url, globals.fetchOpts);

    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json();
        const records = json.item.result.records;

        let yearlyCounts = undefined;

        if (json.item.result.yearlyCounts) {
            yearlyCounts = {};
            const yearlyCounts = json.item.result.yearlyCounts;

            const startingValue = {
                images: 0,
                treatments: 0,
                species: 0,
                journals: 0
            };

            const totals = yearlyCounts.reduce(updateTotal, startingValue);
            yearlyCounts.yearlyCounts = yearlyCounts;
            yearlyCounts.totals = totals;
        }

        const results = {
            resource,
            count: 0,
            recs: [],
            termFreq: json.item.result.termFreq,
            yearlyCounts,
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

                if (resource === 'images') {
                    record.treatmentId = r.treatmentId;
                    record.treatments_id = r.treatments_id;
                    record.images_id = r.images_id;
                    record.treatmentTitle = r.treatmentTitle;
                    record.zenodoDep = r.zenodoDep;
                    record.figureSize = figureSize;

                    // Most figures are on Zenodo, so adjust their url 
                    // accordingly
                    const id = r.httpUri.split('/')[4];

                    // if the figure is on zenodo, show their thumbnails unless 
                    // it is an svg, in which case, apologize with "no preview"
                    if (r.httpUri.indexOf('zenodo') > -1) {
                        if (r.httpUri.indexOf('.svg') > -1) {
                            record.uri = '/img/kein-preview.png';
                            record.fullImage = '/img/kein-preview.png';
                        }
                        else {

                            // record.uri = `${globals.zenodoUri}/${id}/thumb${figureSize}`;
                            // https://zenodo.org/api/iiif/record:6758444:figure.png/full/250,/0/default.png
                            record.uri = `https://zenodo.org/api/iiif/record:${id}:figure.png/full/250,/0/default.jpg`;
                            record.img = `${globals.uri.zenodo}/${id}/thumb${figureSize}`;

                            // record.fullImage = `${globals.zenodoUri}/${id}/thumb1200`;
                            // https://zenodo.org/api/iiif/record:6758444:figure.png/full/1200,/0/default.png
                            record.fullImage = `https://zenodo.org/api/iiif/record:${id}:figure.png/full/^1200,/0/default.jpg`;
                            record.fullImg = `${globals.uri.zenodo}/${id}/thumb1200`;
                        }
                    }

                    // but some are on Pensoft, so use the uri directly
                    else {
                        record.uri = `${r.httpUri}/singlefigAOF/`;
                        record.fullImage = r.httpUri;
                    } 
                    
                    record.captionText = r.captionText;
                    record.treatmentDOI = r.treatmentDOI;
                    record.articleTitle = r.articleTitle;
                    record.articleAuthor = r.articleAuthor;
                    record.latitude = r.latitude;
                    record.longitude = r.longitude;
                    record.loc = r.loc;

                    // Flip the points lon,lat to lat,lon because the 
                    // convexHull returned from turfjs has points as lon,lat
                    // while leafletjs expects them as lat,lon
                    if (r.convexHull) {
                        record.convexHull = r.convexHull[0]
                            .map(([lon, lat]) => [lat, lon]);
                    }
                    else {
                        record.convexHull = undefined;
                    }
                }
                else if (resource === 'treatments') {
                    record.treatmentId = r.treatmentId;
                    record.treatments_id = r.treatments_id;
                    record.treatmentTitle = r.treatmentTitle;
                    record.zenodoDep = r.zenodoDep;
                    record.figureSize = figureSize;
                    record.journalTitle = r.journalTitle;
                    record.treatmentDOI = r.treatmentDOI;
                    record.articleTitle = r.articleTitle;
                    record.articleAuthor = r.articleAuthor;
                    record.latitude = r.latitude;
                    record.longitude = r.longitude;
                    record.loc = r.loc;

                    // Flip the points lon,lat to lat,lon because the 
                    // convexHull returned from turfjs has points as lon,lat
                    // while leafletjs expects them as lat,lon
                    if (r.convexHull) {
                        record.convexHull = r.convexHull[0]
                            .map(([lon, lat]) => [lat, lon]);
                    }
                    else {
                        record.convexHull = undefined;
                    }
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

export {
    getCountOfResource,
    getResource
}