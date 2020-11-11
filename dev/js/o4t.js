const sel_throbber = document.getElementById('throbber')
const sel_gridTarget = document.getElementById('grid-target')
const sel_grid = document.getElementById('grid')
const sel_puff = document.getElementById('puff')
const sel_q = document.getElementById('q')
const sel_brand = document.getElementById('brand')
const sel_refreshCacheMsg = document.getElementById('refreshCacheMsg')
const sel_about = document.getElementById('about')
const sel_go = document.getElementById('go')
const sel_clearQ = document.getElementById('clearQ')
const sel_refreshCache = document.getElementById('refreshCache')
const sel_imgSwap = document.querySelectorAll('input[name=imgSize]')
const sel_modals = document.querySelectorAll('.modal')
const sel_modalOpen = document.querySelectorAll('.modal-open')
const sel_modalClose = document.querySelectorAll('.modal-close')
const sel_palette = document.getElementById('palette')
const sel_pager = document.getElementById('pager')
const resultsPerPage = 30
const results = []
const dominantColors = []

// if t() is run for the first time (by submitting the form)
// then start defaults to 0. On the other hand, if t() runs
// because a bookmark was browsed to and that bookmark 
// contained the `start` parameter to show a specific page
// then the value of `start` is taken from the browser query
async function t(resource, query, start = 1) {
    const u = `${zenodeo3Uri}/${resource.toLowerCase()}?${query}`
    const response = await fetch(u);

    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json()
        const records = json.item.records

        if (resource === 'treatments') {
            then_t(records, start)
        }
        else if (resource === 'figureCitations') {
            return then_f(records)
        }
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status)
    }
}

// if the response from querying treatments is successful,
/// then_t is run to fetch the figures
function then_t(records, start) {

    // Create a promise for all the figure queries for all 
    // the treatments returned from `t()`
    Promise.all(records.map(r => t('figureCitations', `treatmentId=${r.treatmentId}`)))
        .then(images => {
            
            images.forEach(i => {
                if (typeof i !== 'undefined') {
                    if (i.length) {
                        results.push(...i)
                    }
                }
            })

            showPage(start)
            
        })
}

// if a query for a figure is successful,
// then_f is run
function then_f(records) {
    if (records.length) {
        records = records.filter(r => r.httpUri !== '')

        // https://codeburst.io/javascript-array-distinct-5edc93501dc4
        const uniq_records = []
        const map = new Map()

        for (const r of records) {
            if(!map.has(r.httpUri)) {

                // set any value to Map
                map.set(r.httpUri, true)
                uniq_records.push(grid(250, {
                    id: r.httpUri.split('/')[4],
                    httpUri: r.httpUri,
                    captionText: r.captionText
                }))
            }
        }

        return uniq_records
    }
}

/*
function showPage(start) {
    

    //if (result.length > resultsPerPage) {
        const figures = result.slice(start, start + resultsPerPage - 1)
        const str = figures.join('')

        buildPagination({
            total: result.length, 
            resultsPerPage: resultsPerPage, 
            startPager: start,
            pagerLength: 10, 
            separator: '…', 
            htmlElement: sel_pager,
            fn: goToPage
        })
    // }
    // else {
    //     str = result.join('')
    // }

    sel_grid.innerHTML = str
    
    sel_gridTarget.classList.remove("hide")
    sel_gridTarget.classList.add("show")

    const sel_closers = document.querySelectorAll('div.close')
    const sel_figcaptionTogglers = document.querySelectorAll('figcaption > a')

    sel_closers.forEach(c => { 
        c.addEventListener('click', smoke) 
    })

    sel_figcaptionTogglers.forEach(f => { 
        f.addEventListener('click', toggleFigcaption) 
    })
}
*/

