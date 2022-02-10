import { $, $$ } from './o-utils.js';
// import { preparePage } from './o-main.js';
import { globals } from './o-globals.js';
import * as common from './o-common.js';
import * as treatments from './o-treatments.js';
import * as map from './o-map.js';
import * as images from './o-images.js';

const addListeners = (layout) => {
    addDefaultListeners();

    if (layout) {
        addLayoutListeners(layout);
    }
}

const addDefaultListeners = () => {
    $$('.modalToggle').forEach(el => el.addEventListener('click', toggleModal));
    $('#q').addEventListener('focus', cue);
    $('#go').addEventListener('click', go);
    $('#clear-q').addEventListener('click', clearCue);
    $('#refreshCache').addEventListener('click', toggleRefreshCache);
    $$('input[name=setview').forEach(el => el.addEventListener('click', setView));
    $('#brand').addEventListener('click', flashBrand);
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

const go = (e) => {
    if ($('#q').value === '') {
        $('#q').placeholder = "c’mon, enter something";
        $('#q').classList.add('red-placeholder');
    }
    else {
        $('#q').classList.remove('red-placeholder');
        $('#throbber').classList.remove('nothrob');

        common.getImages();
        // if (globals.view === 'treatments') {
        //     const queryString = `q=${$('#q').value}&httpUri=ne()&cols=httpUri&cols=captionText`;
        //     treatments.getResource({ resource: 'treatments', queryString });
        // }
        // else if (globals.view === 'images') {
        //     const queryString = `q=${$('#q').value}`;
        //     images.getResource({ resource: 'images', queryString });
        // }
        // else if (globals.view === 'map') {
        //     const queryString = `q=${$('#q').value}&validGeo=1&cols=latitude&cols=longitude&cols=isOnLand&cols=treatmentTitle`;
        //     map.getResource({ resource: 'treatments', queryString });
        // }
    }
    
    e.stopPropagation()
    e.preventDefault()
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

const cue = (e) => {
    $('#q').placeholder = 'search for something';
    $('#q').classList.remove('red-placeholder');
}

const clearCue = (e)=> {
    $('#q').value = '';
    $('#refreshCache').checked = false;
    e.stopPropagation();
    e.preventDefault();
}

/**
 * @function setView
 * @summary activate the correct tab on the form based on 'globals.view'
 */
const setView = (e) => {
    if (e) {
        globals.view = e.target.value;
    }

    //$(`#setview_${globals.view}`).checked = true;

    common.updateFooter();
    common.updatePlaceholder();

    // first, hide all the views
    Object.keys(globals.views).forEach(view => {
        globals
            .hiddenClasses
            .forEach(c => $(`#${view}`).classList.add(c));
    });

    // now, unhide results section based on globals.view
    // that is, make either the 'images' or the 'map'
    // or the 'treatments' section visible
    globals
        .hiddenClasses
        .forEach(c => $(`#${globals.view}`).classList.remove(c));

    const url = new URL(location);
    const searchParams = url.searchParams;
    searchParams.set('view', globals.view);

    history.pushState({}, null, url.href);
}

const flashBrand = (e) => {
    $('#brand').innerHTML = 'MAP • IMAGES • TREATMENTS';
    setTimeout(() => { $('#brand').innerHTML = '4' }, 2000)
}

const addLayoutListeners = (layout) => {
    if (globals.view === 'images') {
        images.addListeners(layout);
    }
    else if (globals.view === 'treatments') {
        treatments.addListeners(layout);
    }
    else if (globals.view === 'map') {
        map.addListeners(layout);
    }
}

export { addListeners, setView };