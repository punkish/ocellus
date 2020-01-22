if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') BLR = {};

if (!('treatments' in BLR)) BLR.treatments = {};

BLR.treatments.getOneTreatment = function(uri) {
    fetch(uri)
        .then(BLR.utils.fetchReceive)
        .then(function(res) {    
            BLR.base.model.treatment = res.value;
            if (uri.indexOf('xml') > -1) {
                return BLR.base.model.treatment;
            }
            else {
                BLR.treatments.loadOneTreatment(BLR.base.model);
            }
        });
};

BLR.treatments.loadOneTreatment = function(data) {
    data.treatment.imgCount = BLR.utils.niceNumbers(data.treatment.imgCount);
    data.treatment.zenodeo = BLR.base.zenodeo;

    if (data.treatment['related-records'].materialsCitations.length) {
        data.treatment.materialsCitations = data.treatment['related-records'].materialsCitations;
        data.treatment.mapState = 'open';
    }

    if (data.treatment['related-records'].bibRefCitations.length) {
        data.treatment.bibRefCitations = data.treatment['related-records'].bibRefCitations;
        data.treatment.bibRefCitationsState = 'open';
    }

    if (data.treatment['related-records'].figureCitations.length) {
        data.treatment.figureCitations = data.treatment['related-records'].figureCitations;
        data.treatment.figureCitationsState = 'open';
    }

    if (data.treatment['related-records'].treatmentAuthors.length) {
        data.treatment.treatmentAuthors = data.treatment['related-records'].treatmentAuthors;
        data.treatment.treatmentAuthorsList = BLR.utils.formatAuthorsList(data.treatment['related-records'].treatmentAuthors);
    }
    
    BLR.base.dom.treatment.results.innerHTML = Mustache.render(
        BLR.base.templates.wholes.treatment, 
        data.treatment,
        BLR.base.templates.partials
    );        

    if (data.treatment.imgCount !== 'Zero') {
        const figs = document.querySelectorAll('figcaption > a');
        // const reporters = document.querySelectorAll('.report');
        // const submitters = document.querySelectorAll('.submit');
        // const cancellers = document.querySelectorAll('.cancel');
        
        for (let i = 0, j = figs.length; i < j; i++) {
            figs[i].addEventListener('click', BLR.utils.toggleFigcaption);
            // reporters[i].addEventListener('click', toggleReporter);
            // submitters[i].addEventListener('click', submitReporter);
            // cancellers[i].addEventListener('click', cancelReporter);
        }
    }

    if (data.treatment['related-records'].materialsCitations.length) {
        BLR.treatments.makeMap(data.treatment.materialsCitations);
    }
    

    BLR.utils.turnOffAll();
    BLR.eventlisteners.toggle(BLR.base.dom.throbber, 'off');
    BLR.eventlisteners.toggle(BLR.base.dom.treatment.section, 'on');
    BLR.base.map.leaflet.invalidateSize();
};

BLR.treatments.loadManyTreatments = function(data) {
    if (data.treatments['num-of-records']) {

        data.treatments.resource = 'treatments';

        if (data.treatments['num-of-records'] > 0) {
            if (data.treatments.records && data.treatments.records.length) {
                data.treatments.successful = true;
                data.treatments['num-of-records'] = BLR.utils.niceNumbers(data.treatments['num-of-records']);
                data.treatments.from = BLR.utils.niceNumbers(data.treatments.from);

                if (data.treatments.to < 10) {
                    data.treatments.to = BLR.utils.niceNumbers(data.treatments.to).toLowerCase();
                }
                
                data.treatments['search-criteria-text'] = BLR.utils.formatSearchCriteria(
                    data.treatments['search-criteria'],
                    data.treatments['num-of-records'],
                    'treatments'
                );
                
                BLR.utils.makePager(data.treatments);
            }
            else {
                data.treatments.successful = false;
            }
            
            BLR.base.dom.treatments.results.innerHTML = Mustache.render(
                BLR.base.templates.wholes.treatments, 
                data.treatments,
                BLR.base.templates.partials
            );

            
            //BLR.utils.statsChart(data.treatments.statistics);
            //BLR.makeMap(BLR.model.treatments.map);
            //const tabs = new Tabby('[data-tabs]');
 
            //tabs.open(1);
        }
        else {
            data.treatments.successful = false;
            data.treatments['num-of-records'] = 'No';

            BLR.base.dom.treatments.results.innerHTML = Mustache.render(
                BLR.base.templates.wholes.treatments, 
                data.treatments,
                BLR.base.templates.partials
            );
        }

    }

    BLR.utils.turnOffAll();
    BLR.eventlisteners.toggle(BLR.base.dom.throbber, 'off');
    BLR.eventlisteners.toggle(BLR.base.dom.treatments.section, 'on');
};

BLR.treatments.getManyTreatments = function(uri) {
    fetch(uri)
        .then(BLR.utils.fetchReceive)
        .then(function(res) {
            BLR.base.model.treatments = res.value;
            BLR.treatments.loadManyTreatments(BLR.base.model);
        });
};

BLR.treatments.getTreatments = function(uri) {

    // single treatment
    if (uri.indexOf('treatmentId') > -1) {
        BLR.treatments.getOneTreatment(uri);
    }
    
    // many treatments
    else {
        BLR.treatments.getManyTreatments(uri);
    }
};

BLR.treatments.makeMap = function(points) {

    // initialize the map and add the layers to it
    BLR.base.map.leaflet = L.map('map', {
        center: [0, 0],
        zoom: 2,
        scrollWheelZoom: false
    });

    const tiles = L.tileLayer(BLR.base.map.url, {
        attribution: BLR.base.map.attribution,
        maxZoom: 18,
        id: BLR.base.map.id,
        accessToken: BLR.base.map.accessToken
    }).addTo(BLR.base.map.leaflet);

    // https://stackoverflow.com/questions/16845614/zoom-to-fit-all-markers-in-mapbox-or-leaflet
    const markers = [];
    points.forEach(p => {
        if (typeof(p.latitude) === 'number' && typeof(p.longitude) === 'number') {

            const title = points.treatmentTitle;
            
            const marker = L.marker([p.latitude, p.longitude]).addTo(BLR.base.map.leaflet);
            marker.bindPopup(p.typeStatus + '<br>' + title);
            markers.push(marker)
        }
    });

    const bounds = new L.featureGroup(markers).getBounds();
    BLR.base.map.leaflet.fitBounds(bounds);
   //BLR.base.map.leaflet.addLayer(markers);
    
    

    // const bounds = new L.featureGroup(markers).getBounds();
    // console.log(foo);
    // console.log(bounds);

    // const b = [
    //     [-35.331112, 149.775],
    //     [-37.331387, 138.7475]
    // ];

    //mcmap.fitBounds(new L.featureGroup(markers).getBounds().pad(0.5));

}