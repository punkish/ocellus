import { $, $$ } from './base.js';
import { globals } from './globals.js';
import { submitForm, updateSearchPlaceHolder, qs2form, form2qs } from './utils.js';
import { Accordion } from './accordion.js';
import { getResource } from './querier.js';
import { initializeMap } from './mapping/index.js';
import { renderYearlyCountsSparkline } from './renderers.js';

const addListeners = () => {
    log.info('- addListeners()');

    $('#refreshCache').addEventListener('click', toggleRefreshCache);
    $('#ns-go').addEventListener('click', go);
    $('#as-go').addEventListener('click', asGo);
    $('#q').addEventListener('focus', resetPrompt);
    $('#search-help').addEventListener('click', toggleExamples);
    $('div.examples').addEventListener('toggle', controlDetails, true);
    $('input[name=searchtype').addEventListener('click', toggleAdvSearch);
    $('input[name=resource').addEventListener('click', toggleResource);
    $('select[name="as-publicationDate"]').addEventListener('change', toggleDateSelector);
    $('select[name="as-checkinTime"]').addEventListener('change', toggleDateSelector);

    $$('.modalToggle').forEach(el => el.addEventListener('click', toggleModal));
    $$('.example-insert').forEach(el => el.addEventListener('click', insertExample));
    $$('input[type=date').forEach(el => el.addEventListener('change', resetDatePickerWarning));
    $$('#charts-container').forEach(el => new Accordion(el));
    $$('a.quicksearch').forEach((el) => el.addEventListener('click', quickSearch));

    document.addEventListener('keydown', focusOnSearch);
}

function quickSearch(event) {
    const resource = $('input[name=resource]').checked
        ? 'treatments'
        : 'images';

    const state = {};
    const title = '';
    const url = `${event.target.href}&resource=${resource}`;
    history.pushState(state, title, url);
    const loc = new URL(location);
    let qs;

    if (loc.search) {
        qs = loc.search.substring(1);
    }

    qs2form(qs);
    const queryString = form2qs();
    getResource(queryString);
    event.preventDefault();
    event.stopPropagation();
}

// https://justincypret.com/blog/adding-a-keyboard-shortcut-for-global-search
function focusOnSearch(event) {
    if (event.key === '/') {
        if (/^(?:input|textarea|select|button)$/i.test(event.target.tagName)) {
            return;
        }
        
        const searchInput = $('#q');
        
        // Select the text in the input field
        searchInput.setSelectionRange(0, searchInput.value.length);
        
        // Focus on the search input
        searchInput.focus();
        
        // Prevent the default action of the '/' key
        event.preventDefault();
    }
}

const toggleExamples = (e) => {
    const cl = $('.examples').classList;

    if (cl.contains('hidden')) {
        cl.remove('hidden');
    }
    else {
        cl.add('hidden');
    }
}

