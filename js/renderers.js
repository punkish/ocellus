import { $, $$ } from './base.js';
import { globals } from './globals.js';
import { toggleAdvSearch, showDashboard, toggleModal, lightUpTheBox } from './listeners.js';
import { qs2form } from './main.js';

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
        //zenodoRec = `<a class="transition-050">Zenodo ID: ${rec.zenodoRec}</a>`;
        zenodoLink = `<a href="${globals.zenodoUri}/${rec.zenodoRec}" target="_blank" title="more on Zenodo" alt="more on Zenodo"><img class="zenodoLink" src="img/zenodo-gradient-round.svg" width="50"></a>`;
    }

    const figcaptionClass = figureSize === 250 
        ? 'visible' 
        : 'noblock';

    const figureClass = `figure-${figureSize} ` + (rec.treatmentId 
        ? 'tb' 
        : '');

    const treatmentDOI = rec.treatmentDOI
        ? `<a href="https://dx.doi.org/${rec.treatmentDOI}">${rec.treatmentDOI}</a>`
        : '';

    let citation = '';

    if (rec.articleTitle) {
        citation += `<span class="articleTitle">${rec.articleTitle}</span>`;
    }

    if (rec.articleAuthor) {
        citation += ` by <span class="articleAuthor">${rec.articleAuthor}</span>`;
    }

    if (rec.journalTitle) {
        citation += ` in <span class="journalTitle">${rec.journalTitle}</span>`;
    }

    if (treatmentDOI) {
        citation += `. ${treatmentDOI}`;
    }

    return `<figure class="${figureClass}">
    <p class="treatmentTitle">${rec.treatmentTitle}</p>
    <p class="citation">${citation}</p>
    <figcaption class="${figcaptionClass}">
        <!-- ${zenodoRec} -->
        <div>
            ${zenodoLink} <a href="${globals.tbUri}/${rec.treatmentId}" target="_blank" title="more on TreatmentBank" alt="more on TreatmentBank"><img class="tbLink" src="img/treatmentBankLogo.png" width="100"></a>
        </div>
    </figcaption>
</figure>`
}

const makeImage = ({ figureSize, rec }) => {
    const zenodoLink = rec.zenodoRec
        ? `<img src="img/zenodo-gradient-35.png" width="35" height="14"> <a href="${globals.zenodoUri}/${rec.zenodoRec}" target="_blank">more on Zenodo</a>`
        : '';

    //let treatmentReveal = '';
    //treatmentReveal = `<div class="treatmentId reveal" data-reveal="${rec.treatmentId}">T</div>`;
    const treatmentLink = `<img src="img/treatmentBankLogo.png" width="35" height="14"> <a href="${globals.tbUri}/${rec.treatmentId}" target="_blank">more on TreatmentBank</a>`;

    const figcaptionClass = figureSize === 250 
        ? 'visible' 
        : 'noblock';

    const figureClass = `figure-${figureSize} ` + (rec.treatmentId ? 'tb' : '');

    // <div class="switches"><div class="close"></div></div>
    const onerrorCb = `this.onerror=null; setTimeout(() => { this.src='${rec.uri}' }, 1000);`;

    return `<figure class="${figureClass}">
    <a class="zen" href="${rec.fullImage}">
        <img src="img/bug.gif" width="${rec.figureSize}" data-src="${rec.uri}" 
            class="lazyload" data-recid="${rec.treatmentId}" 
            onerror="${onerrorCb}">
    </a>
    <figcaption class="${figcaptionClass}">
        <details>
            <summary class="figTitle" data-title="${rec.treatmentTitle}">
                ${rec.treatmentTitle}
            </summary>
            <p>${rec.captionText}</p>
            ${treatmentLink}<br>
            ${zenodoLink}
        </details>
    </figcaption>
</figure>`;
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
        termFreq, prev, next, stored, ttl, cacheHit 
    } = resultsObj;

    log.info(`- renderPage()
    - figureSize: ${figureSize}px
    - figures: ${figures.length} figures
    - qs: ${qs}
    - count: ${count}
    - prev: ${prev}
    - next: ${next}`);

    $('#grid-images').classList.add(`columns-${figureSize}`);

    renderSearchCriteria(qs, count, stored, ttl, cacheHit);
    renderFigures(figures, qs, prev, next);
    $('#throbber').classList.add('nothrob');

    // draw the termFreq chart *only* if values exists
    if (termFreq && termFreq.length) {
        renderTermFreq(term, termFreq);
    }
    else if (globals.termFreqChart) {
        globals.termFreqChart.dispose();
        document.getElementById('graphdiv').style.display = 'none';
    }

    // hide advanced search panel
    const advSearchIsActive = $('input[name=searchtype]').checked;
    
    if (advSearchIsActive) {
        $('input[name=searchtype]').checked = false;
        toggleAdvSearch();
        qs2form(qs);
    }

    lightUpTheBox();

}

