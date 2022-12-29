const $ = (selector) => {
    return document.querySelector(selector)
}

const $$ = (selector) => {
    return document.querySelectorAll(selector)
}

// Javascript: Ordinal suffix for numbers
// https://stackoverflow.com/a/15810761
const nth = function(n) {
    if ( isNaN(n) || n % 1 ) return n;

    const s = n % 100;

    if ( s > 3 && s < 21 ) return n + 'th';

    switch( s % 10 ) {
        case 1:  return n + 'st';
        case 2:  return n + 'nd';
        case 3:  return n + 'rd';
        default: return n + 'th';
    }
}

const niceNumbers = (n) => {
    const nice = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    return n < 10 ? nice[n - 1].toLowerCase() : n
}

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
    // sel_hiddenFigures.innerHTML = ` (${hidden.length} hidden) <a id="hide-unhide" href="#unhide">unhide</a>`
    // document.getElementById('hide-unhide').addEventListener('click', unhide)
    t.style.opacity = 1

    intervalId = setInterval(hide, 50)
}

export { $, $$, nth, niceNumbers, smoke }