import {$, $$, go} from './o-utils.js';
import {globals} from './o-globals.js';
import * as treatments from './o-treatments.js';
import * as maps from './o-map.js';
// import * as images from './o-images.js';

const getCountOfResource = (resource) => {
    let count = 0;
    if (resource === 'treatments with images') {
        const queryString = 'cols=';
        count = treatments.getResource('treatments', queryString);
    }
    else if (resource === 'treatments with locations') {
        const queryString = 'cols=';
        count = maps.getResource('treatments', queryString);
    }
    else if (resource === 'images from Zenodo') {
        count = 400204;
    }

    return count;
}

const updatePlaceHolder = async () => {
    let resource = 'images from Zenodo';
    if (globals.view === 'treatments') {
        resource = 'treatments with images';
    }
    else if (globals.view === 'map') {
        resource = 'treatments with locations';
    }

    const tmp = resource.replace(/ /g, '_');
    if (!globals.views.totalCounts[tmp]) {
        globals.views.totalCounts[tmp] = await getCountOfResource(resource);
    }
    
    $('#q').placeholder = `search ${globals.views.totalCounts[tmp]} ${resource}`;
}

const fillForm = async (sp) => {

    // remove any param that is not a part of the query
    globals.not_q.forEach(p => {
        if (sp.has(p)) sp.delete(p);
    });

    // fill form
    const numOfParams = Array.from(sp.entries()).length;
    if (numOfParams == 0) {
        updatePlaceHolder();
    }
    else {
        if (sp.has('q')) {

            // sp has more than just q
            if (numOfParams == 1) {
                $('#q').value = sp.get('q');
            }
            else if (numOfParams > 1) {
                $('#q').value = decodeURIComponent(sp.toString());
            }
        }
        else {
            $('#q').value = decodeURIComponent(sp.toString());
        }
    }
}

/*
case 0:
    load empty page
        default view (images)
        prepare page for default view
            insert footer if needed
            reveal correct result pane
            fill form
                get placeholder for view
*/

const preparePage = (sp) => {

    /*
     * unhide results section based on globals.view
     * that is, make either the 'images' or the 'map'
     * or the 'treatments' section visible
     */
    const sectionToUnhide = globals.view === 'map' ? 'map' : 'images';
    globals.hiddenClasses
        .forEach(c => $(`#${sectionToUnhide}`).classList.remove(c));

    // insert footer in page if the view is not map
    if (globals.view !== 'map') {
        $('footer').innerHTML = `<img src="/img/fish.jpg" aria-label='The half-fish in the footer is based on the original of a Blunt-Nosed Minnow, <i>Pimephales notatus</i> (Rafinesque) ♂ from the <a href="https://archive.org/stream/cu31924090292669/#page/n1063/mode/1up" target="_blank">Internet Archive</a> and has no known copyright restrictions.' data-pop-no-shadow data-pop-arrow>`;
    }

    addDefaultListeners();
    fillForm(sp);
}

const addDefaultListeners = () => {
    $$('.modalToggle')
        .forEach(el => el.addEventListener('click', toggleModal));

    $('#q').addEventListener('focus', (e) => {
        $('#q').placeholder = 'search for something';
        $('#q').classList.remove('red-placeholder');
    });

    $('#go').addEventListener('click', go);

    $('#clear-q').addEventListener('click', (e)=> {
        $('#q').value = '';
        $('#refreshCache').checked = false;
        e.stopPropagation();
        e.preventDefault();
    });

    $('#refreshCache').addEventListener('click', toggleRefreshCache);

    $$('input[name=setview').forEach(i => {
        i.addEventListener('click', (e) => {
            e.target.checked = true;
            globals.view = e.target.value;
            updatePlaceHolder();
            const url = new URL(location);
            const sp = url.searchParams;
            sp.set('view', globals.view);

            history.pushState({}, null, url.href);
        })
    })

    $('#brand').addEventListener('click', (e) => {
        $('#brand').innerHTML = 'MAP • IMAGES • TREATMENTS';
        setTimeout(() => { $('#brand').innerHTML = '4' }, 2000)
    });
}

const toggleRefreshCache = (e) => {
    if ($('#refreshCache').classList.contains("unchecked")) {
        $('#refreshCache').classList.remove("unchecked");
        $('#refreshCache').classList.add("checked");
        $('#refreshCache').checked = true;
        $('#refreshCacheMsg').classList.remove('hidden');
    }
    else {
        $('#refreshCache').classList.remove("checked");
        $('#refreshCache').classList.add("unchecked");
        $('#refreshCache').checked = false;
        $('#refreshCacheMsg').classList.add('hidden');
    }
}

const toggleModal = (e) => {
    const t = new URL(e.target.href).hash;
    const modals = $$('.modal');

    if (t.length > 0) {
        
        // first, let's close all open modals
        modals.forEach(m => {
            m.classList.add(...globals.hiddenClasses);
        });

        // now, let's open the targeted modal
        // globals.hiddenClasses.forEach(c => {
        //     $(t).classList.remove(c)
        // });
        $(t).classList.remove(...globals.hiddenClasses);
    }

    // the 'close' button was clicked, so let's close all open modals
    else {
        modals.forEach(m => m.classList.add(...globals.hiddenClasses));
    }
}

export {preparePage}