if (typeof(OCELLUS) === 'undefined' || typeof(OCELLUS) !== 'object') {
    OCELLUS = {};
}

OCELLUS.getImages = function(queryObj, search, uri) {

    fetch(uri)
        .then(OCELLUS.fetchReceive)
        .then(function(res) {

            const data = res.value;

            OCELLUS.model.images.resource = 'images';
            OCELLUS.model.images['records-found'] = data.recordsFound;
            OCELLUS.model.images.statistics = data.statistics;

            OCELLUS.model.images['search-criteria'] = OCELLUS.formatSearchCriteria(data.whereCondition);
            
            [OCELLUS.model.images.figures, OCELLUS.model.images.imagesFound] = makeLayout(data.images);
            
            makePager(OCELLUS.model.images, search, queryObj.page);
            OCELLUS.model.images['records-found'] = niceNumbers(xh.value.recordsFound);

            OCELLUS.dom.images.innerHTML = Mustache.render(
                OCELLUS.templates.images, 
                OCELLUS.model.images, 
                OCELLUS['template-partials']
            );   

            OCELLUS.statsChart(OCELLUS.model.images.statistics);
            
            const figs = document.querySelectorAll('figcaption > a');
            for (let i = 0, j = figs.length; i < j; i++) {
                figs[i].addEventListener('click', OCELLUS.toggleFigcaption);
            }

            const carousel = document.querySelectorAll('.carousel');
            for (let i = 0, j = carousel.length; i < j; i++) {
                carousel[i].addEventListener('click', function(event) {
                    turnCarouselOn(OCELLUS.model.images, OCELLUS.model.images.figures[i].recId);
                });
            }
            
            OCELLUS.toggle(OCELLUS.dom.throbber, 'off');
            OCELLUS.toggle(OCELLUS.dom.images, 'on');
        });
};