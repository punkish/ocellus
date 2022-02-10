import { $, $$ } from './i-utils.js';
import { globals } from './i-globals.js';
import * as grid from './i-grid.js';

/**
 * @function updateFooter
 * @summary hide the page footer if the view is map
 */
const updateFooter = () => {
    if (globals.view === 'map') {
        $('footer').classList.add('hidden');
    }
}

/**
 * @function fillForm
 * @param {Object} sp - instance of URLSearchParams class
 * @summary fill search form with any submitted params.
 */
 const fillForm = (qs) => {

    // check browser bar
    const url = new URL(location);
    if (url.search) {
        const inputs = qs2inputs(url.search);
        $$('form input').forEach(i => i.value = inputs[i.id]);
        getImages();
    }
}

/**
 * @function updatePlaceHolder
 * @summary fill search form with view-specific placeholder.
 */
 const updatePlaceholder = async () => {

    // default resource msg
    let resource = 'images from Zenodo';

    if (globals.view === 'treatments') {
        resource = 'treatments with images';
    }
    else if (globals.view === 'map') {
        resource = 'treatments with locations';
    }

    if (!globals.views[globals.view].totalCount) {
        globals.views[globals.view].totalCount = await getCountOfResource();
    }

    $('#q').placeholder = `search ${globals.views[globals.view].totalCount} ${resource}`;
}

/**
 * @function getCountOfResource
 * @summary get total count of view-specific resource.
 */
 const getCountOfResource = () => {
    let count = 0;

    if (globals.view === 'map') {
        count = map.getResource({ 
            resource: 'treatments', 
            queryString: 'validGeo=1&cols=' 
        });
    }
    else if (globals.view === 'treatments') {
        count = treatments.getResource({ 
            resource: 'treatments', 
            queryString: 'httpUri=ne()&cols=' 
        });
    }
    else if (globals.view === 'images') {
        count = images.getResource({ 
            resource: 'images', 
            queryString: 'cols=' 
        });
    }

    return count;
}

const getResource = async ({ resource, queryString }) => {
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
            next: ''
        };

        if (records) {
            images.count = images.count + json.item.result.count;

            records.forEach(r => {
                if (resource === 'images') {
                    images.recs.push({
                        treatmentId: '',
                        title: r.metadata.title,
                        zenodoRec: r.id,
                        uri: r.links.thumbs['250'],
                        caption: r.metadata.description
                    })
                }
                else if (resource === 'treatments') {
                    images.recs.push({
                        treatmentId: r.treatmentId,
                        title: r.treatmentTitle,
                        zenodoRec: r.zenodoDep,
                        uri: r.httpUri,
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

const getImages = async function() {
    const queryString = inputs2qs($$('form input'));

    const images = getResource({
        resource: 'images',
        queryString
    });
    
    const treatments = getResource({
        resource: 'treatments',
        queryString: `${queryString}&httpUri=ne()&cols=treatmentTitle&cols=zenodoDep&cols=httpUri&cols=captionText`
    });
    
    Promise.all([images, treatments])
        .then(results => {
            const res = {
                prev: page > 1 ? page - 1 : 1,
                next: parseInt(page) + 1,
                size: size,
                count: 0,
                recs: []
            };

            if (results[0]) {
                res.recs.push(...results[0].recs);
                res.count = results[0].count;
            }

            if (results[1]) {
                res.recs.push(...results[1].recs);
                res.count = results[1].count;
            }

            return res;
        })
        .then(results => {
            const uniq = {};

            const recs = results.recs;
            recs.forEach(r => {
                const figure = grid.makeFigure({
                    size: 250, 
                    treatmentId: r.treatmentId, 
                    title: r.title,
                    zenodoRec: r.zenodoRec, 
                    uri: r.uri,
                    caption: r.caption
                });

                uniq[r.uri] = figure;
            });

            globals.results.figures = Object.values(uniq);
            grid.showSearchCriteria(queryString, results.count);
            grid.showPage($('#page').value, $('#size').value);
            grid.showPager(queryString, results.prev, results.next);
            //grid.updateUrl(queryString);
        })
}



const showSearchCriteria = (qObj, count) => {}

export { fillForm, updateFooter, updatePlaceholder, getImages }