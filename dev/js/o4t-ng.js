'use strict'

// DOM selectors
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
const sel_count = document.getElementById('count')
const sel_pager = document.getElementById('pager')
const sel_searchResults = document.getElementById('search-results')
const sel_treatmentsPager = document.getElementById('treatments-pager')
const sel_figuresPager = document.getElementById('figures-pager')
// const sel_hideUnhide = document.getElementById('hide-unhide')
const sel_treatmentDetails = document.getElementById('treatmentDetails')
const sel_hiddenFigures = document.getElementById('hidden-figures')

const unhide = () => {
    hidden.forEach(f => {
        f.style.opacity = 1
        f.style.display = 'block'
    })

    hidden.splice(0)
    sel_hiddenFigures.innerHTML = ''
}

//const zenodeoUri = 'http://localhost:8080/dev/4t.html'

// // globals and constants
const RESULTS = {
    countOfTreatments: 0,
    currentBatch: 0,
    pagesOfTreatments: 0,
    _links: {
        self: '',
        prev: '',
        next: ''
    },
    countOfFigures: 0,
    figures: [],
    pagesOfFigures: 0
}

// treatments related defaults
const PAGE = 1
const SIZE = 30

// // figures related defaults
const FIGPAGE = 1
const FIGSIZE = 30

// flag to keep track of the grid's visiblity
let gridIsVisible = false

const updateUrl = ({ queryString, page, size, fp, fs }) => {
    const queryObj = new URLSearchParams(queryString)
        
    queryObj.set('$page', page)
    queryObj.set('$size', size)
    queryObj.sort()

    const qs = queryObj.toString()
    history.pushState({}, '', `4t.html?${decodeURIComponent(qs)}#fp=${fp}&fs=${fs}`)
}

// Grab the appropriate slice (page, size) from the RESULTS
const showPage = function({ queryString, page, size, fp, fs }) {
    
    // slice the figures out of the RESULTS array
    // if page = 1 and size = 30, the slice will be from 0, 29
    // page/fp = 1 -> slice(0, 29)
    // page/fp = 2 -> slice(30, 59)
    // page/fp = 3 -> slice(60, 61)
    size = parseInt(size)

    const from = (fp - 1) * size
    let to = from + size
    if (to >= RESULTS.countOfFigures) to = RESULTS.countOfFigures

    const figures = RESULTS.figures.slice(from, to)
    const str = figures.join('')

    updateUrl({ queryString, page, size, fp, fs })

    sel_grid.innerHTML = str
    
    if (sel_gridTarget.classList.contains("hide")) {
        sel_gridTarget.classList.remove("hide")
        sel_gridTarget.classList.add("show")
    }

    const sel_closers = document.querySelectorAll('div.close')
    sel_closers.forEach(c => { 
        c.addEventListener('click', smoke) 
    })

    const sel_figcaptionTogglers = document.querySelectorAll('figcaption > a')
    sel_figcaptionTogglers.forEach(f => { 
        f.addEventListener('click', toggleFigcaption) 
    })

    const sel_showTreatment = document.querySelectorAll('.showTreatment')
    sel_showTreatment.forEach(t => { 
        t.addEventListener('click', showTreatment) 
    })
    
    sel_throbber.classList.add('nothrob')
}

