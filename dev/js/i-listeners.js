import { $, $$ } from './i-utils.js';
import { globals } from './i-globals.js';
import { case2 } from './i-main.js';

const addListeners = () => {
    log.info('- listeners.addListeners()');

    $('#refreshCache').addEventListener('click', toggleRefreshCache);
    $('#go').addEventListener('click', go);
    $$('.modalToggle').forEach(el => el.addEventListener('click', toggleModal));
    $('#q').addEventListener('focus', cue);
    $('#clear-q').addEventListener('click', clearCue);
    $('#help').addEventListener('click', toggleExamples);
    $$('.example-insert').forEach(el => el.addEventListener('click', insertExample));
    $('div.examples').addEventListener('toggle', controlDetails, true);
    //$$('input[name=setview').forEach(el => el.addEventListener('click', setView));
    //$$('input[name=source').forEach(el => el.addEventListener('click', setSource));
    $('#brand').addEventListener('click', flashBrand);
}

const toggleExamples = (e) => {
    if ($('.examples').classList.contains('hidden')) {
        $('.examples').classList.remove('hidden');
    }
    else {
        $('.examples').classList.add('hidden');
    }
}

// https://gomakethings.com/only-allowing-one-open-dropdown-at-a-time-with-the-details-element/
const controlDetails = (e) => {

    // Only run if the detail is open
	if (!e.target.open) return;

	// Get all other open dropdowns and close them
	var details = $$('details[open]');
	Array.prototype.forEach.call(details, function (detail) {
		if (detail === e.target) return;
		detail.removeAttribute('open');
	});
}

const insertExample = (e) => {
    $('#q').value = e.target.closest('details').querySelector('summary').textContent;

    const sources = $$('input[name=source');
    sources.forEach(s => {
        if (s.value === 'treatments') {
            s.checked = true;
        }
    })

    toggleExamples();

    e.stopPropagation();
    e.preventDefault();
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
    const q = $('#q').value;

    if (q === '') {
        cue(e);
    }
    else {
        $('#q').classList.remove('red-placeholder');
        $('#throbber').classList.remove('nothrob');

        // let qs = `q=${q}`;
        // if (q.indexOf('=') !== -1) {
        //     qs = q;
        // }

        // const page = $('#page').value;
        // const size = $('#size').value;

        // qs = `${qs}&page=${page}&size=${size}`

        // if ($('#refreshCache').checked) {
        //     qs = `${qs}&refreshCache=true`
        // }

        case2();
    }
    
    e.stopPropagation();
    e.preventDefault();
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
    e.stopPropagation();
    e.preventDefault();
}

const clearCue = (e)=> {
    $('#q').value = '';
    $('#refreshCache').checked = false;
    e.stopPropagation();
    e.preventDefault();
}

/**
 * @function setSource
 * @summary activate the source of the images
 */
const setSource = (e) => {
    const sources = $$('input[name=source');
    let source = 'all';
    sources.forEach(s => {
        if (s.checked) {
            source = s.value;
        }
    })

    let placeholder = 'search all images';
    if (source === 'Zenodo') {
        placeholder = 'search images from Zenodo';
    }
    else if (source === 'treatments') {
        placeholder = 'search images from treatments';
    }
    $('#q').placeholder = placeholder;
}

/**
 * @function setView
 * @summary activate the correct tab on the form based on 'globals.view'
 */
// const setView = (e) => {
//     if (e) {
//         globals.view = e.target.value;
//     }

//     //$(`#setview_${globals.view}`).checked = true;

//     common.updateFooter();
//     common.updatePlaceholder();

//     // first, hide all the views
//     Object.keys(globals.views).forEach(view => {
//         globals
//             .hiddenClasses
//             .forEach(c => $(`#${view}`).classList.add(c));
//     });

//     // now, unhide results section based on globals.view
//     // that is, make either the 'images' or the 'map'
//     // or the 'treatments' section visible
//     globals
//         .hiddenClasses
//         .forEach(c => $(`#${globals.view}`).classList.remove(c));

//     const url = new URL(location);
//     const searchParams = url.searchParams;
//     searchParams.set('view', globals.view);

//     history.pushState({}, null, url.href);
// }

const flashBrand = (e) => {
    $('#brand').innerHTML = 'MAP • IMAGES • TREATMENTS';
    setTimeout(() => { $('#brand').innerHTML = '4' }, 2000);
    e.stopPropagation();
    e.preventDefault();
}

const addListenersToFigcaptions = () => {
    const figcaptions = $$('figcaption > a');
    for (let i = 0, j = figcaptions.length; i < j; i++) {
        figcaptions[i].addEventListener('click', toggleFigcaption);
    }
}

const toggleFigcaption = (e) => {
    const figcaptions = $$('figcaption');
    
    // first, close all figcaptions 
    for (let i = 0, j = figcaptions.length; i < j; i++) {
        figcaptions[i].querySelector('div').classList.remove('open');
        figcaptions[i].querySelector('div').classList.add('closed');
    }

    // now open the clicked figcaption
    const fc = e.target.parentElement;
    fc.querySelector('div').classList.remove('closed');
    fc.querySelector('div').classList.add('open');
}

const addListenersToPagerLinks = () => {
    log.info('- listeners.addListenersToPagerLinks()');
}

export { addListeners, addListenersToFigcaptions, addListenersToPagerLinks };