const renderFigures = (figures, qs, prev, next) => {
    log.info('- renderFigures()');

    if (figures.length) {
        $('#grid-images').innerHTML = figures.join('');
        renderPager(qs, prev, next);
        addListenersToFigDetails();
        addListenersToFigureTypes();
    }
    else {

        // if nothing is found, remove previous search results 
        $('#grid-images').innerHTML = '';
    }
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

const renderSearchCriteria = (qs, count, stored, ttl, cacheHit) => {
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
    globals.params.notValidSearchCriteria.forEach(p => searchParams.delete(p));
    
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

    let cacheHitMsg = '';

    if (cacheHit) {
        const storedDate = new Date(stored);
        const expires = new Date(stored + ttl) - new Date();
        cacheHitMsg = `cache hit, stored ${formatDate(storedDate)}, expires in ${formatTime(expires)}`;
        str += `<span aria-label="${cacheHitMsg}" data-html="true" data-pop="top" data-pop-no-shadow data-pop-arrow data-pop-multiline>💥</span>`;
    }
    
    $('#search-criteria').innerHTML = str;
}

// Javascript show milliseconds as days:hours:mins without seconds
// https://stackoverflow.com/a/8528531/183692
const formatTime = (t) => {
    const cd = 24 * 60 * 60 * 1000;
    const ch = 60 * 60 * 1000;
    let d = Math.floor(t / cd);
    let h = Math.floor( (t - d * cd) / ch);
    let m = Math.round( (t - d * cd - h * ch) / 60000);
    const pad = (n) => n < 10 ? '0' + n : n;

    if (m === 60){
        h++;
        m = 0;
    }

    if (h === 24) {
        d++;
        h = 0;
    }

    return `${d} days ${pad(h)} hours ${pad(m)} mins`;
}

const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = d.getMonth();
    const dd = d.getDate();
    const hh = d.getHours();
    const mn = d.getMinutes();
    const ss = d.getSeconds();

    return `${dd} ${globals.months[mm]}, ${yyyy} ${hh}:${mn}:${ss}`;
}

const renderTermFreq = (term, termFreq) => {

    const ctx = document.getElementById('graphdiv');
    ctx.style.display = 'block';

    let width = 960;

    // How to find the width of a div using vanilla JavaScript?
    // https://stackoverflow.com/a/4787561/183692
    if (ctx.offsetWidth < width) {
        width = ctx.offsetWidth
    }
    
    const height = 200;
    const series = {
        x: "journal year",
        y1: "all",
        y2: "with images"
    }
    
    //termFreqWithDygraphs(ctx, width, height, series, term, termFreq);
    //termFreqWithChartjs(ctx, width, height, series, term, termFreq);
    termFreqWithEcharts(ctx, width, height, series, term, termFreq);
}

// https://css-tricks.com/how-to-make-charts-with-svg/
const renderYearlyCounts = (resource, yearlyCounts, speciesCount) => {

    // const svgFrag = (i, className, height, sparkHeight, barWidth, year, count) => {
    //     return `<g class="${className}" transform="translate(${i * barWidth},0)">
    //         <rect height="${height}" y="${sparkHeight - height}" width="${barWidth}" onmousemove="showTooltip(evt, '${year}: ${count} ${resource}');" onmouseout="hideTooltip();"></rect>
    //     </g>`;
    // }

    const totalCount = yearlyCounts.total;
    const yearlyCount = yearlyCounts.yearly;
    const speciesTotal = speciesCount.total;

    // const barWidth = 3;
    // const className = 'bar';
    // const numOfRects = yearlyCount.length;
    // const sparkWidth = barWidth * numOfRects;
    // const sparkHeight = 40;
    // const maxNum = Math.max(...yearlyCount);
    // const heightRatio = sparkHeight / totalCount;
    // //const totalImages = numImg.reduce((partialSum, a) => partialSum + a, 0);

    // let spark = `<svg id="svgSpark" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="chart" height="${sparkHeight}" width="${sparkWidth}" aria-labelledby="title" role="img">`;

    // for (let i = 0; i < numOfRects; i++) {
    //     const year = yearlyCount[i].year;
    //     const count = yearlyCount[i].count;
    //     const height = count * heightRatio;
    //     spark += svgFrag(i, className, height, sparkHeight, barWidth, year, count);
    // }

    // spark += '</svg>';
    const html = `<a href="#dashboard" class="modalToggle"><span>~${Math.ceil(totalCount / 1000)}K</span> ${resource} from <span>~${Math.ceil(speciesTotal / 1000)}K</span> species extracted over the years &Rarr;</a>`;
    
    const svg = document.querySelector('#sparkBox');
    svg.innerHTML = html;
    
    const dashboardLink = svg.querySelector('a');
    showDashboard();
    dashboardLink.addEventListener('click', toggleModal);
}
// const termFreqWithDygraphs = (ctx, width, height, series, term, termFreq) => {
//     const dygraphOpts = {
//         width,
//         height,
//         logscale: true,
//         labels: Object.values(series)
//     };

