if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') BLR = {};

if (!('images' in BLR)) BLR.images = {};

BLR.images.makeLayout = function(records) {
        
    //let imgCount = 0;
    let figures = [];
    for (let i = 0, j = records.length; i < j; i++) {
        const figure = {
            title: records[i].title,
            creators: records[i].creators.map(c => c.name),
            recId: records[i].id,
            zenodoRecord: BLR.base.zenodo + records[i].id,
            description: records[i].description,
            doi: records[i].doi,
            imgBlur: records[i].thumbs['10'],
            img50: records[i].thumbs['50'],
            img100: records[i].thumbs['100'],
            img250: records[i].thumbs['250'],
            img750: records[i].thumbs['750'],
            image1200: records[i].thumbs['1200']
        };
        
        figures.push(figure)
    }

    /*
    for (let record in imagesOfRecords) {
        
        const images = imagesOfRecords[record].images;
        const j = images.length;
        //imgCount = imgCount + j;
        const recId = record.split('/').pop();

        let imgBlur; // 10 pixels wide
        let imgA_; // 50 pixels 
        let imgA; // 250 pixels 
        let imgB; // 400
        let imgC; // 960
        let imgD; // 1200

        if (imagesOfRecords[record].thumb250 === 'na') {
            imgBlur = imgA_ = imgA = imgB = imgC = imgD = 'img/kein-preview.png';
        }
        else {
            imgA    = imagesOfRecords[record].thumb250;
            imgBlur = imgA.replace('/250,', '/10,');
            imgA_   = imgA.replace('/250,', '/50,');
            imgB    = imgA.replace('/250,', '/400,');
            imgC    = imgA.replace('/250,', '/960,');
            imgD    = imgA.replace('/250,', '/1200,');
        }

        const figure = {
            title: imagesOfRecords[record].title,
            creators: imagesOfRecords[record].creators,
            recId: recId,
            zenodoRecord: BLR.base.zenodo + recId,
            imageSrc: images[0],
            imgBlur: imgBlur,
            imgA: imgA,
            imgA_: imgA_,
            imgB: imgB,
            imgC: imgC,
            imgD: imgD
        };
        
        figures.push(figure)
    }
    */
    //return [figures, imgCount];
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