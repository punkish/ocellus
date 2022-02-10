import { $, $$ } from './o-utils.js';

const preparePage = () => {
    insertFooter();
    unhideMapDiv();
    addListeners();
}

const unhideMapDiv = () => {
    if (O.view === 'map') {
        ['hidden', 'noblock'].forEach(c => $('#map').classList.remove(c));
    }
}

const insertFooter = () => {
    if (O.view !== 'map') {
        $('footer').innerHTML = `<img src="../img/fish.jpg">`
    }
}

const checkUrl = () => {
    const s = new URLSearchParams(window.location.search);
    if (s.has('v')) O.view = s.get('v');
}

const addListeners = () => {
    const els = $$('.modalToggle');
    els.forEach(el => el.addEventListener('click', toggleModal));

    $('#q').addEventListener('focus', (e) => {
        $('#q').placeholder = 'search for something';
        $('#q').classList.remove('red-placeholder');
    });

    $('#go').addEventListener('click', (e) => {    
        if ($('#q').value === '') {
            $('#q').placeholder = "c’mon, enter something";
            $('#q').classList.add('red-placeholder');
        }
        else {
            $('#q').classList.remove('red-placeholder');
            $('#throbber').classList.remove('nothrob');
    
            const qarr = [ $('#q').value.indexOf('=') > -1 ? $('#q').value : `q=${q}` ];
    
            getResource({ 
                resource: 'treatments', 
                queryString: qarr.join('&'), 
                page: PAGE, 
                size: SIZE, 
                fp: FIGPAGE, 
                fs: FIGSIZE 
            })
        }
        
        e.stopPropagation()
        e.preventDefault()
    });

    $('#clear-q').addEventListener('click', (e)=> {
        $('#q').value = '';
        $('#refreshCache').checked = false;
        e.stopPropagation();
        e.preventDefault();
    });

    $('#refreshCache').addEventListener('click', toggleRefreshCache);

    $('#brand').addEventListener('click', (e) => {
        $('#brand').innerHTML = 'IMAGES • TREATMENTS • MAPS';
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
            m.classList.add('hidden', 'noblock');
        });

        // now, let's open the targeted modal
        ['hidden', 'noblock'].forEach(c => {
            $(t).classList.remove(c)
        });
    }

    // the 'close' button was clicked, so let's close all open modals
    else {
        modals.forEach(m => m.classList.add('hidden', 'noblock'));
    }
}

export { preparePage, checkUrl, addListeners }