// `showPage()` can be called either from the submission of 
// the form or because the user browsed to a bookmark. In this 
// case the value of the input to the function will be a number.
// But `showPage()` can also be called by clicking on a pager 
// link. In this case the input will be an event
function showPage(e) {
    let params
    let start
    let query = sel_q.value

    // if the input is an event then it will have a type
    if (e.type) {

        query = e.target.href

        // params will be lifted from the clicked element
        params = query.split('?')[1].split('&')

        // extract start value from the params
        start = Number(params.filter(p => p.indexOf('start') > -1)[0].split('=')[1])

        // let qarr = []
        // for (let p in params) {
        //     if (p === 'start') {
        //         qarr.push(`start=${start + resultsPerPage}`)
        //     }
        //     else {
        //         qarr.push(`${p}=${params[p]}`)
        //     }
        // }

        // const query = qarr.join('&')
    }

    // check if the input is a number
    else if (Number.isInteger(Number(e))) {

        // params are taken from the querystring 
        // in the browser address field
        //params = location.search ? location.search.split('?')[1].split('&') : []
        
        // const q = sel_q.value
        // const qarr = []
        // if (q.indexOf('=')) {
        //     qarr = q.split('=')
        // }
        // else {

        // }

        // if (window.location.search) {
        //     params = window.location.search.split('?')[1].split('&')
        // }
        // else {
        //     params = []
        // }

        start = Number(e)
        query = sel_q.value + `&start=${start}`
        
        
    }
    
    // slice the figures out of the results array
    const figures = results.slice(start - 1, start - 2 + resultsPerPage)
    const str = figures.join('')

    buildPagination({
        query: query,
        total: results.length, 
        resultsPerPage: resultsPerPage, 
        startPager: start,
        pagerLength: 10, 
        separator: '…', 
        htmlElement: sel_pager,
        fn: showPage
    })

    sel_grid.innerHTML = str
    
    if (sel_gridTarget.classList.contains("hide")) {
        sel_gridTarget.classList.remove("hide")
        sel_gridTarget.classList.add("show")
    }

    const sel_closers = document.querySelectorAll('div.close')
    const sel_figcaptionTogglers = document.querySelectorAll('figcaption > a')

    sel_closers.forEach(c => { 
        c.addEventListener('click', smoke) 
    })

    sel_figcaptionTogglers.forEach(f => { 
        f.addEventListener('click', toggleFigcaption) 
    })
    
    // const new_params = params.filter(p => p.indexOf('start') == -1)
    // new_params.push(`start=${start + 1}`)
    
    history.pushState(results, '', `4t.html?${query}`)
    sel_throbber.classList.add('nothrob')

    if (e.type) {
        e.stopPropagation()
        e.preventDefault()
    }
    
}



function toggleFigcaption(e) {

    const sel_figcaptionDescs = document.querySelectorAll('figcaption div.desc')

    // close all figcaption descs
    sel_figcaptionDescs.forEach(f => {
        f.classList.remove("show")
        f.classList.add("hide")
    })

    const figcaption = e.currentTarget.parentNode
    const desc = figcaption.querySelector('.desc')
    desc.classList.remove("hide")
    desc.classList.add("show")
}

// http://stackoverflow.com/questions/1960473/ddg#14438954
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index
}

function grid(size, r) {
// <source srcset="../img/bug.gif" data-src="/img/i250.jpg" class="lazyload" data-recid="${r.id}" media="(min-width: 1400px)"/>
// <source srcset="https://placehold.it/1200x1200" media="(min-width: 1200px)"/>
// <source srcset="https://placehold.it/800x800" media="(min-width: 800px)"/>
// <source srcset="https://placehold.it/600x600" media="(min-width: 600px)"/>

    const i = `${zenodoUri}/${r.id}/thumb${size}`

    return `<figure class="figure-${size}">
    <div class="switches">
        <div class="close"></div>
    </div>
    <picture>
        <img src="../img/bug.gif" data-src="${i}" class="lazyload" data-recid="${r.id}">
    </picture>
    <figcaption>
        <a class="transition-050">rec ID: ${r.id}</a>
        <div class="desc hide">${r.captionText}. <a href='${zenodeo3Uri}/treatments?' target='_blank'>more</a></div>
    </figcaption>
</figure>`
}

// http://jsfiddle.net/Y7Ek4/22/
let intervalId = 0

function fadeIn(element, speed) { 
    intervalId = setInterval(
        show(element), 
        50
    )
}

function fadeOut(element, speed) { 
    element.style.opacity = 1
    intervalId = setInterval(hide(element), 50)
}

function show(element) { 
    if (opacity < 1) { 
        opacity = opacity + 0.1; 
        element.style.opacity = opacity 
    } else { 
        clearInterval(intervalId); 
    } 
}

function smoke(e) {
    const xOffset = 24
    const yOffset = 24
    
    // show #puff
    sel_puff.style.left = e.pageX - xOffset + 'px'
    sel_puff.style.top = e.pageY - yOffset + 'px'
    sel_puff.style.display = 'inline'
    sel_puff.style.visibility = 'visible'
    sel_puff.style.opacity = 1

    // animate the puff
    animatePoof()

    // hide the figure /////////////////////
    // https://stackoverflow.com/a/29168819
    const t = e.currentTarget.parentNode.parentNode;
    t.style.opacity = 1;

    function hide() {
        let opacity = Number(t.style.opacity)
        
        if (opacity > 0) { 
            opacity = opacity - 0.1
            t.style.opacity = opacity 
        }
        else { 
            clearInterval(intervalId)
            t.style.display = 'none'
        } 
    }

    intervalId = setInterval(hide, 50)
}