const resetDatePickerWarning = (e) => {
    const cl = e.target.classList;

    if (cl.contains('required')) {
        cl.remove('required');
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

const toggleAdvSearch = (e) => {
    log.info(('- toggling advanced search'));
    $('#as-container').classList.toggle('noblock');
    const advSearchIsActive = $('input[name=searchtype]').checked;

    if (advSearchIsActive) {
        $('#q').value = '';
        $('#q').placeholder = 'use advanced search below';
        $('#q').disabled = true;
        $('#refreshCache').disabled = true;
        $('#clear-q').disabled = true;
        $('input[name="as-q"]').focus();
        initializeMap({
            mapContainer: 'mapSearch',
            baseLayerSource: 'geodeo',
            drawControl: true
        });
    }
    else {
        $('#q').placeholder = globals.defaultPlaceholder;
        $('#q').disabled = false;
        $('#refreshCache').disabled = false;
        $('#clear-q').disabled = false;
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
            const other = $('input[name=searchType][data-checked=false]');
            other.dataset.checked = true;
            other.checked = true;

            e.target.dataset.checked = 'false';
            e.target.checked = false;
        }
        else {
            const other = $('input[name=searchType][data-checked=true]');
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
    const resource = $('input[name=resource]').checked
        ? 'treatments'
        : 'images';

    // find the value of the checked source button inside 
    // the container div (cd) and set the source to that
    // value
    // const resource = Array.from($$('input[name=resource]'))
    //     .filter(i => i.checked)[0];
    updateSearchPlaceHolder(resource);
    renderYearlyCountsSparkline(resource);
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
        promptForSearchTerm();
        setTimeout(resetPrompt, 4000);
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

const asGo = (e) => {
    $('#throbber').classList.remove('nothrob');
    submitForm();
    
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

const promptForSearchTerm = () => {
    $('#q').placeholder = "c'mon, type something";
    $('#q').classList.add('red-placeholder');
}

const resetPrompt = (e)=> {
    $('#q').placeholder = globals.defaultPlaceholder;
    $('#q').classList.remove('red-placeholder');
    $('#refreshCache').checked = false;
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

            summary.innerText = figDetails[i].open ? fullText : summaryText;
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

function setMapSize(carouselbox) {
    const height = carouselbox.clientHeight;
    const map = carouselbox.querySelector('.map');

    if (!map.style.height) {

        // Set map height to height of the carousel box minus the height 
        // of the toggle control
        map.style.height = `${height - 28}px`;
    }
}

function carousel(box) {
    const toggle = box.querySelector('.toggle-checkbox');

    // Define the global counter, the items and the current item 
    let counter = 0;
    const items = box.querySelectorAll('.slide');
    const amount = items.length;
    let current = items[0];

    // add event handlers to buttons
    toggle.addEventListener('click', function(event) {
        const tgt = event.currentTarget;
        const carouselbox = tgt.parentNode.parentNode.parentNode;
        setMapSize(carouselbox);

        navigate(1);
        drawMap(event);
    });

    // show the first element 
    // (when direction is 0 counter doesn't change)
    navigate(0);

    // navigate through the carousel
    function navigate(direction) {

        // hide the old current list item 
        current.classList.remove('current');

        // calculate the new position
        counter = counter + direction;

        // if the previous one was chosen and the counter is less than 0 
        // make the counter the last element, thus looping the carousel
        if (direction === -1 && counter < 0) { 
            counter = amount - 1; 
        }

        // if the toggle button was clicked and there is no items element, 
        // set the counter to 0
        if (direction === 1 && !items[counter]) { 
            counter = 0;
        }

        // set new current element and add CSS class
        current = items[counter];
        current.classList.add('current');
    }
}

function drawMap(event) {
    const tgt = event.currentTarget;
    const id = tgt.dataset.id;
    const map = globals.maps[id];

    if (!map) {
        const map = L.map(`map-${id}`);
        globals.maps[id] = map;
        const mapSource = 'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
        // const mapSource = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

        L.tileLayer(mapSource, {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        const mcIcon = L.icon({
            iconUrl: '../../img/treatment.svg',
            iconSize: [10, 10],
            iconAnchor: [5, 5],
            // popupAnchor: [-3, -76],
            // shadowUrl: 'my-icon-shadow.png',
            // shadowSize: [68, 95],
            // shadowAnchor: [22, 94]
        })

        let centroid;

        if (tgt.dataset.loc !== 'undefined') {
            const loc = JSON.parse(tgt.dataset.loc);
            
            const points = loc
                .map(point => [point.latitude, point.longitude]);

            points.forEach((point, index) => {
                if (index === 0) {
                    centroid = point;
                }

                L.marker(point, {icon: mcIcon}).addTo(map);
            })

            map.setView(centroid, 10);
        }
        else if (tgt.dataset.convexhull) {
            const convexhull = JSON.parse(tgt.dataset.convexhull);
            const polygon = L.polygon(
                convexhull, 
                { color: '#9BC134', weight: 1} 
            ).addTo(map);
            convexhull.forEach((point, index) => {
                L.marker(point, {icon: mcIcon}).addTo(map);
            });
            map.fitBounds(polygon.getBounds());
        }
    }
}

function addListenersToMapCarouselLink() {
    $$(".carouselbox").forEach(box => {

        if (!box.querySelector('.buttons')) {
            return;
        }

        carousel(box);
    });
}

const toggleDateSelector = (e) => {
    const srcName = e.target.name;
    
    if (e.target.value === 'between') {
        
        //const tos = e.target.parentNode.querySelectorAll('.hidden');
        const tos = $$(`#${srcName}-range .hidden`);

        tos.forEach(t => {
            if (t.classList.contains('hidden')) {
                t.classList.remove('hidden');
                t.classList.add('vis');
            }
        })
    }
    else {
        //const tos = e.target.parentNode.querySelectorAll('.vis');
        const tos = $$(`#${srcName}-range .vis`);

        tos.forEach(t => {
            t.classList.add('hidden');
            t.classList.remove('vis');
        })
    }
}

function showTooltip(evt, text) {
    const sparkTip = $("#sparkTip");
    sparkTip.innerHTML = text;
    sparkTip.classList.remove('hidden');
    sparkTip.classList.add('visible');
}

function hideTooltip() {
    const sparkTip = $("#sparkTip");
    sparkTip.classList.remove('visible');
    sparkTip.classList.add('hidden');
}

function lightUpTheBox() {
    new SimpleLightbox({
        elements: 'figure',
        loadingCaption: '<img src="../../img/bug.gif">',
        //captionAttribute: 'details'
    });
}

export { 
    addListeners, 
    addListenersToFigDetails,
    addListenersToPagerLinks, 
    addListenersToFigureTypes,
    addListenersToMapCarouselLink,
    toggleSearch,
    toggleResource,
    toggleWarn,
    toggleAdvSearch,
    toggleDateSelector,
    showTooltip,
    hideTooltip,
    toggleModal,
    lightUpTheBox
};