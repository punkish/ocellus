if (typeof(OCELLUS) === 'undefined' || typeof(OCELLUS) !== 'object') {
    OCELLUS = {};
}

OCELLUS.modalOpen = function(event) {
    event.stopPropagation();
    event.preventDefault();

    for (let i = 0, j = OCELLUS.saveable.length; i < j; i++) {
        
        const s = document.getElementById(OCELLUS.saveable[i]);

        // is any of the saveable panel 'on'?
        if (s.classList.contains('visible')) {

            // yes, so save it for later
            OCELLUS.savedState = OCELLUS.saveable[i];

            // now turn it off
            OCELLUS.turnOff(s);
            break;
        }
    }

    // close all modals
    OCELLUS.toggle(OCELLUS.dom.panels, 'off');

    const id = event.target.hash.substr(1);
    OCELLUS.toggle(OCELLUS.dom[id], 'on');
};

OCELLUS.modalClose = function(event) {
    event.stopPropagation();
    event.preventDefault();

    const id = event.target.hash.substr(1);
    OCELLUS.toggle(OCELLUS.dom[id], 'off');

    // is a panel already in a savedState? if yes, turn it 'on'
    if (OCELLUS.savedState) {
        const s = document.getElementById(OCELLUS.savedState);
        OCELLUS.turnOn(s);
        OCELLUS.savedState = null;
    }
};

OCELLUS.addEvents = function(elements, func) {
    const len = elements.length;

    if (len > 1) {
        for (let i = 0, j = len; i < j; i++) {
            elements[i].addEventListener('click', func);
        }
    }
    else {
        elements.addEventListener('click', func);
    }
};

OCELLUS.turnOff = function(element) {
    element.classList.remove('visible'); 
    element.classList.add('hidden');
};

OCELLUS.turnOn = function(element) {
    element.classList.add('visible');
    element.classList.remove('hidden');
};

OCELLUS.toggle = function(elements, state) {
    const len = elements.length;

    if (state === 'on') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                OCELLUS.turnOn(elements[i]);
            }
        }
        else {
            OCELLUS.turnOn(elements);
        }
    }
    else if (state === 'off') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                OCELLUS.turnOff(elements[i]);
            }
        }
        else {
            OCELLUS.turnOff(elements);
        }
    }
};