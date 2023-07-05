import { $, $$ } from './utils.js';
import { globals } from './globals.js';
import { 
    //addListenersToFigcaptions, 
    addListenersToFigDetails,
    addListenersToFigureTypes, 
    addListenersToPagerLinks 
} from './listeners.js';

const makeTreatment = ({ figureSize, rec }) => {
    let zenodoRec = '';
    let zenodoLink = '';

    if (rec.zenodoRec) {
        zenodoRec = `<a class="transition-050">Zenodo ID: ${rec.zenodoRec}</a>`;
        zenodoLink = `<a href="${globals.zenodoUri}/${rec.zenodoRec}" target="_blank">more on Zenodo</a><br>`;
    }

    const figcaptionClass = figureSize === 250 
        ? 'visible' 
        : 'noblock';

    const figureClass = `figure-${figureSize} ` + (rec.treatmentId 
        ? 'tb' 
        : '');

    return `<figure class="${figureClass}">
    <p class="articleTitle">${rec.articleTitle}</p>
    <p class="treatmentDOI">${rec.treatmentDOI}</p>
    <p class="articleAuthor">${rec.articleAuthor}</p>
    <figcaption class="${figcaptionClass}">
        ${zenodoRec}
        <div>
            <b class="figTitle">${rec.title}</b><br>
            ${zenodoLink}
            <a href="${globals.tbUri}/${rec.treatmentId}" target="_blank">more on TreatmentBank</a>
        </div>
    </figcaption>
</figure>`
}

const makeImage = ({ figureSize, rec }) => {
    const img = `<img src="img/bug.gif" width="${rec.figureSize}" data-src="${rec.uri}" class="lazyload" data-recid="${rec.treatmentId}" onerror="this.onerror=null; setTimeout(() => { this.src='${rec.uri}' }, 1000);">`;

    const zenodoLink = rec.zenodoRec
        ? `Zenodo ID: <a href="${globals.zenodoUri}/${rec.zenodoRec}" target="_blank">more on Zenodo</a>`
        : '';

    //let treatmentReveal = '';
    let treatmentLink = '';

    if (rec.treatmentId) {
        //treatmentReveal = `<div class="treatmentId reveal" data-reveal="${rec.treatmentId}">T</div>`;
        treatmentLink = `<a href="${globals.tbUri}/${rec.treatmentId}" target="_blank">more on TreatmentBank</a>`;
    }

    let content = '';

    if (treatmentLink) {
        content = `<a href="${globals.tbUri}/${rec.treatmentId}" target="_blank">${img}</a>`;
    }
    else if (zenodoLink) {
        content = `<a href="${globals.zenodoUri}/${rec.zenodoRec}" target="_blank">${img}</a>`;
    }

    const figcaptionClass = figureSize === 250 
        ? 'visible' 
        : 'noblock';

    const figureClass = `figure-${figureSize} ` + (rec.treatmentId 
        ? 'tb' 
        : '');

    const lenTitle = 30;
    const titleAbbrev = rec.treatmentTitle.length > lenTitle
        ? `${rec.treatmentTitle.substring(0, lenTitle)}…`
        : rec.treatmentTitle;

    return `<figure class="${figureClass}">
    <div class="switches">
        <div class="close"></div>
    </div>
    ${content}
    <figcaption class="${figcaptionClass}">
        <details>
            <summary class="figTitle" data-title="${rec.treatmentTitle}">${titleAbbrev}</summary>
            <p>${rec.captionText}</p>
            ${treatmentLink}<br>
            ${zenodoLink}
        </details>
    </figcaption>
</figure>`
}

const makeFigure = ({ resource, figureSize, rec }) => {
    const obj = { figureSize, rec };
    return resource === 'images'
        ? makeImage(obj)
        : makeTreatment(obj);
}

const renderPage = ({ figureSize, figures, qs, count, termFreq, prev, next, cacheHit }) => {
    log.info(`- renderPage()
    - figureSize: ${figureSize}px
    - figures: ${figures.length} figures
    - qs: ${qs}
    - count: ${count}
    - prev: ${prev}
    - next: ${next}`);

    $('#grid-images').classList.add(`columns-${figureSize}`);

    renderFigures(figures, qs, prev, next);
    renderSearchCriteria(qs, count, cacheHit);
    $('#throbber').classList.add('nothrob');

    if (termFreq) {
        renderTermFreq(termFreq);
    }
    
}

