if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') BLR = {};

if (!('eventlisteners' in BLR)) BLR.eventlisteners = {};

// BLR.eventlisteners = {};

BLR.eventlisteners.openModal = function(event) {
    event.stopPropagation();
    event.preventDefault();

    BLR.utils.turnOffAll();

    // turn on the requested modal
    const id = event.target.href.split('/').pop().split('.')[0];

    BLR.utils.turnOnById(id);
    history.pushState('', '', `${id}.html`);
};

BLR.eventlisteners.toggle = function(elements, state) {
    const len = elements.length;

    if (state === 'on') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                BLR.utils.turnOn(elements[i]);
            }
        }
        else {
            BLR.utils.turnOn(elements);
        }
    }
    else if (state === 'off') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                BLR.utils.turnOff(elements[i]);
            }
        }
        else {
            BLR.utils.turnOff(elements);
        }
    }
};

BLR.eventlisteners.toggleCommunities = function(event) {
    BLR.base.dom.communitiesSelector.classList.toggle('open');
};

BLR.eventlisteners.toggleRefreshCache = function(event) {
    BLR.base.dom.refreshCacheWarning.classList.toggle('show');
};

BLR.eventlisteners.closeModal = function(event) {
    event.stopPropagation();
    event.preventDefault();

    // turn off all visible modals
    for (let i = 0, j = BLR.base.dom.modals.length; i < j; i++) {
        if (BLR.base.dom.modals[i].classList.contains('visible')) {
            BLR.utils.turnOff(BLR.base.dom.modals[i]);
        }
    }

    // if a panel is saved, turn it on
    if (BLR.base.savedPanel.id) {        
        BLR.utils.turnOnById(BLR.base.savedPanel.id);
        let uri = `${BLR.base.savedPanel.id}.html` + (BLR.base.savedPanel.search || '');
        history.pushState('', '', uri);
    }
    else {
        BLR.utils.turnOnById('index');
        history.pushState('', '', 'index.html');
    }
};

BLR.eventlisteners.goHome = function(event) {
    event.stopPropagation();
    event.preventDefault();

    BLR.utils.turnOffAll();
    BLR.utils.turnOnById('index');
    BLR.base.dom.q.value = '';
    history.pushState('', '', 'index.html');
};

BLR.eventlisteners.activateUrlFlagSelectors = function() {
    for (let i = 0, j =  BLR.base.dom.urlFlagSelectors.length; i < j; i++) {

        const element = BLR.base.dom.urlFlagSelectors[i];
        element.addEventListener('click', function(event) {
    
            BLR.utils.chooseUrlFlags(element);
            
            if (element.name === 'communities') {
                BLR.base.dom.communitiesSelector.classList.remove('open');
            }
    
        })
    }
};

BLR.eventlisteners.goGetIt = function(event) {
    event.stopPropagation();
    event.preventDefault();
    
    if (BLR.utils.formHasNoValidInput()) {

        // warn and exit if input fields are empty
        BLR.base.dom.q.placeholder = "c’mon, enter something";
        return;
    }

    // construct browser URI from fields
    const browserUri = BLR.utils.makeBrowserUri();
    history.pushState('', '', browserUri);

    // construct Zenodeo URI from fields
    const zenodeoUri = BLR.utils.makeZenodeoUriFromInputs();
    BLR.utils.loadResource(zenodeoUri);
};

BLR.eventlisteners.toggleFigcaption = function(event) {

    // find and store all the figcaptions on the page in 
    // an array. This is done only once since figcaptions 
    // is a global var
    if (BLR.base.figcaptions.length == 0) {
        BLR.base.figcaptions = document.querySelectorAll('figcaption');
        //figcaptionLength = BLR.base.figcaptions.length;
    }

    let fc = this.parentElement.style.maxHeight;
    
    if (fc === BLR.base.figcaptionHeight || fc === '') {
        let i = 0;
        for (; i < BLR.base.figcaptions.length; i++) {
            BLR.base.figcaptions[i].style.maxHeight = BLR.base.figcaptionHeight;
        }

        this.parentElement.style.maxHeight =  '100%';
        this.parentElement.style.overflow = 'auto';
    }
    else {
        this.parentElement.style.maxHeight =  BLR.base.figcaptionHeight;
        this.parentElement.style.overflow = 'hidden';
    }
    
};