/**
 * API layer: fetches data from Zenodeo and hands
 * structured results to the renderer.
 *
 * Changes from the original:
 *  - validParams.push() bug fixed: now copies the array before
 *    mutating it, so globals.params.validImages /
 *    globals.params.validTreatments are not permanently altered
 *    on every call
 *  - toggleWarn imported from utils.js, not listeners.js —
 *    this breaks the former querier → listeners circular dep
 */

import { $ }            from './base.js';
import { globals }      from './globals.js';
import { makeSlider, renderPage } from './renderers.js';
import { toggleWarn }   from './utils.js';
// Post-render event wiring moved here from renderPage()
// in renderers.js. These functions are in figure-listeners.js
// (not listeners.js) specifically to avoid creating a new
// querier → listeners → querier cycle: listeners.js imports
// getResource from querier.js, so querier.js cannot import from
// listeners.js. figure-listeners.js has no dependency on querier.js.
import {
    addListenersToFigDetails,
    addListenersToFigureTypes,
    addListenersToMapCarouselLink,
    toggleAdvSearch,
    lightUpTheBox
} from './figure-listeners.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Accumulates per-year record counts from a single
 * yearlyCounts row into a running totals object.
 * Used as the reducer callback in getCountOfResource and
 * getResults.
 * @param {{ images: number, treatments: number,
 *           species: number, journals: number }} totals
 * @param {{ num_of_images: number, num_of_treatments: number,
 *           num_of_species: number, num_of_journals: number }} cur
 * @returns {typeof totals}
 */