//     const data = termFreq.map(e => [ e.journalYear, e.total, e.withImages ]);
    
//     Dygraph.onDOMready(function onDOMready() {
//         const g = new Dygraph(
//             ctx,
//             data,
//             dygraphOpts
//         );
//     });
// }



// const pluginLegendBackground = {
// 	id: 'legendBackground',
// 	beforeDraw({legend}) {
// 		// avoid useless drawing of the legend before the rectangle is drawn
// 		this._draw = legend.draw;
// 		legend.draw = ()=>null;
// 	},

// 	beforeUpdate({legend}) {
// 		legend.topChanged = false;
// 	},

//     //beforeUpdate: ({legend}) => legend.topChanged = false,

// 	afterDraw({legend}, args, opts) {
// 		const {
// 			options: {labels: {padding}},
// 			legendHitBoxes,
// 			ctx
// 		} = legend;

// 		let {top, bottom, left, right} = legendHitBoxes.reduce(
// 			({top, bottom, left, right}, {top: t, height: h, left: l, width: w})=>
// 				({
// 					top: Math.min(top, t),
// 					bottom: Math.max(bottom, t+h),
// 					left: Math.min(left, l),
// 					right: Math.max(right, l+w)
// 				}), {top: 1/0, bottom: 0, left: 1/0, right: 0})

// 		if(top < bottom && left < right) {
// 			top -= padding.top ?? padding;
// 			bottom += padding.bottom ?? padding;
// 			left -= padding.left ?? padding;
// 			right += padding.right ?? padding;

// 			const borderWidth = opts.borderWidth ?? 0;
// 			let deltaX = 0, deltaY = 0;

// 			if (left - borderWidth <= 0) {
// 				deltaX = -left + borderWidth;
// 			}
// 			else if (right + borderWidth >= legend.chart.width) {
// 				deltaX = legend.chart.width - (right + borderWidth);
// 			}

// 			if (top - borderWidth < 0) {
// 				deltaY = - top + borderWidth;
// 			}

// 			if (bottom + borderWidth > legend.chart.height) {
// 				deltaY = legend.chart.height - bottom - borderWidth;
// 			}

// 			if (deltaX !== 0 || deltaY !== 0) {
// 				left += deltaX;
// 				right += deltaX;
// 				legendHitBoxes.forEach(lb => lb.left += deltaX)
// 				legend.left += deltaX;
// 			}

// 			if (deltaX !== 0 || deltaY !== 0) {
// 				top += deltaY;
// 				bottom += deltaY;

// 				if(!legend.topChanged){
// 					legend.top += deltaY;
// 					legend.topChanged = true;
// 				}
// 			}

// 			left -= Math.floor(borderWidth/2);
// 			right += Math.floor(borderWidth/2);
// 			top -= Math.floor(borderWidth/2);
// 			bottom += Math.floor(borderWidth/2);

// 			ctx.save();
// 			ctx.fillStyle = opts.color ?? 'transparent';
// 			ctx.lineWidth = opts.borderWidth ?? 0;
// 			ctx.strokeStyle = opts.borderColor ?? 'black';
// 			// ctx.fillRect(left, top, right - left, bottom - top);
// 			// ctx.strokeRect(left, top, right - left, bottom - top);
//             ctx.beginPath();
//             ctx.roundRect(left, top, right - left, bottom - top, 5);
//             ctx.stroke();
//             ctx.fill();
// 			ctx.restore();
// 		}
        
