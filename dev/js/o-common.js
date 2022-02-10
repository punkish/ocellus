import { $, $$ } from './o-utils.js';
import { globals } from './o-globals.js';
import { addListeners, setView } from './o-listeners.js';
import { queries } from './o-queries.js';
import * as grid from './o-grid.js';
import * as treatments from './o-treatments.js';
import * as map from './o-map.js';
import * as images from './o-images.js';

const preparePage = (searchParams) => {
    //setView();

    if (searchParams) {
        fillForm(searchParams);
    } 
}

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
 const fillForm = (searchParams) => {
    const numOfParams = Array.from(searchParams.entries()).length;

    if (numOfParams == 1) {

        // sp has only 'q'
        if (searchParams.has('q')) {
            $('#q').value = searchParams.get('q');
        }

        // sp has something besides 'q', eg, another ZQL param
        else {
            $('#q').value = decodeURIComponent(searchParams.toString());
        }
    }

    // sp has more than 'q'
    else if (numOfParams > 1) {
        $('#q').value = decodeURIComponent(searchParams.toString());
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

        const images = [];
        if (records) {
            records.forEach(r => {
                if (resource === 'images') {
                    images.push({
                        treatmentId: '',
                        title: r.metadata.title,
                        zenodoRec: r.id,
                        uri: r.links.thumbs['250'],
                        caption: r.metadata.description
                    })
                }
                else if (resource === 'treatments') {
                    images.push({
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
    const images = getResource({
        resource: 'images',
        queryString: `q=${$('#q').value}`
    });
    
    const treatments = getResource({
        resource: 'treatments',
        queryString: `q=${$('#q').value}&httpUri=ne()&cols=treatmentTitle&cols=zenodoDep&cols=httpUri&cols=captionText`
    });
    
    Promise.all([images, treatments])
        .then(results => {
            return [...results[0], ...results[1]];
        })
        .then(records => {
            const uniq = {};

            records.forEach(r => {
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

            grid.showPage(Object.values(uniq));
        })
}

export { fillForm, updateFooter, updatePlaceholder, preparePage, getImages }