function updateTotal(totals, cur) {

    totals.images     += cur.num_of_images;
    totals.treatments += cur.num_of_treatments;
    totals.species    += cur.num_of_species;
    totals.journals   += cur.num_of_journals;

    return totals;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetches total record counts and optional yearly
 * breakdown for a given resource type. Results are cached in
 * globals.cache[segment] so repeated calls (e.g. on resource
 * toggle) do not re-hit the network.
 *
 * @param {string}  resource        - 'images' or 'treatments'
 * @param {boolean} getYearlyCounts - Whether to request the
 *                                    yearly breakdown
 * @param {boolean} validGeo        - When true, filters to
 *                                    geocoded records only and
 *                                    uses the '*-geo' cache slot
 * @returns {Promise<Object>} Resolved cache entry with
 *                            .yearlyCounts and .totals
 */
const getCountOfResource = async (
    resource,
    getYearlyCounts,
    validGeo
) => {

    const segment = validGeo ? `${resource}-geo` : resource;

    if (!globals.cache[segment].yearlyCounts) {

        let url = `${window.Ocellus.uris.zenodeo}/${resource}?`;

        if (validGeo) {
            url += 'validGeo=true&';
        }

        url += `cols=`;

        if (getYearlyCounts) {
            url += '&yearlyCounts=true';
        }

        const resp = await fetch(url, globals.fetchOpts);

        if (resp.ok) {
            const json = await resp.json();
            const { query, response } = json;

            if (getYearlyCounts) {
                const yearlyCounts = response.yearlyCounts;
                const startingValue = {
                    images: 0, treatments: 0,
                    species: 0, journals: 0
                };

                const totals = yearlyCounts
                    .reduce(updateTotal, startingValue);

                globals.cache[segment].yearlyCounts = yearlyCounts;
                globals.cache[segment].totals       = totals;
            }
            else {
                globals.cache[segment].totals[resource] =
                    response.count;
            }
        }
        else {
            // alert() is legacy behaviour preserved from
            // the original; future work could use toggleWarn()
            alert('HTTP-Error: ' + response.status);
        }
    }

    return globals.cache[segment];
};

/**
 * Entry point for a search: validates query-string
 * parameters against the allowed list for the requested resource,
 * fetches results, maps each record to a slider element, then
 * passes everything to renderPage().
 *
 * @param {string} qs - URL query string (without leading '?')
 */
const getResource = async (qs) => {

    log.info('- getResource(qs)');

    // Start the barber-pole loading indicator
    $('#throbber').classList.remove('nothrob');

    const sp = new URLSearchParams(qs);

    const page   = sp.get('page');
    const size   = sp.get('size');

    // Read layout state from hidden form inputs rather
    // than from 'grid' param — the hidden inputs are kept in sync
    // by url-manager.js and layout.js
    const layoutEl  = $('input[name=layout]');
    const imgEl     = $('input[name=img]');
    const layout    = layoutEl ? layoutEl.value : 'normal';
    const imgSize   = imgEl
        ? imgEl.value
        : (layout === 'pg' ? '50' : '250');
    const figureSize = parseInt(imgSize, 10);

    const resource = sp.get('resource');
    sp.delete('resource');

    let term;

    if (sp.has('q')) {
        term = sp.get('q');
    }

    // BUG FIX: the original code wrote
    //
    //   const validParams = globals.params.validImages;
    //   validParams.push(...globals.params.validCommon);
    //
    // which mutated the shared global array on every call, so
    // after two searches validImages contained validCommon twice.
    // Spreading into a new array prevents that.
    const validParams = resource === 'images'
        ? [...globals.params.validImages,
           ...globals.params.validCommon]
        : [...globals.params.validTreatments,
           ...globals.params.validCommon];

    let allParamsValid = true;

    // Iterate over a snapshot of sp so we can safely
    // call sp.set() / sp.delete() inside the loop
    Array.from(sp).forEach(([key, val]) => {

        if (validParams.includes(key)) {

            if (!val) {

                // A bare key with no value (e.g.
                // '?phylogeny&keyword=Plantae') is treated as a
                // free-text search term rather than a filter
                sp.set('q', key);
                sp.delete(key);
                term = key;
            }
        }
        else {
            toggleWarn(`"${key}" is not a valid param`);
            allParamsValid = false;
        }
    });

    if (!allParamsValid) return;

    const cols = resource === 'images'
        ? globals.cols.images.join('&cols=')
        : globals.cols.treatments.join('&cols=');

    let queryString = `${sp.toString()}&cols=${cols}`;

    if (term) {
        queryString += `&termFreq=true`;
    }

    // yearlyCounts is expensive; skip it when the query
    // targets a specific treatment (no aggregation needed)
    if (!sp.has('treatmentId')) {
        queryString += `&yearlyCounts=true`;
    }

    const queries = [
        getResults({ resource, queryString, figureSize })
    ];

    Promise.all(queries)
        .then(results => {

            const res = {
                resource,
                prev:  page > 1 ? page - 1 : 1,
                next:  parseInt(page) + 1,
                size,
                count: 0,
                recs:  []
            };

            results.forEach(r => {

                if (typeof r !== 'undefined') {
                    res.recs.push(...r.recs);
                    res.count        += r.count;
                    res.termFreq      = r.termFreq;
                    res.yearlyCounts  = r.yearlyCounts;
                    res.cacheHit      = r.cacheHit;
                    res.stored        = r.stored;
                    res.ttl           = r.ttl;
                }
            });

            return res;
        })
        .then(results => {

            const slides = results.recs.map(rec =>
                makeSlider({ resource, figureSize, rec })
            );

            const resultsObj = {
                resource,
                layout,
                figureSize,
                slides,
                qs,
                count:    results.count,
                prev:     results.prev,
                next:     results.next,
                stored:   results.stored,
                ttl:      results.ttl,
                cacheHit: results.cacheHit
            };

            if (results.termFreq) {
                resultsObj.termFreq = results.termFreq;
                resultsObj.term     = term;
            }

            if (results.yearlyCounts) {
                resultsObj.yearlyCounts = results.yearlyCounts;
            }

            renderPage(resultsObj);

            // Post-render event wiring — moved here from
            // renderPage() in renderers.js to break the
            // renderers → listeners circular dependency.
            // These calls are semantically correct here: the querier
            // knows when a fresh page of results has just landed.
            if (resultsObj.slides && resultsObj.slides.length) {
                addListenersToFigDetails();
                addListenersToFigureTypes();
                addListenersToMapCarouselLink();
            }

            // Collapse advanced-search panel if it was
            // open when the search was submitted
            const advSearchIsActive =
                $('input[name=searchtype]').checked;

            if (advSearchIsActive) {
                $('input[name=searchtype]').checked = false;
                toggleAdvSearch();
            }

            // Initialise lightbox for image results
            if (resource === 'images') {
                lightUpTheBox();
            }

            $('#layout').classList.remove('hidden');
        });
};

/**
 * Fetches one page of results for a resource from Zenodeo,
 * normalises the record shape, and returns a plain object ready
 * for makeSlider().
 *
 * Zenodo image URIs use the IIIF API; Pensoft images use the
 * direct URI. The normalisation logic handles both cases.
 *
 * @param {{ resource: string, queryString: string,
 *           figureSize: number }} opts
 * @returns {Promise<Object|undefined>}
 */
const getResults = async ({ resource, queryString, figureSize }) => {

    log.info(
        `- getResults()\n`
      + `  - resource: ${resource}\n`
      + `  - queryString: ${queryString}\n`
      + `  - figureSize: ${figureSize}`
    );

    const url =
        `${window.Ocellus.uris.zenodeo}/${resource}?${queryString}`;

    const resp = await fetch(url, globals.fetchOpts);

    if (resp.ok) {

        const {
            query, response, stored, ttl, cacheHit
        } = await resp.json();

        const yearlyCounts = {};

        if (response.yearlyCounts) {
            const yc = response.yearlyCounts;
            const startingValue = {
                images: 0, treatments: 0,
                species: 0, journals: 0
            };

            const totals = yc.reduce(updateTotal, startingValue);
            yearlyCounts.yearlyCounts = yc;
            yearlyCounts.totals       = totals;
        }

        const results = {
            resource,
            count:       0,
            recs:        [],
            termFreq:    response.termFreq,
            yearlyCounts,
            prev:        '',
            next:        '',
            stored,
            ttl,
            cacheHit
        };

        if (response.records) {
            results.count += response.count;

            response.records.forEach(r => {
                const record = {};

                if (resource === 'images') {
                    record.treatmentId    = r.treatmentId;
                    record.treatments_id  = r.treatments_id;
                    record.images_id      = r.images_id;
                    record.treatmentTitle = r.treatmentTitle;
                    record.zenodoDep      = r.zenodoDep;
                    record.figureSize     = figureSize;

                    // Extract the Zenodo record ID from
                    // the httpUri path segment (position 4)
                    const id = r.httpUri.split('/')[4];

                    if (r.httpUri.indexOf('zenodo') > -1) {

                        if (r.httpUri.indexOf('.svg') > -1) {

                            // SVGs have no usable IIIF
                            // thumbnail, so fall back to a placeholder
                            record.uri       = '/img/kein-preview.png';
                            record.fullImage = '/img/kein-preview.png';
                        }
                        else {

                            // IIIF thumbnail (250px wide)
                            // for the grid view
                            record.uri = [
                                'https://zenodo.org/api/iiif',
                                `record:${id}:figure.png`,
                                'full/250,/0/default.jpg'
                            ].join('/');

                            record.img =
                                `${window.Ocellus.uris.zenodo}`
                              + `/${id}/thumb${figureSize}`;

                            // IIIF large image (1200px
                            // wide) for the lightbox
                            record.fullImage = [
                                'https://zenodo.org/api/iiif',
                                `record:${id}:figure.png`,
                                'full/^1200,/0/default.jpg'
                            ].join('/');

                            record.fullImg =
                                `${window.Ocellus.uris.zenodo}`
                              + `/${id}/thumb1200`;
                        }
                    }
                    else {

                        // Pensoft figures: use the URI
                        // directly with the singlefigAOF suffix
                        record.uri       = `${r.httpUri}/singlefigAOF/`;
                        record.fullImage = r.httpUri;
                    }

                    record.captionText  = r.captionText;
                    record.treatmentDOI = r.treatmentDOI;
                    record.articleTitle = r.articleTitle;
                    record.articleAuthor = r.articleAuthor;
                    record.latitude     = r.latitude;
                    record.longitude    = r.longitude;
                    record.loc          = r.loc;

                    // turfjs convexHull uses [lon, lat]
                    // but Leaflet needs [lat, lon], so flip here
                    record.convexHull = r.convexHull
                        ? r.convexHull[0]
                            .map(([lon, lat]) => [lat, lon])
                        : undefined;
                }
                else if (resource === 'treatments') {
                    record.treatmentId    = r.treatmentId;
                    record.treatments_id  = r.treatments_id;
                    record.treatmentTitle = r.treatmentTitle;
                    record.zenodoDep      = r.zenodoDep;
                    record.figureSize     = figureSize;
                    record.journalTitle   = r.journalTitle;
                    record.treatmentDOI   = r.treatmentDOI;
                    record.articleTitle   = r.articleTitle;
                    record.articleAuthor  = r.articleAuthor;
                    record.latitude       = r.latitude;
                    record.longitude      = r.longitude;
                    record.loc            = r.loc;

                    record.convexHull = r.convexHull
                        ? r.convexHull[0]
                            .map(([lon, lat]) => [lat, lon])
                        : undefined;
                }

                results.recs.push(record);
            });

            return results;
        }
    }
    else {
        alert('HTTP-Error: ' + response.status);
    }
};

export { getCountOfResource, getResource };
