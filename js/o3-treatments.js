if (typeof(OCELLUS) === 'undefined' || typeof(OCELLUS) !== 'object') {
    OCELLUS = {};
}

OCELLUS.getOneTreatment = function(uri, search) {
    
    fetch(uri)
        .then(OCELLUS.fetchReceive)
        .then(function(res) {    
            OCELLUS.model.treatment = res.value;

            if (uri.indexOf('xml') > -1) {
                return OCELLUS.model.treatment;
            }

            else {
                OCELLUS.model.treatment.imgCount = OCELLUS.niceNumbers(OCELLUS.model.treatment.imgCount);
                OCELLUS.model.treatment.zenodeo = zenodeo;

                if (OCELLUS.model.treatment['related-records'].materialsCitations.length) {
                    OCELLUS.model.treatment.materialsCitations = OCELLUS.model.treatment['related-records'].materialsCitations;
                    OCELLUS.model.treatment.mapState = 'open';
                }

                if (OCELLUS.model.treatment['related-records'].bibRefCitations.length) {
                    OCELLUS.model.treatment.bibRefCitations = OCELLUS.model.treatment['related-records'].bibRefCitations;
                    OCELLUS.model.treatment.bibRefCitationsState = 'open';
                }

                if (OCELLUS.model.treatment['related-records'].figureCitations.length) {
                    OCELLUS.model.treatment.figureCitations = OCELLUS.model.treatment['related-records'].figureCitations;
                    OCELLUS.model.treatment.figureCitationsState = 'open';
                }

                if (OCELLUS.model.treatment['related-records'].treatmentAuthors.length) {
                    OCELLUS.model.treatment.treatmentAuthors = OCELLUS.model.treatment['related-records'].treatmentAuthors;
                    OCELLUS.model.treatment.treatmentAuthorsList = OCELLUS.formatAuthorsList(OCELLUS.model.treatment['related-records'].treatmentAuthors);
                }
                
                OCELLUS.dom.treatments.innerHTML = Mustache.render(
                    OCELLUS.templates.treatment, 
                    OCELLUS.model.treatment,
                    OCELLUS['template-partials']
                );        

                if (OCELLUS.model.treatment.imgCount !== 'Zero') {
                    const figs = document.querySelectorAll('figcaption > a');
                    // const reporters = document.querySelectorAll('.report');
                    // const submitters = document.querySelectorAll('.submit');
                    // const cancellers = document.querySelectorAll('.cancel');
                    
                    for (let i = 0, j = figs.length; i < j; i++) {
                        figs[i].addEventListener('click', OCELLUS.toggleFigcaption);
                        // reporters[i].addEventListener('click', toggleReporter);
                        // submitters[i].addEventListener('click', submitReporter);
                        // cancellers[i].addEventListener('click', cancelReporter);
                    }
                }

                if (OCELLUS.model.treatment['related-records'].materialsCitations.length) {
                    //document.querySelector('#map').classList.add('show');
                    OCELLUS.makeMap(OCELLUS.model.treatment.materialsCitations);
                }

                OCELLUS.toggle(OCELLUS.dom.throbber, 'off');
                OCELLUS.toggle(OCELLUS.dom.treatments, 'on');
            }

        });
};

OCELLUS.getManyTreatments = function(uri, search) {

    fetch(uri)
        .then(OCELLUS.fetchReceive)
        .then(function(res) {
            OCELLUS.model.treatments = res.value;

            if (OCELLUS.model.treatments['num-of-records']) {

                OCELLUS.model.treatments.resource = 'treatments';

                if (OCELLUS.model.treatments['num-of-records'] > 0) {
                    if (OCELLUS.model.treatments.records && OCELLUS.model.treatments.records.length) {
                        OCELLUS.model.treatments.successful = true;
                        OCELLUS.model.treatments['num-of-records'] = OCELLUS.niceNumbers(OCELLUS.model.treatments['num-of-records']);
                        OCELLUS.model.treatments.from = OCELLUS.niceNumbers(OCELLUS.model.treatments.from);

                        if (OCELLUS.model.treatments.to < 10) {
                            OCELLUS.model.treatments.to = OCELLUS.niceNumbers(OCELLUS.model.treatments.to).toLowerCase();
                        }
                        
                        OCELLUS.model.treatments['search-criteria-text'] = OCELLUS.formatSearchCriteria(OCELLUS.model.treatments['search-criteria']);
                        OCELLUS.makePager(OCELLUS.model.treatments, search, false);
                    }
                    else {
                        OCELLUS.model.treatments.successful = false;
                    }
                    
                    OCELLUS.dom.treatments.innerHTML = Mustache.render(
                        OCELLUS.templates.treatments, 
                        OCELLUS.model.treatments,
                        OCELLUS['template-partials']
                    );

                    const tabs = new Tabs({ elem: "tabs", open: 0 });
                    OCELLUS.statsChart(OCELLUS.model.treatments.statistics);
                    OCELLUS.dom.q.placeholder = `search ${OCELLUS.model.treatments['num-of-records']} treatments`;
                }
                else {
                    OCELLUS.model.treatments.successful = false;
                    OCELLUS.model.treatments['num-of-records'] = 'No';

                    OCELLUS.dom.treatments.innerHTML = Mustache.render(
                        OCELLUS.templates.treatments, 
                        OCELLUS.model.treatments,
                        OCELLUS['template-partials']
                    );
                }

            }

            OCELLUS.toggle(OCELLUS.dom.throbber, 'off');
            OCELLUS.toggle(OCELLUS.dom.treatments, 'on');

        });
};

OCELLUS.getTreatments = function(queryObj, search, uri) {

    // single treatment
    if (queryObj.treatmentId) {
        console.log('getting a single treatment ' + queryObj.treatmentId);
        OCELLUS.getOneTreatment(uri, search);
    }
    
    // many treatments
    else {
        console.log('getting many treatments from ' + uri);
        OCELLUS.getManyTreatments(uri, search);
    }
};

OCELLUS.makeMap = function(mcs) {

    // initialize the map and add the layers to it
    const mcmap = L.map('map', {
        center: [0, 0],
        zoom: 8,
        scrollWheelZoom: false
    });

    L.tileLayer(OCELLUS.map.url, {
        attribution: OCELLUS.map.attribution,
        maxZoom: 18,
        id: OCELLUS.map.id,
        accessToken: OCELLUS.map.accessToken
    }).addTo(mcmap);

    // https://stackoverflow.com/questions/16845614/zoom-to-fit-all-markers-in-mapbox-or-leaflet
    const markers = [];
    mcs.forEach(mc => {
        if (mc.latitude && mc.longitude) {
            const marker = L.marker([mc.latitude, mc.longitude]).addTo(mcmap);
            marker.bindPopup(mc.typeStatus);
            markers.push(marker)
        }
    })

    const bounds = new L.featureGroup(markers).getBounds();
    mcmap.fitBounds(bounds);
}