// 		legend.draw = this._draw;
// 		delete this._draw;
// 		legend._draw();
// 	}
// };

//Chart.register(pluginLegendBackground);

// const termFreqWithChartjs = (ctx, width, height, series, term, termFreq) => {
//     const colors = {
//         red: 'rgba(255, 0, 0, 0.6)',
//         lightRed: 'rgba(255, 0, 0, 0.1)',
//         blue: 'rgba(0, 0, 255, 0.6)',
//         lightBlue: 'rgba(0, 0, 255, 0.1)',
//         black: 'rgba(0, 0, 0, 0.4)'
//     }
    
//     // series "total"
//     const total = {
//         label: series.y1,
//         data: termFreq.map(e => e.total),
//         borderColor: colors.red,
//         borderWidth: 1,
//         backgroundColor: colors.lightRed,
//         pointStyle: 'circle',
//         pointRadius: 3,
//         pointBorderColor: 'red'
//     };

//     const withImages = {
//         label: series.y2,
//         data: termFreq.map(e => e.withImages),
//         borderColor: colors.blue,
//         borderWidth: 1,
//         backgroundColor: colors.lightBlue,
//         pointStyle: 'circle',
//         pointRadius: 3,
//         pointBorderColor: 'blue'
//     };

//     // for config details, see
//     // https://stackoverflow.com/a/76636677/183692
//     const config = {
//         type: 'line',
//         data: {
//             labels: termFreq.map(e => e.journalYear),
//             datasets: [ total, withImages ]
//         },
//         plugins: [{legendBackground: pluginLegendBackground}],
//         options: {
//             interaction: {
//                 intersect: false,
//                 mode: 'x',
//             },
//             animation: false,
//             responsive: true,
//             scales: {
//                 x: {
//                     display: true,
//                 },
//                 y: {
//                     display: true,
//                     type: 'logarithmic',
//                     grid: {
                      
//                         // minor ticks not visible
//                         tickColor: (data) => data.tick.major ? 'silver' : '',
                      
//                         //lineWidth: (data) => data.tick.major ? 2 : 1,
                      
//                         color: (data) => data.tick.major ? colors.black : 'silver',
//                     },
//                     border: {
                      
//                         // dash line for grid lines
//                         // (unexpected position for this option here)
//                         //dash: (data) => data.tick.major ? null : [5, 1]
//                     },
//                     min: 1,
                  
//                     // this eliminates tick values like 15 or 150 and only keeps
//                     // those of the form n*10^m with n, m one digit integers
//                     // this might not be necessary
//                     // afterBuildTicks: (ax) => {
//                     //     ax.ticks = ax.ticks.filter(({value}) => {
//                     //         const r = value / Math.pow(10, Math.floor(Math.log10(value)+1e-5));
//                     //         return Math.abs(r - Math.round(r)) < 1e-5
//                     //     })
//                     // },
//                     afterBuildTicks: function(ax) {

//                         // fraction of the previous major tick value,
//                         // use 1 to have 8 minor ticks between two major ones,
//                         // which is the usual
//                         const minorTickSteps = 0.5;
                        
//                         ax.ticks = ax.ticks
//                             .filter(({ major }) => major)
//                             .flatMap(({ value, major, significand }, i, a) => {
//                                 if (i === 0) {
//                                     return [{ value, major, significand }]
//                                 } 
//                                 else {
//                                     const { value: prevValue } = a[i - 1];
//                                     const h = Math.abs(minorTickSteps * prevValue);
//                                     const aMinor = [];
//                                     let minorValue = prevValue + h;

//                                     while (minorValue < value) {
//                                         aMinor.push({
//                                             value: minorValue,
//                                             major: false,
//                                             significand: minorValue //prevValue
//                                         });

//                                         minorValue += h;
//                                     }

