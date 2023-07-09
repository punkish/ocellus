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

const renderPage = (resultsObj) => {
    const { 
        figureSize, figures, qs, count, term, 
        termFreq, prev, next, cacheHit 
    } = resultsObj;

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
        renderTermFreq(term, termFreq);
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

const renderTermFreq = (term, termFreq) => {
    let width = 960;

    // How to find the width of a div using vanilla JavaScript?
    // https://stackoverflow.com/a/4787561/183692
    const ctx = document.getElementById('graphdiv');
    const gwidth = ctx.offsetWidth;

    if (gwidth < 960) {
        width = gwidth;
    } 

    const height = 200;
    const series = {
        x: "journal year",
        y1: "total",
        y2: "with images"
    }
    
    //termFreqWithDygraphs(ctx, width, height, series, term, termFreq);
    termFreqWithChartjs(ctx, width, height, series, term, termFreq);
}

const termFreqWithDygraphs = (ctx, width, height, series, term, termFreq) => {
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

let termFreqChart;

const termFreqWithChartjs = (ctx, width, height, series, term, termFreq) => {
    const colors = {
        red: 'rgba(255, 0, 0, 0.6)',
        lightRed: 'rgba(255, 0, 0, 0.1)',
        blue: 'rgba(0, 0, 255, 0.6)',
        lightBlue: 'rgba(0, 0, 255, 0.1)',
        black: 'rgba(0, 0, 0, 0.4)'
    }
    
    // series "total"
    const total = {
        label: series.y1,
        data: termFreq.map(e => e.total),
        borderColor: colors.red,
        borderWidth: 1,
        backgroundColor: colors.lightRed,
        pointStyle: 'circle',
        pointRadius: 3,
        pointBorderColor: 'red'
    };

    const withImages = {
        label: series.y2,
        data: termFreq.map(e => e.withImages),
        borderColor: colors.blue,
        borderWidth: 1,
        backgroundColor: colors.lightBlue,
        pointStyle: 'circle',
        pointRadius: 3,
        pointBorderColor: 'blue'
    };

    const pluginLegendBackground = {
        id: 'legendBackground',
        beforeDraw({legend}){
            // avoid useless drawing of the legend before the rectangle is drawn
            this._draw = legend.draw;
            legend.draw = ()=>null;
        },
        beforeUpdate({legend}){
            legend.topChanged = false;
        },
        afterDraw({legend}, args, opts){
            const {
                options: {labels: {padding}},
                legendHitBoxes,
                ctx
            } = legend;

            let {top, bottom, left, right} = legendHitBoxes.reduce(
                ({top, bottom, left, right}, {top: t, height: h, left: l, width: w})=>
                    ({
                        top: Math.min(top, t),
                        bottom: Math.max(bottom, t+h),
                        left: Math.min(left, l),
                        right: Math.max(right, l+w)
                    }), {top: 1/0, bottom: 0, left: 1/0, right: 0});

            if (top < bottom && left < right) {
                top -= padding.top ?? padding;
                bottom += padding.bottom ?? padding;
                left -= padding.left ?? padding;
                right += padding.right ?? padding;
    
                const borderWidth = opts.borderWidth ?? 0;
    
                let deltaX = 0, deltaY = 0;

                if (left - borderWidth <= 0) {
                    deltaX = -left + borderWidth;
                }
                else if (right + borderWidth >= legend.chart.width) {
                    deltaX = legend.chart.width - (right + borderWidth);
                }

                if (top - borderWidth < 0) {
                    deltaY = - top + borderWidth;
                }

                if (bottom + borderWidth > legend.chart.height) {
                    deltaY = legend.chart.height - bottom - borderWidth;
                }

                if (deltaX !== 0 || deltaY !== 0) {
                    left += deltaX;
                    right += deltaX;
                    legendHitBoxes.forEach(lb => lb.left += deltaX)
                    legend.left += deltaX;
                }

                if (deltaX !== 0 || deltaY !== 0) {
                    top += deltaY;
                    bottom += deltaY;

                    if (!legend.topChanged) {
                        legend.top += deltaY;
                        legend.topChanged = true;
                    }
                }

                left -= Math.floor(borderWidth/2);
                right += Math.floor(borderWidth/2);
                top -= Math.floor(borderWidth/2);
                bottom += Math.floor(borderWidth/2);
    
                ctx.save();
                ctx.fillStyle = opts.color ?? 'transparent';
                ctx.lineWidth = opts.borderWidth ?? 0;
                ctx.strokeStyle = opts.borderColor ?? 'black';
                //ctx.fillRect(left, top, right - left, bottom - top);
                //ctx.strokeRect(left, top, right - left, bottom - top);
                ctx.roundRect(left, top, right - left, bottom - top, 5);
                ctx.stroke();
                ctx.fill();
                ctx.restore();
            }

            legend.draw = this._draw;
            delete this._draw;
            legend._draw();
        }
    };

    Chart.register(pluginLegendBackground);

    // const plugin = {
    //     id: 'legendBackground',
    //     beforeDraw: (chart, args, opts) => {
    //         const { chartArea: { width, top, left }, ctx } = chart;
    //         ctx.fillStyle = opts.color || 'white';
    //         ctx.fillRect(left, 0, width, top)
    //     }
    // }

    // for config details, see
    // https://stackoverflow.com/a/76636677/183692
    const config = {
        type: 'line',
        data: {
            labels: termFreq.map(e => e.journalYear),
            datasets: [ total, withImages ]
        },
        //plugins: [ plugin ],
        plugins: [{legendBackground: pluginLegendBackground}],
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
                      
                        // minor ticks not visible
                        tickColor: (data) => data.tick.major ? 'silver' : '',
                      
                        //lineWidth: (data) => data.tick.major ? 2 : 1,
                      
                        color: (data) => data.tick.major ? colors.black : 'silver',
                    },
                    border: {
                      
                        // dash line for grid lines
                        // (unexpected position for this option here)
                        //dash: (data) => data.tick.major ? null : [5, 1]
                    },
                    min: 1,
                  
                    // this eliminates tick values like 15 or 150 and only keeps
                    // those of the form n*10^m with n, m one digit integers
                    // this might not be necessary
                    // afterBuildTicks: (ax) => {
                    //     ax.ticks = ax.ticks.filter(({value}) => {
                    //         const r = value / Math.pow(10, Math.floor(Math.log10(value)+1e-5));
                    //         return Math.abs(r - Math.round(r)) < 1e-5
                    //     })
                    // },
                    afterBuildTicks: function(ax) {

                        // fraction of the previous major tick value,
                        // use 1 to have 8 minor ticks between two major ones,
                        // which is the usual
                        const minorTickStepSize = 0.5;
                        
                        ax.ticks = ax.ticks
                            .filter(({ major }) => major)
                            .flatMap(({ value, major, significand }, i, a) => {
                                if (i === 0) {
                                    return [{ value, major, significand }]
                                } 
                                else {
                                    const { value: prevValue } = a[i - 1];
                                    const h = Math.abs(minorTickStepSize * prevValue);
                                    const aMinor = [];
                                    let minorValue = prevValue + h;

                                    while (minorValue < value) {
                                        aMinor.push({
                                            value: minorValue,
                                            major: false,
                                            significand: minorValue //prevValue
                                        });

                                        minorValue += h;
                                    }

                                    return [
                                        ...aMinor, 
                                        { value, major, significand }
                                    ];
                                }
                            }
                        );
                    },
                    ticks: {
                        callback: function (value, index, ticks) {
                            if (value === 1000000) return "1M";
                            if (value === 100000) return "100K";
                            if (value === 10000) return "10K";
                            if (value === 1000) return "1K";
                            if (value === 100) return "100";
                            if (value === 10) return "10";
                            if (value === 1) return "1";
                            return '';
                        },
                        autoSkip: false
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `occurrence of '${term}' in text by year`,
                },
                legend: {
                    display: true,
                    position: 'chartArea',
                    labels: {
                        usePointStyle: true,
                    },
                    backgroundColor: 'rgba(0, 0, 255, 1)'
                },
                legendBackground:{
					color: 'rgb(255,255,255)',
					borderWidth: 1,
					borderColor: 'black'
				},
                tooltip: {
                    enabled: true
                },
                // legendBackground: {
                //     color: 'blue'
                // }
            }
        }
    };

    let canvas = document.getElementById('termFreq');

    if (canvas) {
        termFreqChart.destroy();
        termFreqChart = new Chart(canvas, config);
    }
    else {
        canvas = document.createElement('canvas');
        canvas.id = "termFreq";
        console.log(`setting canvas dims to ${width} x ${height}`)
        canvas.width = width;
        canvas.height = height;
        ctx.appendChild(canvas);
        termFreqChart = new Chart(canvas, config);
    }
}

export {
    makeFigure,
    renderPage
}