const renderFigures = (figures, qs, prev, next) => {
    log.info('- renderFigures()');

    if (figures.length) {
        $('#grid-images').innerHTML = figures.join('');
        renderPager(qs, prev, next);
        //addListenersToFigcaptions();
        addListenersToFigDetails();
        addListenersToFigureTypes();
    }
    // else {
    //     $('#grid-images').innerHTML = '<p class="nada">sorry, no images found</p>';
    // }
}

const renderTreatments = () => {

}

const renderPager = (qs, prev, next) => {
    log.info('- renderPager()');
    log.info(`  - qs: ${qs}`);
    log.info(`  - prev: ${prev}`);
    log.info(`  - next: ${next}`);

    const sp = new URLSearchParams(qs);
    sp.delete('page');

    $('#pager').innerHTML = `<a href="?${sp.toString()}&page=${prev}">prev</a> <a href="?${sp.toString()}&page=${next}">next</a>`;
    $('#pager').classList.add('filled');
    addListenersToPagerLinks();
}

const renderSearchCriteria = (qs, count, cacheHit) => {
    log.info('- renderSearchCriteria(qs, count)');
    log.info(`  - qs: ${qs}`);
    log.info(`  - count: ${count}`);

    const searchParams = new URLSearchParams(qs);
    const resource = searchParams.get('resource');
    const page = searchParams.get('page');
    const size = searchParams.get('size');
    const from = ((page - 1) * size) + 1;
    let to = parseInt(from) + parseInt(size - 1);
    if (to > count) {
        to = count;
    }

    if (!count) {
        count = 'sorry, no';
    }

    const criteria = [];
    globals.notInSearchCriteria.forEach(p => searchParams.delete(p));
    
    searchParams.forEach((v, k) => {
        let c;

        const match = v.match(/(?<operator>\w+)\((?<term>[\w\s]+)\)/);

        if (match) {
            const { operator, term } = match.groups;
            c = `<span class="crit-key">${k}</span> ${operator.replace(/_/,' ')} <span class="crit-val">${term}</span>`;
        }
        else {
            if (k === 'q') {
                c = `<span class="crit-key">${v}</span> is in the text`;
            }
            else {
                c = `<span class="crit-key">${k}</span> is <span class="crit-val">${v}</span>`;
            }
        }

        criteria.push(c);
    })

    let str;
    const len = criteria.length;

    if (len === 1) {
        str = criteria[0];
    }
    else if (len === 2) {
        str = `${criteria[0]} and ${criteria[1]}`;
    }
    else {
        str = `${criteria.slice(0, len - 2).join(', ')}, and ${criteria[len - 1]}`;
    }

    /*
    **1107** records found where **hake** is in the text… **19** unique images from the first **30** records are shown below.
    **1107** records found where **hake** is in the text… **27** unique images from records **31–60**  are shown below.
    */
    //… <span class="crit-count">${globals.results.figures.length}</span> unique images from records ${from}–${to} are shown below
    //const aboutCount = count - (count % 5);
    str = `<span class="crit-count">${count}</span> ${resource} found where ${str}`;
    str += cacheHit ? '<span aria-label="cache hit" data-pop="top" data-pop-no-shadow data-pop-arrow>💥</span>' : '';
    
    $('#search-criteria').innerHTML = str;
}

const renderTermFreq = (termFreq) => {
    let width = 960;

    // How to find the width of a div using vanilla JavaScript?
    // https://stackoverflow.com/a/4787561/183692
    const ctx = document.getElementById('graphdiv');
    const gwidth = ctx.offsetWidth;

    if (gwidth < 960) {
        width = gwidth;
    } 

    const height = 150;
    const series = {
        x: "journal year",
        y1: "total",
        y2: "with images"
    }
    
    //termFreqWithDygraphs(ctx, width, height, series, termFreq);
    termFreqWithChartjs(ctx, width, height, series, termFreq);
}