const toggleFigcaption = function (e) {
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
const onlyUnique = function(value, index, self) { 
    return self.indexOf(value) === index
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

const grid = function(size, r) {
// <source srcset="../img/bug.gif" data-src="/img/i250.jpg" class="lazyload" data-recid="${r.id}" media="(min-width: 1400px)"/>
// <source srcset="https://placehold.it/1200x1200" media="(min-width: 1200px)"/>
// <source srcset="https://placehold.it/800x800" media="(min-width: 800px)"/>
// <source srcset="https://placehold.it/600x600" media="(min-width: 600px)"/>

    const i = `${zenodoUri}/${r.id}/thumb${size}`

    const height = getRandomInt(300)

    return `<figure class="figure-${size}">
    <div class="switches">
        <div class="close"></div>
    </div>
    <picture>
        <img src="../img/bug.gif" data-src="${i}" class="lazyload" data-recid="${r.id}">
    <!-- <img src="../img/bug.gif" data-src="../img/i250.jpg" class="lazyload" data-recid="${r.id}"> -->
    <!-- <div style="width: 250px; height:${height}px;">250px x ${height}px</div> -->
    </picture>
    <figcaption>
        <a class="transition-050">rec ID: ${r.id}</a>
        <div class="desc hide">
            ${r.captionText}. 
            <a class='showTreatment' href='${zenodeo3Uri}/treatments?treatmentId=${r.treatmentId}'>more</a>
        </div>
    </figcaption>
</figure>`
}

const closeLightbox = () => sel_treatmentDetails.classList.add("hidden")

const foo = async function(url) {
    const response = await fetch(url)
    
    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json()
        const r = json.item.records[0]

        const figs = json.item["related-records"].figureCitations.records.map(r => {
            return `<img src ="${zenodoUri}/${r.httpUri.split('/')[4]}/thumb${50}">`
        })
        

        let str = `<h2>${r.treatmentTitle}</h2>`

        str += `<div class="figs">${figs.join(' ')}</div>`

        str += '<div class="cite">'
        if (r.authorityName) str += `${r.authorityName}. `
        if (r.authorityYear) str += `${r.authorityYear}. `
        if (r.articleTitle) str += `${r.articleTitle}. `
        if (r.journalTitle) str += `${r.journalTitle}`
        if (r.journalYear) str += `${r.journalYear}, `
        if (r.journalVolume) str += `vol. ${r.journalVolume}, `
        if (r.journalIssue) str += `${r.journalIssue}, `
        if (r.pages) str += `pp. ${r.pages}`
        str += '</div>'

        if (r.status) str += `<div class="status"><b>status:</b> ${r.status}</div>`

        str += '<ul class="classification">'
        if (r.kingdom) str += `<li class="${r.rank === 'kingdom' ? 'rank' : ''}">${r.kingdom}</li>`
        if (r.phylum)  str += `<li class="${r.rank === 'phylum'  ? 'rank' : ''}">${r.phylum}</li>`
        if (r.order)   str += `<li class="${r.rank === 'order'   ? 'rank' : ''}">${r.order}</li>`
        if (r.family)  str += `<li class="${r.rank === 'family'  ? 'rank' : ''}">${r.family}</li>`
        if (r.genus)   str += `<li class="${r.rank === 'genus'   ? 'rank' : ''}">${r.genus}</li>`
        if (r.species) str += `<li class="${r.rank === 'species' ? 'rank' : ''}">${r.species}</li>`
        str += '</ul>'

        sel_treatmentDetails.querySelector('div.text').innerHTML = str
        sel_treatmentDetails.classList.remove("hidden")
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status)
    }
}

const showTreatment = async function(e) {
    const url = e.target.href
    // const mouseX = e.pageX
    // const mouseY = e.pageY

    foo(url)

    e.stopPropagation()
    e.preventDefault()
}

const fillForm = function(queryObj) {
    let page
    if (queryObj.has('$page')) {
        page = queryObj.get('$page')
        queryObj.delete('$page')
    }

    let size
    if (queryObj.has('$size')) {
        size = queryObj.get('$size')
        queryObj.delete('$size')
    }

    if (queryObj.has('q')) {
        if (Array.from(queryObj.entries()).length > 1) {
            sel_q.value = decodeURIComponent(queryObj.toString())
        }
        else {
            sel_q.value = queryObj.get('q')
        }
    }
    else {
        sel_q.value = decodeURIComponent(queryObj.toString())
    }

    // restore `page` and `size`
    queryObj.set('$size', page)
    queryObj.set('$page', size)  
}

// case 3: the user clicked on a link in the paginator
const figPageClick = function(e) {
    const url = new URL(e.currentTarget.href)

    const { queryObj, queryString, page, size, fp, fs } = extractParamsAndHash(url)

    if ((RESULTS.countOfTreatments > 0) && (RESULTS.countOfFigures > 0)) {
        pager({
            total: RESULTS.countOfFigures, 
            subtotal: '',
            queryString: queryString,
            page: page,
            size: size,
            fp: fp,
            fs: fs,
            resource: 'figures',
            subresource: '',
            //htmlElement: sel_resultsFigures
            htmlElement: sel_figuresPager
        })
    }

    showPage({ queryString, page, size, fp, fs })

    e.stopPropagation()
    e.preventDefault()
}

