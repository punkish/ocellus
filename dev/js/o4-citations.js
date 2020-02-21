'use strict';

if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};

O.getCitations = function(obj) {

    const inputs = obj.inputs;
    const cb = obj.cb;

    // https://zenodo.org/api/records/?communities=biosyslit&communities=belgiumherbarium&page=1&q=erica&size=30&type=image&access_right=open
    // https://zenodo.org/api/records/?communities=biosyslit&type=image&access_right=open
    const uri = inputs ? 'js/_erica.js' : 'js/_none.js';

    fetch(uri)
        .then(O.fetchReceive)
        .then(function(res) {

            const result = {

                successful: true,
        
                // template-records-found
                resource: 'citations',
                'num-of-records': res.hits.total,
                'search-criteria-text': inputs ? O.formatSearchCriteria(inputs) : '',
                from: inputs ? 1 : '',
                to: inputs ? 30 : '',
        
                // template-images
                figures: inputs ? O.makeCitationsLayout(res.hits.hits) : []
            };

            if (inputs) {
                cb(result)
            }
            else {
                O['num-of-records'].citations = result['num-of-records'];
                cb('citations', result['num-of-records']);
            }

        });
    
};

O.makeCitationsLayout = function(records) {

    let figures = [];

    return figures;
};

O.renderCitations = function(result) {

    // log.info(result);

    // // the result panel where the results are shown
    // const rp = document.querySelector('#citations div.result');

    // rp.innerHTML = Mustache.render(
    //     O.templates.wholes.citations, 
    //     result,
    //     O.templates.partials
    // );

    // const fc = document.querySelectorAll('figcaption > a');
    // for (let i = 0, j = fc.length; i < j; i++) {
    //     fc[i].addEventListener('click', O.toggleFigcaption);
    // }

    // // first, turn off any visible blocks
    // const tn = document.getElementsByClassName('toggled-none');
    // for (let i = 0, j = tn.length; i < j; i++) {
    //     tn[i].style.visibility = 'hidden';
    //     tn[i].style.display = 'none';
    // }

    // // now turn on the resultPanel
    // const d = rp.style.display;
    // rp.style.display = d === 'none' ? 'block' : 'none';

    // // toggle the visibility of the block
    // const v = rp.style.visibility;
    // rp.style.visibility = v === 'hidden' ? 'visible' : 'hidden';

};