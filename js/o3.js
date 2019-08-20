if (typeof(OCELLUS) === 'undefined' || typeof(OCELLUS) !== 'object') {
    OCELLUS = {};
}

OCELLUS.size = 30;

OCELLUS.init = function(state) {
    const {maintenance} = state || {maintenance: false};
    
    // make sure all panels are hidden
    OCELLUS.toggle(OCELLUS.dom.panels, 'off');

    if (maintenance) {
        OCELLUS.toggle(OCELLUS.dom.maintenance, 'on');
        return;
    }
    else {
        OCELLUS.addEvents(OCELLUS.dom.modalOpen, OCELLUS.modalOpen);
        OCELLUS.addEvents(OCELLUS.dom.modalClose, OCELLUS.modalClose);
        OCELLUS.addEvents(OCELLUS.dom.goGetIt, OCELLUS.goGetIt);
    
        OCELLUS.compileTemplates();

        //OCELLUS.getTreatments({resource: 'treatments', stats: true});
        OCELLUS.getResource({resource: 'treatments', stats: true});
        
    }
};