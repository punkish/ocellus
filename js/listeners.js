import { $, $$ } from './utils.js';
import { globals } from './globals.js';
import { submitForm } from './main.js';

const addListeners = () => {
    log.info('- listeners.addListeners()');

    $('#refreshCache').addEventListener('click', toggleRefreshCache);
    $('#ns-go').addEventListener('click', go);
    $$('.modalToggle').forEach(el => el.addEventListener('click', toggleModal));
    $('#q').addEventListener('focus', cue);
    //$('#clear-q').addEventListener('click', clearCue);
    $('#search-help').addEventListener('click', toggleExamples);
    $$('.example-insert').forEach(el => el.addEventListener('click', insertExample));
    $('div.examples').addEventListener('toggle', controlDetails, true);
    $$('.reveal').forEach(el => el.addEventListener('click', reveal));
    $("#switch").addEventListener('click', toggleSearch);
    // $("#switchNormalSearch").addEventListener('click', toggleNormalSearch);
    $$('input[name=source]').forEach(el => el.addEventListener('click', togglePlaceHolder));
}

const toggleExamples = (e) => {
    if ($('.examples').classList.contains('hidden')) {
        $('.examples').classList.remove('hidden');
    }
    else {
        $('.examples').classList.add('hidden');
    }
}

const toggleSearch = (e) => {
    $('#fancySearch').classList.toggle('hidden');
    $('#fancySearch').classList.toggle('noblock');
    $('#normalSearch').classList.toggle('hidden');
    $('#normalSearch').classList.toggle('noblock');

    // if event exists, the switch was clicked, so update
    // the URL hash
    if (e) {
        const hash = $('#switch').checked 
            ? '#fs'
            : '';

        // https://stackoverflow.com/a/14690177
        if (history.pushState) {
            history.pushState(null, null, hash);
        }
        else {
            location.hash = hash;
        }
    }

    // no event, so toggleSearch was called programmatically.
    // no need to update the URL, but the switch should be set.
    else {
        $('#switch').checked = $('#fancySearch').classList.contains('hidden')
            ? false
            : true;
    }
}

const togglePlaceHolder = (e) => {
    const inputs = $$('input[name=source');
    const i = Array.from(inputs).filter(i => i.checked)[0];
    $('#q').placeholder = i.labels[0].innerHTML;
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
    $('#q').value = e.target.textContent;
    $('#ns-go').classList.add('glowing');

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
    // if ($('#refreshCache').classList.contains("unchecked")) {
    //     $('#refreshCache').classList.remove("unchecked");
    //     $('#refreshCache').classList.add("checked");
    //     $('#refreshCache').checked = true;
    //     $('#refreshCacheMsg').classList.remove('hidden');
    // }
    // else {
    //     $('#refreshCache').classList.remove("checked");
    //     $('#refreshCache').classList.add("unchecked");
    //     $('#refreshCache').checked = false;
    //     $('#refreshCacheMsg').classList.add('hidden');
    // }

    $('#refreshCach').toggleAttribute('data-pop-show');
}

const go = (e) => {
    const q = $('#q').value;

    if (q === '') {
        cue(e);
    }
    else {
        $('#q').classList.remove('red-placeholder');
        $('#throbber').classList.remove('nothrob');
        $('#ns-go').classList.remove('glowing');

        submitForm();
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

const reveal = (e) => {
    //$('#brand').innerHTML = 'MAP • IMAGES • TREATMENTS';
    const t = e.target.innerText;
    e.target.innerText = e.target.dataset.reveal;
    setTimeout(() => { e.target.innerHTML = t }, 2000);

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

const addListenersToFigureTypes = () => {
    const figtypes = $$('figure .reveal');
    for (let i = 0, j = figtypes.length; i < j; i++) {
        figtypes[i].addEventListener('click', reveal);
    }
}

export { 
    addListeners, 
    addListenersToFigcaptions, 
    addListenersToPagerLinks, 
    addListenersToFigureTypes,
    toggleSearch
};