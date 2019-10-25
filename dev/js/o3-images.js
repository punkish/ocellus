if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') BLR = {};

if (!('images' in BLR)) BLR.images = {};

BLR.images.makeLayout = function(records) {
    let figures = [];
    for (let i = 0, j = records.length; i < j; i++) {
        const figure = {
            title: records[i].title,
            creators: records[i].creators ? records[i].creators.map(c => c.name) : [],
            recId: records[i].id,
            zenodoRecord: BLR.base.zenodo + records[i].id,
            description: records[i].description,
            doi: records[i].doi,
            imgBlur: 'img/kein-preview.png',
            img50: 'img/kein-preview.png',
            img100: 'img/kein-preview.png',
            img250: 'img/kein-preview.png',
            img750: 'img/kein-preview.png',
            image1200: 'img/kein-preview.png'
        };

        if (records[i].thumbs) {
            figure.imgBlur = records[i].thumbs['10'];
            figure.img50 = records[i].thumbs['50'];
            figure.img100 = records[i].thumbs['100'];
            figure.img250 = records[i].thumbs['250'];
            figure.img750 = records[i].thumbs['750'];
            figure.image1200 = records[i].thumbs['1200'];
        }
        
        figures.push(figure)
    }

    return figures;
};

BLR.images.turnCarouselOn = function(data, recId) {

    BLR.base.dom.carousel.innerHTML = Mustache.render(tmplCarousel, data);
    BLR.base.dom.wrapper.classList.remove('show');
    BLR.base.dom.carouselContainer.classList.add('show');

    const carouselOff = document.querySelectorAll('.carouselOff');
    for (let i = 0, j = carouselOff.length; i < j; i++) {
        carouselOff[i].addEventListener('click', turnCarouselOff);
    }
    
    const newhash = '#' + recId;
    if (history.pushState) {
        history.pushState(null, null, newhash);
    }
    else {
        location.hash = newhash;
    }
};

BLR.images.turnCarouselOff = function(event) {
    BLR.base.dom.wrapper.classList.add('show');
    BLR.base.dom.carouselContainer.classList.remove('show');
};

BLR.images.getImages = function(uri) {

    fetch(uri)
        .then(BLR.utils.fetchReceive)
        .then(function(res) {

            if (res.value) {
                BLR.base.model.images = res.value;
            }
            else if (res['num-of-records']) {
                BLR.base.model.images = res;
            }
            

            if (BLR.base.model.images['num-of-records']) {

                BLR.base.model.images.resource = 'images';

                if (BLR.base.model.images['num-of-records'] > 0) {
                    if (BLR.base.model.images['num-of-records']) {
                        BLR.base.model.images.successful = true;
                        BLR.base.model.images['num-of-records'] = BLR.utils.niceNumbers(BLR.base.model.images['num-of-records']);
                        BLR.base.model.images.from = BLR.utils.niceNumbers(BLR.base.model.images.from);

                        if (BLR.base.model.images.to < 10) {
                            BLR.base.model.images.to = BLR.utils.niceNumbers(BLR.base.model.images.to).toLowerCase();
                        }

                        BLR.base.model.images.figures = BLR.images.makeLayout(BLR.base.model.images.records)
                        
                        BLR.base.model.images['search-criteria-text'] = BLR.utils.formatSearchCriteria(
                            BLR.base.model.images['search-criteria'],
                            BLR.base.model.images['num-of-records'],
                            'images'
                        );
                        
                        BLR.utils.makePager(BLR.base.model.images);
                    }
                    else {
                        BLR.base.model.images.successful = false;
                    }
                    
                    
                    BLR.base.dom.images.results.innerHTML = Mustache.render(
                        BLR.base.templates.wholes.images, 
                        BLR.base.model.images,
                        BLR.base.templates.partials
                    );

                    
                    const figs = document.querySelectorAll('figcaption > a');
                    for (let i = 0, j = figs.length; i < j; i++) {
                        figs[i].addEventListener('click', BLR.eventlisteners.toggleFigcaption);
                    }

                    const carousel = document.querySelectorAll('.carousel');
                    for (let i = 0, j = carousel.length; i < j; i++) {
                        carousel[i].addEventListener('click', function(event) {
                            BLR.images.turnCarouselOn(data, data.figures[i].recId);
                        });
                    }
                    

                    //BLR.utils.statsChart(BLR.base.model.treatments.statistics);
                    //BLR.makeMap(BLR.model.treatments.map);
                    //const tabs = new Tabby('[data-tabs]');
         
                    //tabs.open(1);
                    
                    //BLR.base.dom.q.placeholder = `search ${BLR.base.model.treatments['num-of-records']} treatments`;
                }
                else {
                    BLR.base.model.images.successful = false;
                    BLR.base.model.images['num-of-records'] = 'No';

                    BLR.base.dom.images.results.innerHTML = Mustache.render(
                        BLR.base.templates.wholes.images, 
                        BLR.base.model.images,
                        BLR.base.templates.partials
                    );
                }

            }

            BLR.utils.turnOffAll();
            BLR.eventlisteners.toggle(BLR.base.dom.throbber, 'off');
            BLR.eventlisteners.toggle(BLR.base.dom.images.section, 'on');
            
        });
};