if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};

if (!('eventlisteners' in O)) O.eventlisteners = {};

O.eventlisteners.openModal = function(event) {
    event.stopPropagation();
    event.preventDefault();

    O.utils.turnOffAll();

    // turn on the requested modal
    const id = event.target.href.split('/').pop().split('.')[0];

    O.utils.turnOnById(id);
    history.pushState('', '', `${id}.html`);
};

O.eventlisteners.toggle = function(elements, state) {
    const len = elements.length;

    if (state === 'on') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                O.utils.turnOn(elements[i]);
            }
        }
        else {
            O.utils.turnOn(elements);
        }
    }
    else if (state === 'off') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                O.utils.turnOff(elements[i]);
            }
        }
        else {
            O.utils.turnOff(elements);
        }
    }
};

O.eventlisteners.toggleCommunities = function(event) {

    // log.info(event.target);

    // if (event.target !== O.base.dom.communitiesSelectorArrow) {

    //     log.info(O.base.dom.communitiesSelector)
    //     log.info("removing click event toggleCommunities");

    //     document.body.removeEventListener('click', O.eventlisteners.toggleCommunities, false);
    // }
    // else {
    //     log.info("adding click event toggleCommunities");

    //     document.body.addEventListener('click', O.eventlisteners.toggleCommunities, false);
    // }

    O.base.dom.communitiesSelector.classList.toggle('open');
};

O.eventlisteners.toggleRefreshCache = function(event) {
    O.base.dom.refreshCacheWarning.classList.toggle('visible');
};

O.eventlisteners.closeModal = function(event) {
    event.stopPropagation();
    event.preventDefault();

    // turn off all visible modals
    for (let i = 0, j = O.base.dom.modals.length; i < j; i++) {
        if (O.base.dom.modals[i].classList.contains('visible')) {
            O.utils.turnOff(O.base.dom.modals[i]);
        }
    }

    // if a panel is saved, turn it on
    if (O.base.savedPanel.id) {        
        O.utils.turnOnById(O.base.savedPanel.id);
        let uri = `${O.base.savedPanel.id}.html` + (O.base.savedPanel.search || '');
        history.pushState('', '', uri);
    }
    else {
        O.utils.turnOnById('index');
        history.pushState('', '', 'index.html');
    }
};

O.eventlisteners.goHome = function(event) {
    event.stopPropagation();
    event.preventDefault();

    O.utils.turnOffAll();
    O.utils.turnOnById('index');
    O.base.dom.q.value = '';
    history.pushState('', '', 'index.html');
};

O.eventlisteners.activateUrlFlagSelectors = function() {
    for (let i = 0, j =  O.base.dom.urlFlagSelectors.length; i < j; i++) {

        const element = O.base.dom.urlFlagSelectors[i];
        element.addEventListener('click', function(event) {
    
            O.utils.chooseUrlFlags(element);
            
            if (element.name === 'communities') {
                O.base.dom.communitiesSelector.classList.remove('open');
            }
    
        })
    }
};

O.eventlisteners.goGetIt = function(event) {
    event.stopPropagation();
    event.preventDefault();
    
    if (O.utils.formHasNoValidInput()) {

        // warn and exit if input fields are empty
        O.base.dom.q.placeholder = O.default.qPlaceholder;
        return;
    }

    // construct browser URI from fields
    const browserUri = O.utils.form2uris();
    log.info(`browserUri: ${browserUri}`);
    history.pushState('', '', browserUri);

    //O.utils.loadResource(zenodeoUri);
    O.utils.loadpage();
};

O.eventlisteners.toggleFigcaption = function(event) {

    // find and store all the figcaptions on the page in 
    // an array. This is done only once since figcaptions 
    // is a global var
    if (O.base.figcaptions.length == 0) {
        O.base.figcaptions = document.querySelectorAll('figcaption');
        //figcaptionLength = O.base.figcaptions.length;
    }

    let fc = this.parentElement.style.maxHeight;
    
    if (fc === O.default.figure.captionHeight || fc === '') {
        let i = 0;
        for (; i < O.base.figcaptions.length; i++) {
            O.base.figcaptions[i].style.maxHeight = O.default.figure.captionHeight;
        }

        this.parentElement.style.maxHeight =  '100%';
        this.parentElement.style.overflow = 'auto';
    }
    else {
        this.parentElement.style.maxHeight =  O.default.figure.captionHeight;
        this.parentElement.style.overflow = 'hidden';
    }
    
};

O.eventlisteners.toggleSearch = function(event) {

    O.base.searchType = O.default.search.type;

    if (this.hash) {

        const [k, v] = this.hash.substr(1).split('=');
        if (k === 'search') {
            O.base.searchType = v;
        }

    }

    O.utils.toggleSearchType();
};

O.eventlisteners.toggleGrid = function(event) {

    O,base.gridType = O.search.defaultGridType;

    if (this.hash) {

        const [k, v] = this.hash.substr(1).split('=');
        if (k === 'layout') {
            O.base.gridType = v;
        }
    }

    O.utils.toggleGridType();
};