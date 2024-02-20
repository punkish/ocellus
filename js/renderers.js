import { $, $$ } from './base.js';
import { globals } from './globals.js';
import { toggleAdvSearch } from './listeners.js';
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
    let width = 960;

    // How to find the width of a div using vanilla JavaScript?
    // https://stackoverflow.com/a/4787561/183692
    const ctx = document.getElementById('graphdiv');
    ctx.style.display = 'block';
    const gwidth = ctx.offsetWidth;

    if (gwidth < 960) {
        width = gwidth;
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

// const renderImageCountOld = () => {
//     const width = 100;
//     const ctx = document.getElementById('imageCount');
//     ctx.style.display = 'block';
//     const height = 30;

//     const options = {
//         xAxis: {
//             type: 'category',
//             data: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37]
//         },
//         yAxis: {
//             type: 'value'
//         },
//         series: [
//             {
//                 data: [1,8,21,1918,3996,83023,87532,91405,95521,98697,104278,109451,113853,117348,118401,122365,128386,135694,141606,147832,156049,171272,177425,185661,206291,228110,296174,307545,316031,324115,331649,343763,353149,364335,374693,384149,387051],
//                 type: 'line'
//             }
//         ]
//     };

//     ctx.style.width = `${width}px`;
//     ctx.style.height = `${height}px`;
//     // const myChart = echarts.init(ctx);
//     // myChart.setOption(options); 
//     globals.imageCountChart = echarts.init(ctx);
//     globals.imageCountChart.setOption(options);
// }

// const renderImageCountOlder = () => {
//     const cumImgCount = [1,1918,91405,109451,122365,147832,185661,307545,343763,384149,387051];
//     sparkline.sparkline(document.querySelector('.sparkline'), cumImgCount);
// }

// https://css-tricks.com/how-to-make-charts-with-svg/
const renderImageCount = (resource, imageCount, speciesCount) => {

    const str = (i, className, height, sparkHeight, barWidth, year, count) => {
        return `<g class="${className}" transform="translate(${i * barWidth},0)">
            <rect height="${height}" y="${sparkHeight - height}" width="${barWidth}" onmousemove="showTooltip(evt, '${year}: ${count} ${resource}');" onmouseout="hideTooltip();"></rect>
        </g>`;
    }

    const totalCount = imageCount.total;
    const yearlyCount = imageCount.yearly;

    const barWidth = 3;
    const className = 'bar';
    const numOfRects = yearlyCount.length;
    const sparkWidth = barWidth * numOfRects;
    const sparkHeight = 40;
    const maxNum = Math.max(...yearlyCount);
    const heightRatio = sparkHeight / totalCount;
    //const totalImages = numImg.reduce((partialSum, a) => partialSum + a, 0);

    let html = `<svg id="svgSpark" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="chart" height="${sparkHeight}" width="${sparkWidth}" aria-labelledby="title" role="img">`;

    for (let i = 0; i < numOfRects; i++) {
        const year = yearlyCount[i].year;
        const count = yearlyCount[i].count;
        const height = count * heightRatio;
        html += str(i, className, height, sparkHeight, barWidth, year, count);
    }

    html += '</svg>';
    html += `<span>~${Math.ceil(totalCount / 1000)}K</span> ${resource} extracted from <span>~${Math.ceil(speciesCount / 1000)}K</span> species over the years`;
    
    const svg = document.querySelector('#sparkBox');
    //console.log(html)
    svg.innerHTML = html;
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
            text: `occurrence of '${term}' in text by year`,
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
                formatter: function (value, index) {
                    let val = value;

                    if (value === 1000) {
                        val = '1K';
                    }
                    else if (value === 10000) {
                        val = '10K';
                    }
                    else if (value === 100000) {
                        val = '100K';
                    }
                    else if (value === 1000000) {
                        val = '1M';
                    }
                    else if (value === 10000000) {
                        val = '10M';
                    }

                    return val;
                }
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

export {
    makeFigure,
    renderPage,
    renderImageCount,
    // showTooltip,
    // hideTooltip
}