const termFreqWithDygraphs = (ctx, width, height, series, termFreq) => {
    const dygraphOpts = {
        width,
        height,
        logscale: true,
        labels: Object.values(series)
    };

    const data = termFreq.map(e => [ e.journalYear, e.total, e.withImages ]);
    
    Dygraph.onDOMready(function onDOMready() {
        const g = new Dygraph(
            ctx,
            data,
            dygraphOpts
        );
    });
}

const termFreqWithChartjs = (ctx, width, height, series, termFreq) => {
    const canvas = document.createElement('canvas');
    canvas.id = "termFreq";
    canvas.width = width;
    canvas.height = height;
    ctx.appendChild(canvas);

    const config = {
        type: 'line',
        data: {
            labels: termFreq.map(e => e.journalYear),
            datasets: [
                {
                    label: series.y1,
                    data: termFreq.map(e => e.total),
                    borderWidth: 1
                },
                {
                    label: series.y2,
                    data: termFreq.map(e => e.withImages),
                    borderWidth: 1
                }
            ]
        },
        options: {
            interaction: {
                intersect: false,
                mode: 'x',
            },
            animation: false,
            responsive: true,
            scales: {
                x: {
                    display: true,
                },
                y: {
                    display: true,
                    type: 'logarithmic',
                    grid: {
                        // color: (context) => {
                        //     if (context.tick.value > 0) {
                        //         return Utils.CHART_COLORS.green;
                        //     } 
                        //     else if (context.tick.value < 0) {
                        //         return Utils.CHART_COLORS.red;
                        //     }
                
                        //     return '#000000';
                        // },
                        borderColor: 'grey',
                        tickColor: 'grey'
                    },
                    min: 1,
                    //suggestedMax: 10000,
                    ticks: {
                        callback: function (value, index, values) {
                            if (value === 1000000) return "1M";
                            if (value === 100000) return "100K";
                            if (value === 10000) return "10K";
                            if (value === 1000) return "1K";
                            if (value === 100) return "100";
                            if (value === 10) return "10";
                            if (value === 1) return "1";
                            return null;
                        },

                        // forces step size to be 50 units
                        stepSize: 50
                   }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'chartArea'
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    };

    // const actions = [
    //     {
    //       name: 'Mode: index',
    //       handler(chart) {
    //         chart.options.interaction.axis = 'xy';
    //         chart.options.interaction.mode = 'index';
    //         chart.update();
    //       }
    //     },
    //     {
    //       name: 'Mode: dataset',
    //       handler(chart) {
    //         chart.options.interaction.axis = 'xy';
    //         chart.options.interaction.mode = 'dataset';
    //         chart.update();
    //       }
    //     },
    //     {
    //       name: 'Mode: point',
    //       handler(chart) {
    //         chart.options.interaction.axis = 'xy';
    //         chart.options.interaction.mode = 'point';
    //         chart.update();
    //       }
    //     },
    //     {
    //       name: 'Mode: nearest, axis: xy',
    //       handler(chart) {
    //         chart.options.interaction.axis = 'xy';
    //         chart.options.interaction.mode = 'nearest';
    //         chart.update();
    //       }
    //     },
    //     {
    //       name: 'Mode: nearest, axis: x',
    //       handler(chart) {
    //         chart.options.interaction.axis = 'x';
    //         chart.options.interaction.mode = 'nearest';
    //         chart.update();
    //       }
    //     },
    //     {
    //       name: 'Mode: nearest, axis: y',
    //       handler(chart) {
    //         chart.options.interaction.axis = 'y';
    //         chart.options.interaction.mode = 'nearest';
    //         chart.update();
    //       }
    //     },
    //     {
    //       name: 'Mode: x',
    //       handler(chart) {
    //         chart.options.interaction.mode = 'x';
    //         chart.update();
    //       }
    //     },
    //     {
    //       name: 'Mode: y',
    //       handler(chart) {
    //         chart.options.interaction.mode = 'y';
    //         chart.update();
    //       }
    //     },
    //     {
    //       name: 'Toggle Intersect',
    //       handler(chart) {
    //         chart.options.interaction.intersect = !chart.options.interaction.intersect;
    //         chart.update();
    //       }
    //     },
    // ];

    new Chart(canvas, config);
}

export {
    makeFigure,
    renderPage
}