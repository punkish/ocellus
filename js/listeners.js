import { $, $$ } from './base.js';
import { globals } from './globals.js';
import { submitForm, updatePlaceHolder } from './utils.js';

const addListeners = () => {
    log.info('- addListeners()');

    $('#refreshCache').addEventListener('click', toggleRefreshCache);
    $('#ns-go').addEventListener('click', go);
    $('#q').addEventListener('focus', cue);
    $('#search-help').addEventListener('click', toggleExamples);
    $('div.examples').addEventListener('toggle', controlDetails, true);

    $$('.modalToggle').forEach(el => el.addEventListener('click', toggleModal));
    $$('.reveal').forEach(el => el.addEventListener('click', reveal));

    const examples = $$('.example-insert');
    examples.forEach(el => el.addEventListener('click', insertExample));

    const switches = $$("input[name=searchType");
    switches.forEach(el => el.addEventListener('click', toggleSearch));

    const resources = $$('.resource input');
    resources.forEach(el => el.addEventListener('click', toggleResource));
}

const toggleExamples = (e) => {
    if ($('.examples').classList.contains('hidden')) {
        $('.examples').classList.remove('hidden');
    }
    else {
        $('.examples').classList.add('hidden');
    }
}

const toggleWarn = (msg) => {
    if ($('.warn').classList.contains('hidden')) {
        $('.warn').innerHTML = msg;
        $('.warn').classList.remove('hidden');
        $('#throbber').classList.add('nothrob');
        setTimeout(() => { 
            $('.warn').innerHTML = '';
            $('.warn').classList.add('hidden');
        }, 3000);
    }
}

const toggleSearch = (e) => {
    $('#fancySearch').classList.toggle('hidden');
    $('#fancySearch').classList.toggle('noblock');
    $('#normalSearch').classList.toggle('hidden');
    $('#normalSearch').classList.toggle('noblock');

    const searchType = Array.from($$('input[name=searchType]'))
        .filter(i => i.checked)[0].value;

    // if event exists, the switch was clicked, so check the correct
    // switch and update the URL hash
    if (e) {
        if (e.target.dataset.checked === 'true') {
            const other = $('input[data-checked=false]');
            other.dataset.checked = true;
            other.checked = true;

            e.target.dataset.checked = 'false';
            e.target.checked = false;
        }
        else {
            const other = $('input[data-checked=true]');
            other.dataset.checked = false;
            other.checked = false;

            e.target.dataset.checked = 'true';
            e.target.checked = true;
        }

        const hash = searchType === 'fs' 
            ? '#fs'
            : window.location.pathname;

        // https://stackoverflow.com/a/14690177
        if (history.pushState) {
            history.pushState(null, null, hash);
        }
        else {
            location.hash = hash;
        }

        // now, let's update the resource switch
        const arr = Array.from($$('input[name=resource]'));
        const checkedResource = arr.filter(i => i.checked)[0];
        
        const uncheckedTwin = arr
            .filter(i => !i.checked && (i.value === checkedResource.value))[0];

        checkedResource.checked = false;
        uncheckedTwin.checked = true;
    }

    // no event, so toggleSearch was called programmatically.
    // no need to update the URL, but the switch should be set.
    else {
        const searchTgt = searchType === 'ns'
            ? $('#switchSearch-1')
            : $('#switchSearch-2');

        searchTgt.checked = true;
    }
}

const toggleResource = (e) => {

    // find the value of the checked source button inside 
    // the container div (cd) and set the source to that
    // value
    const resource = Array.from($$('input[name=resource]'))
        .filter(i => i.checked)[0];
    
    updatePlaceHolder(resource.value);
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
    $('#refreshCache').toggleAttribute('data-pop-show');
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
    const sources = $$('input[name=resource');
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

const addListenersToFigDetails = () => {
    const figDetails = $$('figcaption > details');

    for (let i = 0, j = figDetails.length; i < j; i++) {
        figDetails[i].addEventListener('toggle', (event) => {
            const summary = event.target.querySelector('summary');
            const fullText = summary.dataset.title;
            const summaryText = fullText.length > 30
                ? `${fullText.substring(0, 30)}…`
                : fullText;

            if (figDetails[i].open) {
                summary.innerText = fullText;
            } 
            else {
                summary.innerText = summaryText;
            }
        });
    }
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
    addListenersToFigDetails,
    addListenersToPagerLinks, 
    addListenersToFigureTypes,
    toggleSearch,
    toggleResource,
    toggleWarn
};