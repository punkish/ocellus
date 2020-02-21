if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};

if (!('images' in O)) O.images = {};

O.images.makeLayout = function(records) {

    let figures = [];

    for (let i = 0, j = records.length; i < j; i++) {
        const r = records[i];
        
        figures.push({
            title       : r.metadata.title,
            creators    : r.metadata.creators ? r.metadata.creators.map(c => c.name) : [],
            recId       : r.id,
            zenodoRecord: O.default.zenodoUri + r.id,
            description : r.metadata.description,
            doi         : r.doi,
            img         : r.links.thumbs ? true : false,
            img10       : r.links.thumbs ? r.links.thumbs['10']   : '',
            img50       : r.links.thumbs ? r.links.thumbs['50']   : '',
            img100      : r.links.thumbs ? r.links.thumbs['100']  : '',
            img250      : r.links.thumbs ? r.links.thumbs['250']  : '',
            img750      : r.links.thumbs ? r.links.thumbs['750']  : '',
            img1200     : r.links.thumbs ? r.links.thumbs['1200'] : ''
        })
    }

    return figures;
};

O.images.turnCarouselOn = function(data, recId) {

    O.base.dom.carousel.results.innerHTML = Mustache.render(
        O.base.templates.wholes.carousel, 
        O.base.model.images,
        O.base.templates.partials
    );

    const carouselOff = document.querySelectorAll('.carouselOff');
    for (let i = 0, j = carouselOff.length; i < j; i++) {
        carouselOff[i].addEventListener(
            'click', 
            O.images.turnCarouselOff
        );
    }
    
    const newhash = '#' + recId;
    if (history.pushState) {
        history.pushState(null, null, newhash);
    }
    else {
        location.hash = newhash;
    }

    O.utils.turnOffAll();
    O.eventlisteners.toggle(O.base.dom.carousel.section, 'on');

    if (history.pushState) {
        history.pushState(null, null, '');
    }
    else {
        location.hash = '';
    }
};

O.images.turnCarouselOff = function(event) {
    O.utils.turnOffAll();
    O.eventlisteners.toggle(O.base.dom.images.section, 'on');
};

O.images.getImages = function(uri) {

    log.info(`getting images from ${uri}`)

    fetch(uri)
        .then(O.utils.fetchReceive)
        .then(function(res) {

            if (res.value) {
                O.base.model.images = res.value;
            }
            else {
                O.base.model.images = res;
            }

            if ('num-of-records' in O.base.model.images) {

                O.base.model.images.resource = 'images';

                if (O.base.model.images['num-of-records'] > 0) {
                    
                    O.base.model.images.successful = true;
                    O.base.model.images['num-of-records'] = O.utils.niceNumbers(O.base.model.images['num-of-records']);
                    O.base.model.images.from = O.utils.niceNumbers(O.base.model.images.from);

                    if (O.base.model.images.to < 10) {
                        O.base.model.images.to = O.utils.niceNumbers(O.base.model.images.to).toLowerCase();
                    }

                    O.base.model.images.figures = O.images.makeLayout(O.base.model.images.records)
                    
                    O.base.model.images['search-criteria-text'] = O.utils.formatSearchCriteria(
                        O.base.model.images['search-criteria'],
                        O.base.model.images['num-of-records'],
                        'images'
                    );
                    
                    O.utils.makePager(O.base.model.images);
                    
                    O.base.dom.images.results.innerHTML = Mustache.render(
                        O.base.templates.wholes.images, 
                        O.base.model.images,
                        O.base.templates.partials
                    );

                    const densityLink = document.querySelector('a.density');
                    // TODO 
                    
                    const figs = document.querySelectorAll('figcaption > a');
                    for (let i = 0, j = figs.length; i < j; i++) {
                        figs[i].addEventListener('click', O.eventlisteners.toggleFigcaption);
                    }

                    const carousel = document.querySelectorAll('.lazyload');
                    for (let i = 0, j = carousel.length; i < j; i++) {
                        carousel[i].addEventListener('click', function(event) {
                            O.images.turnCarouselOn(O.base.model.images, O.base.model.images.figures[i].recId);
                        });
                    }
                    

                    //O.utils.statsChart(O.base.model.treatments.statistics);
                    //O.makeMap(O.model.treatments.map);
                    //const tabs = new Tabby('[data-tabs]');
         
                    //tabs.open(1);
                    
                    //O.base.dom.q.placeholder = `search ${O.base.model.treatments['num-of-records']} treatments`;
                }
                else {
                    O.base.model.images.successful = false;
                    O.base.model.images['num-of-records'] = 'No';

                    log.info("no images found");
                    log.info(JSON.stringify(O.base.model.images));

                    O.base.model.images['search-criteria-text'] = O.utils.formatSearchCriteria(
                        O.base.model.images['search-criteria'],
                        O.base.model.images['num-of-records'],
                        'images'
                    );
                    
                    O.base.dom.images.results.innerHTML = Mustache.render(
                        O.base.templates.wholes.images, 
                        O.base.model.images,
                        O.base.templates.partials
                    );
                }

            }

            O.utils.turnOffAll();
            O.eventlisteners.toggle(O.base.dom.throbber, 'off');
            O.eventlisteners.toggle(O.base.dom.images.section, 'on');
            
        });
};

O.images.changeDensity = function() {

    const masonry = document.querySelector('#masonry');
    let imgsize = '100';
    
    if (O.base.gridType === 'compact') {
        masonry.classList.remove('masonry-250');
        masonry.classList.add('masonry-100');
    }
    else if (O.base.gridType === 'spaced') {
        masonry.classList.remove('masonry-100');
        masonry.classList.add('masonry-250');
        imgsize = '250';
    }

    // find all images
    const images = masonry.querySelectorAll('img');
    const records = O.base.model.images.records;

    for (let i = 0, j = images.length; i < j; i++) {

        const image = images[i];
        const image_id = image.dataset.recid;

        for (let i = 0, j = records.length; i < j; i++) {

            const record = records[i];
            const record_id = records[i].id;

            if (record_id === image_id) {
                image.src = record.thumbs[imgsize];
                break;
            }
        }

    }
};

O.images.activateGridSwitcher = function() {

    const other = O.base.layout === 'compact' ? 'spaced layout' : 'compact layout';
    log.info(`activating layout to switch to ${other}`);

    // see https://stackoverflow.com/questions/59079116/location-hash-gets-updated-with-value-of-a-links-new-hash-that-is-replaced-aft/59079212#59079212

    setTimeout(() => O.base.dom.toggleGridLink.hash = `#grid=${other.replace(' layout', '')}`, 100); 
    O.base.dom.toggleGridLink.innerHTML = `switch to ${other}`;
    
    O.base.dom.toggleGridLink.addEventListener('click', O.eventlisteners.toggleGrid);
};