// case 2: the websie is being loaded fresh
// press enter or click [ go ] to run the query
// - fill browser address bar with query
const go = function (e) {
    const q = sel_q.value

    if (q === '') {
        sel_q.placeholder = "c’mon, enter something"
        sel_q.classList.add('red-placeholder')
    }
    else {
        sel_q.classList.remove('red-placeholder')
        sel_throbber.classList.remove('nothrob')

        const qarr = [ q.indexOf('=') > -1 ? q : `q=${q}` ]

        res({ resource: 'treatments', queryString: qarr.join('&'), page: PAGE, size: SIZE, fp: FIGPAGE, fs: FIGSIZE })
    }
    
    e.stopPropagation()
    e.preventDefault()
}

// if res() is run for the first time (by submitting the form)
// then `page` defaults to 1 and `size` to 30. On the other hand, 
/// if res() runs because a bookmark was loaded then that bookmark 
// contains the `page` and `size` parameters
const res = async function({resource, queryString, page, size, fp, fs}) {

    let url = `${zenodeo3Uri}/${resource.toLowerCase()}`
    if (queryString) {
        url += `?${queryString}`
    }
    
    const response = await fetch(url)
    
    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json()
        const records = json.item.records

        if (resource === 'treatments') {

            RESULTS.countOfTreatments = json.item.count
            
            RESULTS._links.self = json.item._links.self.href
            RESULTS._links.prev = json.item._links.prev.href
            RESULTS._links.next = json.item._links.next.href

            const obj = { records, queryString, page, size, fp, fs }
            then_t(obj)
        }
        else if (resource === 'figureCitations') {
            
            //{ records, resource, queryString, page, size, fp, fs }
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
//const then_t = function(records, queryStr, page, size, figpage, figsize) {
const then_t = function({ records, queryString, page, size, fp, fs }) {

    // Create a promise for all the figure queries 
    // for all the treatments returned from `t()`
    Promise.all(records.map(r => res({
        resource: 'figureCitations', 
        queryString: `treatmentId=${r.treatmentId}`, 
        page: page, 
        size: size, 
        fp: fp, 
        fs: fs 
    })))
        .then(images => {

            images.forEach(i => {
                if (typeof i !== 'undefined') {
                    if (i.length) {
                        RESULTS.figures.push(...i)
                    }
                }
            })

            RESULTS.countOfFigures = RESULTS.figures.length

            pager({
                total: RESULTS.countOfTreatments, 
                subtotal: RESULTS.countOfFigures,
                queryString: queryString,
                page: page,
                size: size,
                fp: fp,
                fs: fs,
                resource: 'treatments',
                subresource: 'figures',
                // htmlElement: sel_resultsTreatments
                htmlElement: sel_treatmentsPager
            })
        
            if ((RESULTS.countOfTreatments > 0) && (RESULTS.countOfFigures > 0)) {
                pager({
                    total: RESULTS.countOfFigures, 
                    subtotal: '',
                    queryString: queryString,
                    page: page,
                    size: size,
                    fp: fp,
                    fs: fs,
                    resource: 'figures',
                    subresource: '',
                    //htmlElement: sel_resultsFigures
                    htmlElement: sel_figuresPager
                })
            }

            showPage({ queryString, page, size, fp, fs })
        })
}

// if a query for a figure is successful,
// then_f runs
const then_f = function(records) {
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
                    captionText: r.captionText,
                    treatmentId: r.treatmentId
                }))
            }

        }

        return uniq_records
    }
}

const init = function () {

    // add all the event listeners to various DOM elements
    listen()

    // flash the brand
    flashBrand()

    // check the browser bar if it has a query, and
    // act appropriately
    loadPage()
}