//                                     return [
//                                         ...aMinor, 
//                                         { value, major, significand }
//                                     ];
//                                 }
//                             }
//                         );
//                     },
//                     ticks: {
//                         callback: function (value, index, ticks) {
//                             if (value === 1000000) return "1M";
//                             if (value === 100000) return "100K";
//                             if (value === 10000) return "10K";
//                             if (value === 1000) return "1K";
//                             if (value === 100) return "100";
//                             if (value === 10) return "10";
//                             if (value === 1) return "1";
//                             return '';
//                         },
//                         autoSkip: true
//                     }
//                 }
//             },
//             plugins: {
//                 title: {
//                     display: true,
//                     text: `occurrence of '${term}' in text by year`,
//                 },
//                 legend: {
//                     display: true,
//                     position: 'chartArea',
//                     labels: {
//                         usePointStyle: true,
//                     },
//                     backgroundColor: 'rgba(0, 0, 255, 1)'
//                 },
//                 legendBackground:{
// 					color: 'rgba(255,255,255)',
// 					borderWidth: 1,
// 					borderColor: 'black'
// 				},
//                 tooltip: {
//                     enabled: true,
//                     backgroundColor: 'rgba(0, 0, 0, 0.8)'
//                 }
//             }
//         }
//     };

//     let canvas = document.getElementById('termFreq');

//     if (canvas) {
//         termFreqChart.destroy();
//         termFreqChart = new Chart(canvas, config);
//     }
//     else {
//         canvas = document.createElement('canvas');
//         canvas.id = "termFreq";
//         canvas.width = width;
//         canvas.height = height;
//         ctx.appendChild(canvas);
//         termFreqChart = new Chart(canvas, config);
//     }
// }

const termFreqWithEcharts = (ctx, width, height, series, term, termFreq) => {
    const options = {
        title: {
            text: `occurrence of “${term}” in the text by year`,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: '<div class="leg">year {b}<hr>{a0}: {c0}<br/>{a1}: {c1}</div>'
        },
        legend: {
            left: 55,
            top: 60,
            orient: 'vertical',
            borderWidth: 1,
            borderRadius: 5,
            borderColor: '#444',
            backgroundColor: '#fff'
        },
        xAxis: {
            type: 'category',
            //name: series.x,
            splitLine: { show: false },
            data: termFreq.map(e => e.journalYear)
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        yAxis: {
            type: 'log',
            //name: 'y',
            minorSplitLine: {
                show: true
            },
            axisLabel: {
                formatter: xAxisFormatter
            }
        },
        series: [
            {
                name: series.y1,
                type: 'line',
                data: termFreq.map(e => e.total == 0 ? null : e.total),
                color: '#f00',
                lineStyle: {
                    color: '#f00',
                    width: 1
                }
            },
            {
                name: series.y2,
                type: 'line',
                data: termFreq.map(e => e.withImages == 0 ? null : e.withImages),
                color: '#00f',
                lineStyle: {
                    color: '#00f',
                    width: 1
                }
            }
        ]
    };

    ctx.style.width = `${width}px`;
    ctx.style.height = `${height}px`;
    // const myChart = echarts.init(ctx);
    // myChart.setOption(options); 
    globals.termFreqChart = echarts.init(ctx);
    globals.termFreqChart.setOption(options);
}

/*
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  close                         DASHBOARD                                  │
│  ──────                                                                   │
│ ┌─── charts ────────────────────────────────────────────────────────────┐ │
│ │ ┌─── chart────────────┐┌─────────────────────┐┌─────────────────────┐ │ │
│ │ │┌── viz ────────────┐││┌───────────────────┐││┌───────────────────┐│ │ │
│ │ ││                   ││││                   ││││                   ││ │ │
│ │ ││                   ││││                   ││││                   ││ │ │
│ │ ││                   ││││                   ││││                   ││ │ │
│ │ │└───────────────────┘││└───────────────────┘││└───────────────────┘│ │ │
│ │ │┌── caption ────────┐││┌───────────────────┐││┌───────────────────┐│ │ │
│ │ ││                   ││││                   ││││                   ││ │ │
│ │ │└───────────────────┘││└───────────────────┘││└───────────────────┘│ │ │
│ │ └─────────────────────┘└─────────────────────┘└─────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
*/
function renderYearlyCountsDb(data, resource) {
    const charts = document.getElementById('charts');
    let chartsWidth = 960;

    // How to find the width of a div using vanilla JavaScript?
    // https://stackoverflow.com/a/4787561/183692
    const main = document.getElementsByTagName('main');;
    if (main.offsetWidth < chartsWidth) {
        chartsWidth = main.offsetWidth
    }

    const chartsPadding = 5;

    const chart = document.createElement('div');
    charts.appendChild(chart);
    chart.classList.add('chart');

    const viz = document.createElement('div');
    // viz.style.display = 'block';

    let vizWidth = Math.floor((chartsWidth - (2 * chartsPadding)) / 3);
    
    if (vizWidth > 255) {
        vizWidth = 255;
    }

    viz.style.width = `${vizWidth}px`;
    viz.style.height = '200px';
    viz.classList.add('viz');
    
    chart.appendChild(viz);

    const options = getBarOptions(data, resource);
    globals[`${resource}_chart`] = echarts.init(viz);
    globals[`${resource}_chart`].setOption(options);

    const caption = document.createElement('div');
    chart.appendChild(caption);
    caption.classList.add('caption');

    //const r = resource.toLowerCase();
    let str = '';
    
    if (resource === 'Treatments') {
        const treatmentsTotal = data.treatmentsCount.total;
        const imagesTotal = data.imagesCount.total;
        const materialCitationsTotal = data.materialCitationsCount.total;
        str += `<span>${treatmentsTotal}</span> treatments, <span>${materialCitationsTotal}</span> material citations and <span>${imagesTotal}</span> images`;
    }
    else {
        const resourceTotal = data.total;
        str += `<span>${resourceTotal}</span> ${resource}`;
    }

    caption.innerHTML = str;
}

function xAxisFormatter (value, index) {
    if (value < 1000) {
        return value;
    }

    let val;

    if (value >= 1000 && value < 10000) {
        val = `${value / 1000}K`;
    }
    else if (value >= 10000 && value < 100000) {
        val = `${value / 10000}K`;
    }
    else if (value >= 100000 && value < 1000000) {
        val = `${value / 100000}K`;
    }
    else if (value >= 1000000 && value < 10000000) {
        val = `${value / 1000000}M`;
    }

    return val;
}

function getBarOptions(data, resource) {
    
    const series = [];
    const years = []
    
    if (resource === 'Treatments') {
        series.push({
            name: 'Treatments',
            type: 'bar',
            emphasis: {
                focus: 'series'
            },
            data: data.treatmentsCount.yearly.map(d => d.count)
        });

        series.push({
            name: 'Images',
            type: 'bar',
            emphasis: {
                focus: 'series'
            },
            data: data.imagesCount.yearly.map(d => d.count)
        });

        series.push({
            name: 'Material Citations',
            type: 'bar',
            emphasis: {
                focus: 'series'
            },
            data: data.materialCitationsCount.yearly.map(d => d.count)
        });

        data.treatmentsCount.yearly.forEach(d => years.push(d.year));
    }
    else {
        series.push({
            name: resource,
            type: 'bar',
            emphasis: {
                focus: 'series'
            },
            data: data.yearly.map(d => d.count)
        });

        data.yearly.forEach(d => years.push(d.year))
    }

    const options = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: years
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    formatter: xAxisFormatter
                }
            }
        ],
        series
    };

    if (resource === 'Treatments') {
        options.legend = {
            left: 55,
            top: 60,
            orient: 'vertical',
            borderWidth: 1,
            borderRadius: 5,
            borderColor: '#444',
            backgroundColor: '#fff'
        };
    }

    return options;
}

