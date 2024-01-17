/* generated: Wed Jan 17 2024 18:59:36 GMT+0100 (GMT+01:00) */
const e=e=>document.querySelector(e),t=e=>document.querySelectorAll(e),a={server:"localhost"===window.location.hostname?"http://localhost:3010/v3":"https://test.zenodeo.org/v3",cache:{zenodoImages:0,zenodeoImages:0,zenodeoTreatments:0},figureSize:{normal:250,small:100,tiny:50},results:{totalCount:0,figures:[],page:1,size:30},resources:["treatments","citations","images"],pseudoResources:["about","ip","contact","privacy"],params:{notValidQ:["resource","page","size","grid","refreshCache","cols"],validImages:["httpUri","caption","captionText","q","treatmentId","treatmentTitle","articleTitle","treatmentDOI","articleDOI","zenodoDep","authorityName","status","journalTitle","journalYear","kingdom","phylum","class","family","order","genus","species","publicationDate","checkinTime","latitude","longitude","geolocation","isOnLand","validGeo","eco_name","biome"],validTreatments:["treatmentId","treatmentTitle","treatmentDOI","zenodoDep","articleTitle","articleDOI","publicationDate","journalYear","authorityName","status","checkinTime","validGeo","q","latitude","longitude","geolocation","eco_name","biome","isOnLand","journalTitle","kingdom","phylum","class","family","order","genus","species"],validCommon:["refreshCache","page","size","cols"],notValidSearchCriteria:["resource","communities","communitiesChooser","refreshCache","view","size","page","reset","submit","source","grid"],images:["treatmentId","treatmentTitle","zenodoDep","treatmentDOI","articleTitle","articleAuthor","httpUri","caption"],treatments:["treatmentId","treatmentTitle","zenodoDep","treatmentDOI","articleTitle","articleAuthor","journalTitle"]},hiddenClasses:["hidden","noblock"],closedFigcaptionHeight:"30px",zenodoUri:"https://zenodo.org/records",tbUri:"https://tb.plazi.org/GgServer/html",H3ColorRamp:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],treatmentIcon:{iconUrl:"/img/treatment.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]},treatmentIconHighlighted:{iconUrl:"/img/treatment-highlighted.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]},months:["January","February","March","April","May","June","July","August","September","October","November","December"],termFreqChart:null},r=function({selector:e,helpText:t,facets:a,cb:r}){const n=a.map((e=>e.key)),s=r;let o;const i=function({element:e,attribs:t,container:a}){const r=document.createElement(e);for(let[e,a]of Object.entries(t))"innerText"===e||"innerHTML"===e?r[e]=a:r.setAttribute(e,a);return a.appendChild(r),r},l=function(){const e=i({element:"div",attribs:{class:"fs-param-empty"},container:o});i({element:"div",attribs:{class:"fs-key fs-off"},container:e});const t=i({element:"input",attribs:{class:"query fs-key-input",placeholder:"choose a key…"},container:e});i({element:"div",attribs:{class:"fs-val fs-off"},container:e});const a=i({element:"input",attribs:{class:"query fs-val-input fs-off",placeholder:"choose a value…"},container:e}),r=i({element:"button",attribs:{class:"fs-cancel fs-off",type:"reset",innerHTML:"&#8855;"},container:e});t.addEventListener("keydown",c),a.addEventListener("keydown",c),r.addEventListener("click",u),d({type:"key",selector:t,values:n}),t.focus()},c=function(e){const t=(e=e||window.event).which||e.keyCode;let a=e.target;const r=a.parentElement,n=r.children[2],s=r.children[3],o=r.children[4];if(13==t)return""!==s.value&&(r.className="fs-param-filled",n.innerText=s.value,n.className="fs-val fs-on",s.className="fs-off",o.className="fs-cancel fs-on",l()),e.preventDefault(),e.stopPropagation(),!1;if((8==t||46==t)&&""===a.value){const e=`div#${fsDiv.id} div.fs-param-filled`,t=document.querySelectorAll(e),a=t[t.length-1];if(a)"fs-param-filled"===a.className?a.className="fs-param-filled fs-hilite":(a.className="fs-param-filled fs-hilite")&&a.parentElement.removeChild(a);else{const e=`div#${fsDiv.id} div.fs-param-empty`,t=document.querySelectorAll(e),a=t[t.length-1];a.parentElement.removeChild(a)}}},u=function(e){const t=this.parentElement;t.parentElement.removeChild(t)},d=function({type:e,selector:t,values:r}){new autoComplete({selector:t,source:async function(e,t){let a=[];if("function"==typeof r)a=r();else if("object"==typeof r&&r.url){const t=await fetch(`${r.url}${e}*`);if(!t.ok)throw Error("HTTP-Error: "+t.status);a=await r.cb(t)}else Array.isArray(r)&&(a=r);if(a.length){const r=[];for(let t=0;t<a.length;t++)~a[t].toLowerCase().indexOf(e)&&r.push(a[t]);t(r)}},minChars:Array.isArray(r)?0:3,delay:150,onSelect:function(t,r,s){const o=this.selector,i=o.parentElement;if("key"===e){const e=i.children[0];e.innerText=o.value,e.className="fs-key fs-on",o.className="fs-off";const t=a.filter((e=>e.key===r))[0];t.noDuplicates&&n.splice(n.indexOf(r),1);const s=i.children[3];s.className="fs-val-input fs-on",s.placeholder=t.prompt,d({type:"val",selector:s,values:t.values}),s.focus()}else if("val"===e){const e=i.children[2];r&&(e.innerText=o.value,e.className="fs-val fs-on"),o.className="fs-off",i.className="fs-param-filled",i.children[4].className="fs-cancel fs-on",l()}}})},m=function(e){const t=o.childNodes;let r={},n=0;const s=t.length;for(;n<s;n++){const e=t[n].children,s=e[1].value;if(s){const t=e[3].value.replace(/\n$/,""),n=a.filter((e=>e.key===s))[0].actualKey;if(n&&t)if(n in r)if("string"==typeof r[n]){const e=r[n];r[n]=[e,t]}else r[n].push(t);else r[n]=t}}e(r)};!function(e,t){const a=i({element:"div",attribs:{id:"fs-widget"},container:e});o=i({element:"div",attribs:{id:"fs",class:"fs"},container:a});const r=i({element:"div",attribs:{class:"switch resource regular pill green","aria-label":"toggle resource","data-pop":"right","data-pop-no-shadow":!0,"data-pop-arrow":!0},container:o});i({element:"input",attribs:{type:"radio",id:"switchResource-3",name:"resource",value:"images",class:"query",autocomplete:"off"},container:r}),i({element:"label",attribs:{for:"switchResource-3"},container:r}),i({element:"input",attribs:{type:"radio",id:"switchResource-4",name:"resource",value:"treatments",class:"query",autocomplete:"off"},container:r}),i({element:"label",attribs:{for:"switchResource-4"},container:r}),i({element:"button",attribs:{id:"fs-go",type:"submit",class:"fs-button-primary",innerText:"go"},container:a}).addEventListener("click",(function(e){e.preventDefault(),e.stopPropagation(),m(s)})),l()}(e)},n=({resource:e,figureSize:t,rec:r})=>{const n={figureSize:t,rec:r};return"images"===e?(({figureSize:e,rec:t})=>{const r=`<img src="img/bug.gif" width="${t.figureSize}" data-src="${t.uri}" class="lazyload" data-recid="${t.treatmentId}" onerror="this.onerror=null; setTimeout(() => { this.src='${t.uri}' }, 1000);">`,n=t.zenodoRec?`Zenodo ID: <a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank">more on Zenodo</a>`:"";let s="";t.treatmentId&&(s=`<a href="${a.tbUri}/${t.treatmentId}" target="_blank">more on TreatmentBank</a>`);let o="";s?o=`<a href="${a.tbUri}/${t.treatmentId}" target="_blank">${r}</a>`:n&&(o=`<a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank">${r}</a>`);const i=250===e?"visible":"noblock",l=`figure-${e} `+(t.treatmentId?"tb":""),c=t.treatmentTitle.length>30?`${t.treatmentTitle.substring(0,30)}…`:t.treatmentTitle;return`<figure class="${l}">\n    <div class="switches">\n        <div class="close"></div>\n    </div>\n    ${o}\n    <figcaption class="${i}">\n        <details>\n            <summary class="figTitle" data-title="${t.treatmentTitle}">${c}</summary>\n            <p>${t.captionText}</p>\n            ${s}<br>\n            ${n}\n        </details>\n    </figcaption>\n</figure>`})(n):(({figureSize:e,rec:t})=>{let r="";t.zenodoRec&&(r=`<a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank" title="more on Zenodo" alt="more on Zenodo"><img class="zenodoLink" src="img/zenodo-gradient-round.svg" width="50"></a>`);const n=250===e?"visible":"noblock",s=`figure-${e} `+(t.treatmentId?"tb":""),o=t.treatmentDOI?`<a href="https://dx.doi.org/${t.treatmentDOI}">${t.treatmentDOI}</a>`:"";let i="";return t.articleTitle&&(i+=`<span class="articleTitle">${t.articleTitle}</span>`),t.articleAuthor&&(i+=` by <span class="articleAuthor">${t.articleAuthor}</span>`),t.journalTitle&&(i+=` in <span class="journalTitle">${t.journalTitle}</span>`),o&&(i+=`. ${o}`),`<figure class="${s}">\n    <p class="treatmentTitle">${t.treatmentTitle}</p>\n    <p class="citation">${i}</p>\n    <figcaption class="${n}">\n        \x3c!--  --\x3e\n        <div>\n            ${r} <a href="${a.tbUri}/${t.treatmentId}" target="_blank" title="more on TreatmentBank" alt="more on TreatmentBank"><img class="tbLink" src="img/treatmentBankLogo.png" width="100"></a>\n        </div>\n    </figcaption>\n</figure>`})(n)},s=(t,a,r,n)=>{log.info("- renderFigures()"),t.length?(e("#grid-images").innerHTML=t.join(""),o(a,r,n),D(),I()):e("#grid-images").innerHTML=""},o=(t,a,r)=>{log.info("- renderPager()"),log.info(`  - qs: ${t}`),log.info(`  - prev: ${a}`),log.info(`  - next: ${r}`);const n=new URLSearchParams(t);n.delete("page"),e("#pager").innerHTML=`<a href="?${n.toString()}&page=${a}">prev</a> <a href="?${n.toString()}&page=${r}">next</a>`,e("#pager").classList.add("filled"),E()},i=(t,r,n,s,o)=>{log.info("- renderSearchCriteria(qs, count)"),log.info(`  - qs: ${t}`),log.info(`  - count: ${r}`);const i=new URLSearchParams(t),u=i.get("resource");i.get("page"),i.get("size"),r||(r="sorry, no");const d=[];let m;a.params.notValidSearchCriteria.forEach((e=>i.delete(e))),i.forEach(((e,t)=>{let a;const r=e.match(/(?<operator>\w+)\((?<term>[\w\s]+)\)/);if(r){const{operator:e,term:n}=r.groups;a=`<span class="crit-key">${t}</span> ${e.replace(/_/," ")} <span class="crit-val">${n}</span>`}else a="q"===t?`<span class="crit-key">${e}</span> is in the text`:`<span class="crit-key">${t}</span> is <span class="crit-val">${e}</span>`;d.push(a)}));const p=d.length;m=1===p?d[0]:2===p?`${d[0]} and ${d[1]}`:`${d.slice(0,p-2).join(", ")}, and ${d[p-1]}`,m=`<span class="crit-count">${r}</span> ${u} found where ${m}`;let h="";if(o){const e=new Date(n),t=new Date(n+s)-new Date;h=`cache hit, stored ${c(e)}, expires in ${l(t)}`,m+=`<span aria-label="${h}" data-html="true" data-pop="top" data-pop-no-shadow data-pop-arrow data-pop-multiline>💥</span>`}e("#search-criteria").innerHTML=m},l=e=>{const t=864e5,a=36e5;let r=Math.floor(e/t),n=Math.floor((e-r*t)/a),s=Math.round((e-r*t-n*a)/6e4);const o=e=>e<10?"0"+e:e;return 60===s&&(n++,s=0),24===n&&(r++,n=0),`${r} days ${o(n)} hours ${o(s)} mins`},c=e=>{const t=e.getFullYear(),r=e.getMonth(),n=e.getDate(),s=e.getHours(),o=e.getMinutes(),i=e.getSeconds();return`${n} ${a.months[r]}, ${t} ${s}:${o}:${i}`},u=(e,t)=>{let a=960;const r=document.getElementById("graphdiv");r.style.display="block";const n=r.offsetWidth;n<960&&(a=n);d(r,a,200,{x:"journal year",y1:"all",y2:"with images"},e,t)},d=(e,t,r,n,s,o)=>{const i={title:{text:`occurence of '${s}' in text by year`,left:"center"},tooltip:{trigger:"axis",formatter:'<div class="leg">year {b}<hr>{a0}: {c0}<br/>{a1}: {c1}</div>'},legend:{left:55,top:60,orient:"vertical",borderWidth:1,borderRadius:5,borderColor:"#444",backgroundColor:"#fff"},xAxis:{type:"category",splitLine:{show:!1},data:o.map((e=>e.journalYear))},grid:{left:"3%",right:"4%",bottom:"3%",containLabel:!0},yAxis:{type:"log",minorSplitLine:{show:!0},axisLabel:{formatter:function(e,t){let a=e;return 1e3===e?a="1K":1e4===e?a="10K":1e5===e?a="100K":1e6===e?a="1M":1e7===e&&(a="10M"),a}}},series:[{name:n.y1,type:"line",data:o.map((e=>0==e.total?null:e.total)),color:"#f00",lineStyle:{color:"#f00",width:1}},{name:n.y2,type:"line",data:o.map((e=>0==e.withImages?null:e.withImages)),color:"#00f",lineStyle:{color:"#00f",width:1}}]};e.style.width=`${t}px`,e.style.height=`${r}px`,a.termFreqChart=echarts.init(e),a.termFreqChart.setOption(i)},m=async t=>{log.info("- getResource(qs)"),e("#throbber").classList.remove("nothrob");const r=new URLSearchParams(t),o=r.get("page"),l=r.get("size"),c=r.get("grid")||"normal",d=a.figureSize[c],m=r.get("resource");let h;r.delete("resource"),r.has("q")&&(h=r.get("q"));const f="images"===m?a.params.validImages:a.params.validTreatments;f.push(...a.params.validCommon);let g=!0;if(Array.from(r).forEach((([e,t])=>{f.includes(e)?t||(r.set("q",e),r.delete(e),h=e):($(`"${e}" is not a valid param`),g=!1)})),!1===g)return;const y="images"===m?a.params.images.join("&cols="):a.params.treatments.join("&cols=");let v=`${r.toString()}&cols=${y}`;h&&(v+="&termFreq=true");const b=[];b.push(p({resource:m,queryString:v,figureSize:d})),Promise.all(b).then((e=>{const t={resource:m,prev:o>1?o-1:1,next:parseInt(o)+1,size:l,count:0,recs:[]};return e.forEach((e=>{void 0!==e&&(t.recs.push(...e.recs),t.count+=e.count,t.termFreq=e.termFreq,t.cacheHit=e.cacheHit,t.stored=e.stored,t.ttl=e.ttl)})),t})).then((r=>{const o=r.recs.map((e=>n({resource:m,figureSize:d,rec:e}))),l={figureSize:d,figures:o,qs:t,count:r.count,prev:r.prev,next:r.next,stored:r.stored,ttl:r.ttl,cacheHit:r.cacheHit};r.termFreq&&(l.termFreq=r.termFreq,l.term=h),(t=>{const{figureSize:r,figures:n,qs:o,count:l,term:c,termFreq:d,prev:m,next:p,stored:h,ttl:f,cacheHit:g}=t;log.info(`- renderPage()\n    - figureSize: ${r}px\n    - figures: ${n.length} figures\n    - qs: ${o}\n    - count: ${l}\n    - prev: ${m}\n    - next: ${p}`),e("#grid-images").classList.add(`columns-${r}`),i(o,l,h,f,g),s(n,o,m,p),e("#throbber").classList.add("nothrob"),d&&d.length?u(c,d):a.termFreqChart&&(a.termFreqChart.dispose(),document.getElementById("graphdiv").style.display="none")})(l)}))},p=async({resource:e,queryString:t,figureSize:r})=>{log.info(`- getResults({ resource, queryString, figureSize })\n    - resource: ${e}\n    - queryString: ${t},\n    - figureSize: ${r}`);const n=`${a.server}/${e}?${t}`,s=await fetch(n);if(s.ok){const t=await s.json(),n=t.item.result.records,o={resource:e,count:0,recs:[],termFreq:t.item.result.termFreq,prev:"",next:"",stored:t.stored,ttl:t.ttl,cacheHit:t.cacheHit||!1};if(n)return o.count=o.count+t.item.result.count,n.forEach((t=>{const n={};if("images"===e){n.treatmentId=t.treatmentId,n.treatmentTitle=t.treatmentTitle,n.zenodoRec=t.zenodoDep,n.figureSize=r;const e=t.httpUri.split("/")[4];t.httpUri.indexOf("zenodo")>-1?t.httpUri.indexOf(".svg")>-1?n.uri="/img/kein-preview.png":n.uri=`${a.zenodoUri}/${e}/thumb${r}`:n.uri=t.httpUri,n.captionText=t.captionText,n.treatmentDOI=t.treatmentDOI,n.articleTitle=t.articleTitle,n.articleAuthor=t.articleAuthor}else"treatments"===e&&(n.treatmentId=t.treatmentId,n.treatmentTitle=t.treatmentTitle,n.zenodoRec=t.zenodoDep,n.figureSize=r,n.journalTitle=t.journalTitle,n.treatmentDOI=t.treatmentDOI,n.articleTitle=t.articleTitle,n.articleAuthor=t.articleAuthor);o.recs.push(n)})),o}else alert("HTTP-Error: "+s.status)},h=async t=>{const r=await(async e=>{if(!a.cache[e]){const t=`${a.server}/${e}?cols=`,r=await fetch(t);if(r.ok){const t=(await r.json()).item.result.count;a.cache[e]=t}else alert("HTTP-Error: "+r.status)}return a.cache[e]})(t);e("#help-msg").innerText=`search ${r} ${t}`},f=()=>{log.info("- form2qs()");const e=new URLSearchParams;Array.from(t("form input.query")).filter((e=>e.value)).forEach((t=>{let a=t.name,r=t.value;if("q"===t.name){const n=t.value.replaceAll(/ & /g,"%20%26%20");new URLSearchParams(n).forEach(((t,n)=>{if(""===t){const e=r.match(/(^10\.[0-9]{4,}.*)/);e&&e[1]?(a="articleDOI",r=e[1]):(a="q",r=n)}else a=n,r=t;e.append(a,r)}))}else"radio"===t.type||"checkbox"===t.type?(t.checked||"true"===t.checked)&&e.append(a,r):e.append(a,r)}));return e.toString()},g=e=>{log.info("- updateUrl(qs)"),history.pushState("",null,`?${e}`)},y=()=>{log.info("- addListeners()"),e("#refreshCache").addEventListener("click",L),e("#ns-go").addEventListener("click",S),e("#q").addEventListener("focus",q),e("#search-help").addEventListener("click",v),e("div.examples").addEventListener("toggle",T,!0),t(".modalToggle").forEach((e=>e.addEventListener("click",x))),t(".reveal").forEach((e=>e.addEventListener("click",z)));t(".example-insert").forEach((e=>e.addEventListener("click",w)));t("input[name=searchType").forEach((e=>e.addEventListener("click",b)));t(".resource input").forEach((e=>e.addEventListener("click",k)))},v=t=>{e(".examples").classList.contains("hidden")?e(".examples").classList.remove("hidden"):e(".examples").classList.add("hidden")},$=t=>{e(".warn").classList.contains("hidden")&&(e(".warn").innerHTML=t,e(".warn").classList.remove("hidden"),e("#throbber").classList.add("nothrob"),setTimeout((()=>{e(".warn").innerHTML="",e(".warn").classList.add("hidden")}),3e3))},b=a=>{e("#fancySearch").classList.toggle("hidden"),e("#fancySearch").classList.toggle("noblock"),e("#normalSearch").classList.toggle("hidden"),e("#normalSearch").classList.toggle("noblock");const r=Array.from(t("input[name=searchType]")).filter((e=>e.checked))[0].value;if(a){if("true"===a.target.dataset.checked){const t=e("input[data-checked=false]");t.dataset.checked=!0,t.checked=!0,a.target.dataset.checked="false",a.target.checked=!1}else{const t=e("input[data-checked=true]");t.dataset.checked=!1,t.checked=!1,a.target.dataset.checked="true",a.target.checked=!0}const n="fs"===r?"#fs":window.location.pathname;history.pushState?history.pushState(null,null,n):location.hash=n;const s=Array.from(t("input[name=resource]")),o=s.filter((e=>e.checked))[0],i=s.filter((e=>!e.checked&&e.value===o.value))[0];o.checked=!1,i.checked=!0}else{e("ns"===r?"#switchSearch-1":"#switchSearch-2").checked=!0}},k=e=>{const a=Array.from(t("input[name=resource]")).filter((e=>e.checked))[0];h(a.value)},T=e=>{if(e.target.open){var a=t("details[open]");Array.prototype.forEach.call(a,(function(t){t!==e.target&&t.removeAttribute("open")}))}},w=a=>{e("#q").value=a.target.textContent,e("#ns-go").classList.add("glowing");t("input[name=source").forEach((e=>{"treatments"===e.value&&(e.checked=!0)})),v(),a.stopPropagation(),a.preventDefault()},L=t=>{e("#refreshCache").toggleAttribute("data-pop-show")},S=t=>{""===e("#q").value?q(t):(e("#q").classList.remove("red-placeholder"),e("#throbber").classList.remove("nothrob"),e("#ns-go").classList.remove("glowing"),(()=>{log.info("submitForm()");const e=f();g(e),m(e)})()),t.stopPropagation(),t.preventDefault()},x=r=>{const n=new URL(r.target.href).hash,s=t(".modal");n.length>0?(s.forEach((e=>{e.classList.add(...a.hiddenClasses)})),e(n).classList.remove(...a.hiddenClasses)):s.forEach((e=>e.classList.add(...a.hiddenClasses)))},q=t=>{e("#q").placeholder="search for something",e("#q").classList.remove("red-placeholder"),t.stopPropagation(),t.preventDefault()},z=e=>{const t=e.target.innerText;e.target.innerText=e.target.dataset.reveal,setTimeout((()=>{e.target.innerHTML=t}),2e3),e.stopPropagation(),e.preventDefault()},D=()=>{const e=t("figcaption > details");for(let t=0,a=e.length;t<a;t++)e[t].addEventListener("toggle",(a=>{const r=a.target.querySelector("summary"),n=r.dataset.title,s=n.length>30?`${n.substring(0,30)}…`:n;e[t].open?r.innerText=n:r.innerText=s}))},E=()=>{log.info("- listeners.addListenersToPagerLinks()")},I=()=>{const e=t("figure .reveal");for(let t=0,a=e.length;t<a;t++)e[t].addEventListener("click",z)},A=r=>{log.info(`- qs2form(qs)\n    - qs: ${r}`);const n=new URLSearchParams(r);n.delete("refreshCache");const s=[];n.forEach(((r,n)=>{if(log.info(`val: ${r}, key: ${n}`),a.params.notValidQ.includes(n))"resource"===n?(log.info(`setting form to query resource ${r}`),Array.from(t("input[name=resource]")).filter((e=>e.value===r))[0].checked="true"):e(`input[name=${n}]`).value=r;else{let e=n;r&&(e="q"===n?decodeURIComponent(r):`${n}=${r}`),s.push(e)}})),e("#q").value=s.join("&")},C="localhost"===window.location.hostname?"INFO":"ERROR";log.level=log[C];const R=()=>{const e=new URL(location),t="#fs"===e.hash?"fs":"ns";if(U(t),"fs"===t&&k(),e.search){(e=>{log.info("loadBookmarkedWebSite(qs)"),log.info(`- qs: ${e}`),y(),A(e),e=f(),m(e)})(e.search.substring(1))}else log.info("loadBlankWebSite()"),y(),h("images")},U=n=>{log.info("initializing fancySearch");const s=e=>async t=>{const a=await t.json(),r=[];return"biome"===e&&(e="biome_synonym"),a.item.result.records?a.item.result.records.forEach((t=>r.push(t[e]))):r.push("nothing found… please try again"),r},o=[{key:"text contains",actualKey:"q",values:"",prompt:"search the full text of treatments",noDuplicates:!0},{key:"title",actualKey:"treatmentTitle",values:"",prompt:"search for treatmentTitles starting with the search term",noDuplicates:!0},{key:"authority",actualKey:"authorityName",values:{url:`${a.server}/treatmentAuthors?treatmentAuthor=`,cb:s("author")},prompt:"type at least 3 letters to choose an author",noDuplicates:!0},{key:"family",actualKey:"family",values:{url:`${a.server}/families?family=`,cb:s("family")},prompt:"type at least 3 letters to choose a family",noDuplicates:!1},{key:"kingdom",actualKey:"kingdom",values:{url:`${a.server}/kingdoms?kingdom=`,cb:s("kingdom")},prompt:"type at least 3 letters to choose a kingdom",noDuplicates:!1},{key:"phylum",actualKey:"phylum",values:{url:`${a.server}/phyla?phylum=`,cb:s("phylum")},prompt:"type at least 3 letters to choose a phylum",noDuplicates:!1},{key:"class",actualKey:"class",values:{url:`${a.server}/classes?class=`,cb:s("class")},prompt:"type at least 3 letters to choose a class",noDuplicates:!1},{key:"genus",actualKey:"genus",values:{url:`${a.server}/genera?genus=`,cb:s("genus")},prompt:"type at least 3 letters to choose a genus",noDuplicates:!1},{key:"order",actualKey:"order",values:{url:`${a.server}/orders?order=`,cb:s("order")},prompt:"type at least 3 letters to choose an order",noDuplicates:!1},{key:"taxon",actualKey:"taxon",values:{url:`${a.server}/taxa?taxon=`,cb:s("taxon")},prompt:"type at least 3 letters to choose a taxon",noDuplicates:!1},{key:"journal year",actualKey:"journalYear",values:((e,t)=>{const a=t-e;return Array.from({length:a},((t,a)=>a+e)).map((e=>String(e)))})(1995,2022),prompt:"pick a year of publication",noDuplicates:!0},{key:"biome",actualKey:"biome",values:{url:`${a.server}/biomes?biome=`,cb:s("biome")},prompt:"type at least 3 letters to choose a biome",noDuplicates:!1}];new r({selector:e("#fs-container"),helpText:"search images",facets:o,cb:a=>{const r=new URLSearchParams(a),n=Array.from(t("input[name=resource]")).filter((e=>e.checked))[0].value,s=e("input[name=page").value,o=e("input[name=size").value;r.append("resource",n),r.append("page",s),r.append("size",o);const i=r.toString();g(i),m(i)}}),e("#fancySearch").classList.add("hidden"),e("#fancySearch").classList.add("noblock"),"fs"===n&&b()};export{R as init};