const smokeWorks = function (e) {

    // http://jsfiddle.net/Y7Ek4/22/
    //let intervalId = 0

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

const hidden = []

const smoke = function (e) {

    // http://jsfiddle.net/Y7Ek4/22/
    let intervalId = 0

    const animatePoof = function() {
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

    const hide = function() {
        let opacity = Number(t.style.opacity)
        
        if (opacity > 0) { 
            opacity = opacity - 0.1
            t.style.opacity = opacity 
        }
        else { 
            clearInterval(intervalId)
            t.style.display = 'none'
        }

        // if (sel_hideUnhide.classList.contains("hide")) {
        //     show(sel_hideUnhide)
        // }
    }

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
    const t = e.currentTarget.parentNode.parentNode
    hidden.push(t)
    sel_hiddenFigures.innerHTML = ` (${hidden.length} hidden) <a id="hide-unhide" href="#unhide">unhide</a>`
    document.getElementById('hide-unhide').addEventListener('click', unhide)
    t.style.opacity = 1

    intervalId = setInterval(hide, 50)
}

const revealBrand = function (e) {
    sel_brand.innerHTML = '4TREATMENTS'
    flashBrand()
}

const clearQ = function (e) {
    sel_q.value = ''
    sel_refreshCache.checked = false
    e.stopPropagation()
    e.preventDefault()
}

const flashBrand = function () {
    setTimeout(function() { sel_brand.innerHTML = '4T' }, 2000)
}

const show = (element) => {
    element.classList.remove("hide")
    element.classList.add("show")
}

const hide = (element) => {
    element.classList.remove("show")
    element.classList.add("hide")
}

const toggle = function(e) {
    
    const t = e.target
    const source = t.href ? t.href.split('/').pop().split('.')[0] : t.id

    let target = document.getElementById(`${source}-target`)
    if (source === 'index' && gridIsVisible) {
        target = sel_gridTarget
    }

    if (target.classList.contains("modal")) {

        // hide all the modals
        sel_modals.forEach(m => hide(m))

        // toggle the target
        if (target.classList.contains("hide")) {

            // if grid is visible, hide it
            if (sel_gridTarget.classList.contains("show")) {
                gridIsVisible = true
                hide(sel_gridTarget)
            }

            // show the target
            show(target)

        }
        else if (target.classList.contains("show")) {

            // hide the target
            hide(target)

            // if grid is hidden, show it
            if (gridIsVisible = true) {
                if (sel_gridTarget.classList.contains("hide")) {
                    gridIsVisible = false
                    show(sel_gridTarget)
                }
            }

        }
    }

    // target is refreshCacheMsg, not a modal
    else {

        const element = document.getElementById(source)
        //console.log(target.classList)

        // toggle the target
        if (element.classList.contains("unchecked")) {
            element.classList.remove("unchecked")
            element.classList.add("checked")
            //console.log('checking')
            sel_refreshCache.checked = true
            show(target)
        }
        else {
            element.classList.remove("checked")
            element.classList.add("unchecked")
            //console.log('unchecking')
            sel_refreshCache.checked = false
            hide(target)
        }
    }

    e.stopPropagation()
    e.preventDefault()
}

const listen = function () {
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

    // sel_hideUnhide.addEventListener('click', unhide)
}

const extractParamsAndHash = (url) => {
    const queryObj = url.searchParams

    // if the query has $page and $size, save them
    const page = queryObj.has('$page') ? queryObj.get('$page') : PAGE
    const size = queryObj.has('$size') ? queryObj.get('$size') : SIZE

    queryObj.delete('$page')
    queryObj.delete('$size')

    const queryString = decodeURIComponent(queryObj.toString())

    // if the query doesn't have hash params
    // set them to default values
    const hash = url.hash
        .slice(1)
        .split('&')
        .reduce((map, obj) => { 
            const a = obj.split('='); 
            map[a[0]] = a[1]; 
            return map; 
        }, {})

    const fp = hash.fp ? hash.fp : FIGPAGE
    const fs = hash.fs ? hash.fs : FIGSIZE

    return { queryObj, queryString, page, size, fp, fs }
}

// case 1: loading the page from a link
const loadPage = function () {
    const url = new URL(location)

    // fill form and set default page and size if not already set
    const { queryObj, queryString, page, size, fp, fs } = extractParamsAndHash(url)
    fillForm(queryObj)
    
    // document.getElementById('q').value = decodeURIComponent(q)
    res({resource: 'treatments', queryString: queryString, page: page, size: size, fp: fp, fs: fs})
}