function renderDashboard(obj) {
    const {
        treatmentsCount,
        imagesCount, 
        materialCitationsCount,
        speciesCount, 
        journalsCount
    } = obj;

    treatmentsCount.yearly.forEach(t => {
        const tyear = t.year;

        const indImg = imagesCount.yearly.findIndex(i => i.year === tyear);
        
        if (indImg === -1) {
            imagesCount.yearly.push({
                year: tyear,
                num_of_records: 0
            })
        }

        const indMtc = materialCitationsCount.yearly.findIndex(i => i.year === tyear);
        
        if (indMtc === -1) {
            materialCitationsCount.yearly.push({
                year: tyear,
                num_of_records: 0
            })
        }
    });
    
    imagesCount.yearly.sort((a, b) => {
        return a.year - b.year
    });

    materialCitationsCount.yearly.sort((a, b) => {
        return a.year - b.year
    });

    renderYearlyCountsDb({ 
        treatmentsCount, 
        imagesCount,
        materialCitationsCount
    }, 'Treatments');

    renderYearlyCountsDb(speciesCount, 'Species');
    //renderYearlyCountsDb(articlesCount, 'Articles');
    renderYearlyCountsDb(journalsCount, 'Journals');
}

export {
    makeFigure,
    renderPage,
    renderYearlyCounts,
    renderDashboard
    // showTooltip,
    // hideTooltip
}