function animatePoof() {
    let bgTop = 0
    let frame = 0
    const frames = 6
    const frameSize = 32
    const frameRate = 80

    function animate() {
        if (frame < frames) {
            sel_puff.style.backgroundPosition = "0 "+bgTop+"px"
            bgTop = bgTop - frameSize
            frame++
            setTimeout(animate, frameRate)
        }
    }
    
    animate()
    //setTimeout("sel_puff.style.visibility = 'hidden'", frames * frameRate)
}

// get dominant color
function makePalette() {
    const imgs = document.querySelectorAll('picture img')
    imgs.forEach(i => {
        const colorThief = new ColorThief()
        //const dc = getDominantColor(i)
        //console.log(i.dataset.src)
        const im = new Image()
        im.src = i.dataset.src
        const dc = colorThief.getColor(im)
        console.log(dc)
        dominantColors.push(`<div class="dc" style="background-color: rgb(${dc[0]}, ${dc[1]}, ${dc[2]});"></div>`)
    })

    sel_palette.innerHTML = dominantColors.join('')
}

function getDominantColor(img) {

    const colorThief = new ColorThief()

    // Make sure image is finished loading
    if (img.complete) {
        return colorThief.getColor(img)
    } 
    else {
        img.addEventListener('load', function() {
            return colorThief.getColor(img)
        })
    }

}

function clearQ(e) {
    sel_q.value = ''
    sel_refreshCache.checked = false
    e.stopPropagation()
    e.preventDefault()
}

function go(e) {
    const q = sel_q.value

    if (q === '') {
        sel_q.placeholder = "c'mon, enter something"
        sel_q.classList.add('red-placeholder')
    }
    else {
        sel_q.classList.remove('red-placeholder')
        sel_throbber.classList.remove('nothrob')

        if (q.indexOf('=') > -1) {
            t('treatments', q)
        }
        else {
            t('treatments', `q=${q}`)
        }
    }
    
    e.stopPropagation()
    e.preventDefault()
}

function swapImg(e) {
    const size = e.target.value
    
    const figs = document.querySelectorAll('figure')
    figs.forEach(f => { 
        const i = f.querySelector('img')
        i.src = `/img/i${size}.jpg` 
        f.classList.remove('figure-250')
        f.classList.add('figure-100')
    })
}

function listen() {
    sel_q.addEventListener('focus', function() {
        sel_q.placeholder = 'search for something'
        sel_q.classList.remove('red-placeholder')
    })

    // sel_imgSwap.forEach(i => {
    //     i.addEventListener('click', swapImg)
    // })

    sel_go.addEventListener('click', go)
    sel_clearQ.addEventListener('click', clearQ)
    //sel_refreshCache.addEventListener('click', warnRefreshCache)
    sel_refreshCache.addEventListener('click', toggle)

    sel_modalOpen.forEach(l => { 
        l.addEventListener('click', toggle) 
    })

    sel_modalClose.forEach(l => { 
        l.addEventListener('click', toggle) 
    })

    sel_brand.addEventListener('click', revealBrand)
}

let gridIsVisible = false

function toggle(e) {
    const href = e.target.href.split('/').pop().split('.')[0]

    let target = document.getElementById(`${href}-target`)
    if (href === 'index' && gridIsVisible) {
        target = sel_grid
    }

    if (sel_grid.classList.contains("show")) {
        gridIsVisible = true
        sel_grid.classList.remove("show")
        sel_grid.classList.add("hide")
    }
    
    sel_modals.forEach(m => {
        m.classList.remove("show")
        m.classList.add("hide")
    })

    target.classList.remove("hide")
    target.classList.add("show")

    e.stopPropagation()
    e.preventDefault()
}

function revealBrand(e) {
    sel_brand.innerHTML = '4TREATMENTS'
    flashBrand()
}

function flashBrand() {
    setTimeout(function() { 
        sel_brand.innerHTML = '4T' 
    }, 2000)
}

function prep() {
    const params = new URLSearchParams(window.location.search)
    const start = params.get('start') || 1

    params.delete('start')
    let query

    if (params.has('q')) {
        if ( Array.from(params.entries()).length > 1) {
            query = params.toString()
        }
        else {
            query = params.get('q')
        }
    }
    else {
        query = params.toString()
    }

    return [ query, start ]
}

function init() {
    listen()
    flashBrand()
    const [ query, start ] = prep()

    if (query) {
        sel_q.value = query
        t('treatments', (query.indexOf('=') > -1 ? query : `q=${query}`), start)
    }

}