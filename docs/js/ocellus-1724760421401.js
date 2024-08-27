/* generated: Tue Aug 27 2024 14:07:01 GMT+0200 (Central European Summer Time) */
const e=e=>document.querySelector(e),t=e=>document.querySelectorAll(e),a={server:"localhost"===window.location.hostname?"http://localhost:3010/v3":"https://test.zenodeo.org/v3",cache:{images:{yearlyCounts:!1,totals:!1},treatments:{yearlyCounts:!1,totals:!1},journals:null,collectionCodes:null},figureSize:{normal:250,small:100,tiny:50},defaultPlaceholder:"search images",results:{totalCount:0,figures:[],page:1,size:30},resources:["treatments","citations","images"],pseudoResources:["about","ip","contact","privacy"],params:{notValidQ:["resource","page","size","grid","refreshCache","cols"],validImages:["httpUri","caption","captionText","q","treatmentId","treatmentTitle","articleTitle","treatmentDOI","articleDOI","zenodoDep","authorityName","collectionCode","status","journalTitle","journals_id","journalYear","kingdom","phylum","class","family","order","genus","species","publicationDate","checkinTime","latitude","longitude","geolocation","isOnLand","validGeo","eco_name","biome","biome_id"],validTreatments:["treatmentId","treatmentTitle","treatmentDOI","zenodoDep","articleTitle","articleDOI","publicationDate","journalYear","authorityName","status","checkinTime","validGeo","q","latitude","longitude","geolocation","eco_name","biome","isOnLand","journalTitle","kingdom","phylum","class","family","order","genus","species"],validCommon:["refreshCache","page","size","cols","groupby"],notValidSearchCriteria:["resource","communities","communitiesChooser","refreshCache","view","size","page","reset","submit","source","grid"]},cols:{images:["treatmentId","treatmentTitle","zenodoDep","treatmentDOI","articleTitle","articleAuthor","httpUri","caption","latitude","longitude"],treatments:["treatmentId","treatmentTitle","zenodoDep","treatmentDOI","articleTitle","articleAuthor","journalTitle","latitude","longitude"]},maps:{},hiddenClasses:["hidden","noblock"],closedFigcaptionHeight:"30px",zenodoUri:"https://zenodo.org/records",tbUri:"https://tb.plazi.org/GgServer/html",H3ColorRamp:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],treatmentIcon:{iconUrl:"/img/treatment.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]},treatmentIconHighlighted:{iconUrl:"/img/treatment-highlighted.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]},months:["January","February","March","April","May","June","July","August","September","October","November","December"],charts:{termFreq:null,yearlyCounts:null}};function n(e){const t=document.getElementById("charts");let a=960;return t.offsetWidth<a&&(a=t.offsetWidth-100),e.style.display="block",e.style.width=`${a}px`,e.style.textAlign="center",e.style.margin="0 auto",e}function s(e,t){return e<1e3?e:e>=1e3&&e<1e6?e/1e3+"K":e>=1e6&&e<1e7?e/1e6+"M":void 0}const i=({yearlyCounts:e,totals:t})=>{const i=n(document.querySelector("#yearlyCounts"));i.innerHTML="";const r="Images",{years:o,series:l}=function(e,t){const a=[],n=[];"Treatments"===e||"Images"===e?(n.push({name:"Treatments",type:"bar",emphasis:{focus:"series"},data:t.map((e=>e.num_of_treatments))}),n.push({name:"Images",type:"bar",emphasis:{focus:"series"},data:t.map((e=>e.num_of_images))}),n.push({name:"Species",type:"bar",emphasis:{focus:"series"},data:t.map((e=>e.num_of_species))}),n.push({name:"Journals",type:"bar",emphasis:{focus:"series"},data:t.map((e=>e.num_of_journals))}),t.forEach((e=>a.push(e.year)))):(n.push({name:e,type:"bar",emphasis:{focus:"series"},data:t.map((t=>t[`num_of_${e.toLowerCase()}`]))}),t.forEach((e=>a.push(e.year))));return{years:a,series:n}}(r,e),c=function(e,t,a){return{legend:{left:65,top:60,orient:"horizontal",borderWidth:1,borderRadius:5,borderColor:"#444",backgroundColor:"#fff"},tooltip:{trigger:"axis",axisPointer:{type:"cross",label:{precision:"0"}},formatter:'<div class="leg">\n    year {b}\n    <hr>\n    <div class="dot b"></div>{a0}: {c0}<br/>\n    <div class="dot g"></div>{a1}: {c1}<br/>\n    <div class="dot y"></div>{a2}: {c2}<br/>\n    <div class="dot r"></div>{a3}: {c3}\n</div>'},grid:{left:"3%",right:"4%",bottom:"3%",containLabel:!0},xAxis:[{type:"category",splitLine:{show:!1},data:t}],yAxis:[{type:"value",axisLabel:{formatter:s}}],series:a}}(0,o,l),d=document.createElement("div");d.style.width="100%",d.style.height="200px",d.classList.add("viz"),i.appendChild(d),a.charts.yearlyCounts=echarts.init(d),a.charts.yearlyCounts.setOption(c);const u=t.treatments,m=t.images,h=t.species,p=t.journals,g=c.xAxis[0].data,f=function({resource:e,imagesTotal:t,treatmentsTotal:a,speciesTotals:n,journalsTotals:s,num_of_years:i}){let r="Treatments"===e?`with <span>${t}</span> images, and`:`in <span>${a}</span> treatments of`;r+=` <span>${n}</span> species from <span>${s}</span> journals`,i&&(r+=` over <span>${i}</span> years`);return r}({resource:r,imagesTotal:m,treatmentsTotal:u,speciesTotals:h,journalsTotals:p,num_of_years:g[g.length-1]-g[0]}),$=document.createElement("div");$.style.width="100%",$.classList.add("caption"),i.appendChild($),$.innerHTML=f};class r{constructor(e){this.el=e,this.summary=e.querySelector("summary"),this.content=e.querySelector("#charts"),this.animation=null,this.isClosing=!1,this.isExpanding=!1,this.summary.addEventListener("click",(e=>this.onClick(e)))}onClick(e){e.preventDefault(),this.el.style.overflow="hidden",this.isClosing||!this.el.open?this.open():(this.isExpanding||this.el.open)&&this.shrink()}shrink(){this.isClosing=!0;const e=`${this.el.offsetHeight}px`,t=`${this.summary.offsetHeight}px`;this.animation&&this.animation.cancel(),this.animation=this.el.animate({height:[e,t]},{duration:400,easing:"ease-out"}),this.animation.onfinish=()=>this.onAnimationFinish(!1),this.animation.oncancel=()=>this.isClosing=!1}open(){this.el.style.height=`${this.el.offsetHeight}px`,this.el.open=!0,window.requestAnimationFrame((()=>this.expand()))}expand(){this.isExpanding=!0;const e=`${this.el.offsetHeight}px`,t=`${this.summary.offsetHeight+this.content.offsetHeight}px`;this.animation&&this.animation.cancel(),this.animation=this.el.animate({height:[e,t]},{duration:400,easing:"ease-out"}),this.animation.onfinish=()=>this.onAnimationFinish(!0),this.animation.oncancel=()=>this.isExpanding=!1}onAnimationFinish(e){this.el.open=e,this.animation=null,this.isClosing=!1,this.isExpanding=!1,this.el.style.height=this.el.style.overflow=""}}function o(t){const a=e("input[name=resource]").checked?"treatments":"images",n=`${t.target.parentNode.href}&resource=${a}`;history.pushState({},"",n);const s=new URL(location);let i;s.search&&(i=s.search.substring(1)),H(i);const r=A();z(r),t.preventDefault(),t.stopPropagation()}function l(t){if("/"===t.key){if(/^(?:input|textarea|select|button)$/i.test(t.target.tagName))return;const a=e("#q");a.setSelectionRange(0,a.value.length),a.focus(),t.preventDefault()}}const c=t=>{const a=e(".examples").classList;a.contains("hidden")?a.remove("hidden"):a.add("hidden")},d=e=>{const t=e.target.classList;t.contains("required")&&t.remove("required")},u=t=>{log.info("- toggling advanced search"),e("#as-container").classList.toggle("noblock");e("input[name=searchtype]").checked?(e("#q").value="",e("#q").placeholder="use advanced search below",e("#q").disabled=!0,e("#refreshCache").disabled=!0,e("#clear-q").disabled=!0,e('input[name="as-q"]').focus(),function(t){const a=L.map("mapSearch").setView([0,0],1);a.attributionControl.setPrefix(""),L.tileLayer("http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",{maxZoom:19}).addTo(a);const n=new L.FeatureGroup;a.addLayer(n);const s={position:"topleft",draw:{polyline:!1,polygon:!1,circle:{shapeOptions:{weight:1}},rectangle:{shapeOptions:{clickable:!1,weight:1}},circlemarker:!1,marker:!1},edit:{featureGroup:n}},i=new L.Control.Draw(s);a.addControl(i),a.on(L.Draw.Event.CREATED,(function(t){const a=t.layerType,s=t.layer,i=e("#coords"),r=e("input[name=as-geolocation");if("rectangle"===a){const e=s.toGeoJSON().geometry.coordinates,[t,a,n,o,l]=e[0],c=t[1].toFixed(2),d=t[0].toFixed(2),u=n[1].toFixed(2),m=n[0].toFixed(2);i.innerHTML=`lower left: lat ${c}, lng: ${d}; upper right: lat ${u}, lng ${m}`,r.value=`within(min_lat:${c},min_lng:${d},max_lat:${u},max_lng:${m})`}else if("circle"===a){const e=t.layer.getLatLng(),a=e.lng.toFixed(2),n=e.lat.toFixed(2),s=(t.layer.getRadius()/1e3).toFixed(2);i.innerHTML=`within ${s} kms of ${a}, ${n}`,r.value=`within(radius:${s},units:'kilometers',lat:${n},lng:${a})`}n.addLayer(s)})),a.on(L.Draw.Event.DELETED,(function(t){e("input[name=as-geolocation").value="",e("#coords").innerHTML=""}))}()):(e("#q").placeholder=a.defaultPlaceholder,e("#q").disabled=!1,e("#refreshCache").disabled=!1,e("#clear-q").disabled=!1)},m=t=>{const a=e("input[name=resource]").checked?"treatments":"images";j(a)},h=e=>{if(e.target.open){var a=t("details[open]");Array.prototype.forEach.call(a,(function(t){t!==e.target&&t.removeAttribute("open")}))}},p=a=>{e("#q").value=a.target.textContent,e("#ns-go").classList.add("glowing");t("input[name=source").forEach((e=>{"treatments"===e.value&&(e.checked=!0)})),c(),a.stopPropagation(),a.preventDefault()},g=t=>{e("#refreshCache").toggleAttribute("data-pop-show")},f=t=>{""===e("#q").value?(v(),setTimeout(b,4e3)):(e("#q").classList.remove("red-placeholder"),e("#throbber").classList.remove("nothrob"),e("#ns-go").classList.remove("glowing"),D()),t.stopPropagation(),t.preventDefault()},$=t=>{e("#throbber").classList.remove("nothrob"),D(),t.stopPropagation(),t.preventDefault()},y=n=>{const s=new URL(n.target.href).hash,i=t(".modal");s.length>0?(i.forEach((e=>{e.classList.add(...a.hiddenClasses)})),e(s).classList.remove(...a.hiddenClasses)):i.forEach((e=>e.classList.add(...a.hiddenClasses)))},v=()=>{e("#q").placeholder="c'mon, type something",e("#q").classList.add("red-placeholder")},b=t=>{e("#q").placeholder=a.defaultPlaceholder,e("#q").classList.remove("red-placeholder"),e("#refreshCache").checked=!1},x=t=>{const a=t.target.innerText;t.target.innerText=t.target.dataset.reveal,e("#brand").classList.add("smallbrand"),setTimeout((()=>{t.target.innerHTML=a,e("#brand").classList.remove("smallbrand")}),2e3),t.stopPropagation(),t.preventDefault()};function w(e){const t=e.querySelector(".next"),n=e.querySelector(".prev");let s=0;const i=e.querySelectorAll(".content .slide"),r=i.length;let o=i[0];function l(e){o.classList.remove("current"),s+=e,-1===e&&s<0&&(s=r-1),1!==e||i[s]||(s=0),o=i[s],o.classList.add("current")}e.classList.add("active"),t.addEventListener("click",(function(e){l(1),function(e){const t=e.currentTarget;if(!a.maps[t.dataset.id]){const e=L.map(`map-${t.dataset.id}`);a.maps[t.dataset.id]=e;const n="http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";L.tileLayer(n,{maxZoom:19,attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(e);const s=L.icon({iconUrl:"img/treatment.svg",iconSize:[10,10],iconAnchor:[5,5]});let i;if("undefined"!==t.dataset.loc){JSON.parse(t.dataset.loc).map((e=>[e.latitude,e.longitude])).forEach(((t,a)=>{0===a&&(i=t),L.marker(t,{icon:s}).addTo(e)})),e.setView(i,10)}else if(t.dataset.convexhull){const a=JSON.parse(t.dataset.convexhull),n=L.polygon(a,{color:"#9BC134",weight:1}).addTo(e);a.forEach(((t,a)=>{L.marker(t,{icon:s}).addTo(e)})),e.fitBounds(n.getBounds())}}}(e)})),n.addEventListener("click",(function(e){l(-1)})),l(0)}const T=e=>{const a=e.target.name;if("between"===e.target.value){t(`#${a}-range .hidden`).forEach((e=>{e.classList.contains("hidden")&&(e.classList.remove("hidden"),e.classList.add("vis"))}))}else{t(`#${a}-range .vis`).forEach((e=>{e.classList.add("hidden"),e.classList.remove("vis")}))}};function k(e,t){const a=document.getElementById("tooltip");a.innerHTML=t,a.style.display="block",a.style.left=e.offsetX+"px",a.style.top=e.offsetY+"px"}function q(){document.getElementById("tooltip").style.display="none"}function C({resource:e,figureSize:t,rec:n}){const s="images"===e?(({figureSize:e,rec:t})=>{const n=t.zenodoRec?`<img src="img/zenodo-gradient-35.png" width="35" height="14"> <a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank">more on Zenodo</a>`:"",s=`<img src="img/treatmentBankLogo.png" width="35" height="14"> <a href="${a.tbUri}/${t.treatmentId}" target="_blank">more on TreatmentBank</a>`,i=250===e?"visible":"noblock",r=`figure-${e}`+(t.treatmentId?" tb":""),o=`this.onerror=null; setTimeout(() => { this.src='${t.uri}' }, 1000);`,l=t.loc||t.convexHull?"this.parentNode.parentNode.parentNode.parentNode.style.height=this.height+150+'px'":"";return`<figure class="${r}">\n    <a class="zen" href="${t.fullImage}">\n\n            <img src="img/bug.gif" width="${t.figureSize}" \n                data-src="${t.uri}" \n                class="lazyload" \n                data-recid="${t.treatmentId}" \n                onerror="${o}"\n                onload="${l}">\n        \n    </a>\n    <figcaption class="${i}">\n        <details>\n            <summary class="figTitle" data-title="${t.treatmentTitle}">\n                ${t.treatmentTitle}\n            </summary>\n            <p>${t.captionText}</p>\n            ${s}<br>\n            ${n}\n        </details>\n    </figcaption>\n</figure>`})({figureSize:t,rec:n}):(({figureSize:e,rec:t})=>{let n="";t.zenodoRec&&(n=`<a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank" title="more on Zenodo" alt="more on Zenodo"><img class="zenodoLink" src="img/zenodo-gradient-round.svg" width="50"></a>`);const s=250===e?"visible":"noblock",i=`figure-${e} `+(t.treatmentId?"tb":""),r=t.treatmentDOI?`<a href="https://dx.doi.org/${t.treatmentDOI}">${t.treatmentDOI}</a>`:"";let o="";return t.articleTitle&&(o+=`<span class="articleTitle">${t.articleTitle}</span>`),t.articleAuthor&&(o+=` by <span class="articleAuthor">${t.articleAuthor}</span>`),t.journalTitle&&(o+=` in <span class="journalTitle">${t.journalTitle}</span>`),r&&(o+=`. ${r}`),`<figure class="${i}">\n    <p class="treatmentTitle">${t.treatmentTitle}</p>\n    <p class="citation">${o}</p>\n    <figcaption class="${s}">\n        \x3c!--  --\x3e\n        <div>\n            ${n} <a href="${a.tbUri}/${t.treatmentId}" target="_blank" title="more on TreatmentBank" alt="more on TreatmentBank"><img class="tbLink" src="img/treatmentBankLogo.png" width="100"></a>\n        </div>\n    </figcaption>\n</figure>`})({figureSize:t,rec:n}),i="images"===e?`${n.treatments_id}-${n.images_id}`:n.treatments_id;return n.loc||n.convexHull?`\n        <div class="carouselbox">\n\n            <div class="buttons">\n                <button class="prev">\n                    ◀ <span class="offscreen">Previous</span>\n                </button>\n                <button class="next" \n                    data-loc=${JSON.stringify(n.loc)} \n                    data-convexhull=${JSON.stringify(n.convexHull)} \n                    data-id="${i}">\n                    <span class="offscreen">Next</span> ▶︎\n                </button>\n            </div> \n\n            <div class="content">\n                <div class="slide">\n                    ${s}\n                </div>\n                <div id="map-${i}" class="map slide"></div>\n            </div>\n        </div>`:`\n        <div class="slidr">\n            ${s}\n        </div>`}const S=({resource:t,figureSize:r,slides:o,qs:l,count:c,term:d,termFreq:m,yearlyCounts:h,prev:p,next:g,stored:f,ttl:$,cacheHit:y})=>{log.info(`- renderPage()\n    - figureSize: ${r}px\n    - figures: ${o.length} slides\n    - qs: ${l}\n    - count: ${c}\n    - prev: ${p}\n    - next: ${g}`),e("#grid-images").classList.add(`columns-${r}`),E(o),_(l,p,g),e("#throbber").classList.add("nothrob"),a.charts.termFreq&&(a.charts.termFreq.dispose(),e("#termFreq").style.visibility="hidden"),m&&m.length&&(((e,t)=>{const i=n(document.querySelector("#termFreq"));i.innerHTML="";const r="all",o="with images",l={legend:{left:55,top:60,orient:"vertical",borderWidth:1,borderRadius:5,borderColor:"silver",backgroundColor:"#fff"},tooltip:{trigger:"axis",formatter:'<div class="leg">\n    year {b}\n    <hr>\n    {a0}: {c0}<br/>\n    {a1}: {c1}\n</div>'},grid:{left:"3%",right:"4%",bottom:"3%",containLabel:!0},xAxis:{type:"category",splitLine:{show:!1},data:t.map((e=>e.journalYear))},yAxis:{type:"log",minorSplitLine:{show:!0},axisLabel:{formatter:s}},series:[{name:r,type:"line",data:t.map((e=>0==e.total?null:e.total)),color:"#f00",lineStyle:{color:"#f00",width:1}},{name:o,type:"line",data:t.map((e=>0==e.withImages?null:e.withImages)),color:"#00f",lineStyle:{color:"#00f",width:1}}]},c=document.createElement("div");c.style.width="100%",c.style.height="150px",c.classList.add("viz"),i.appendChild(c),a.charts.termFreq=echarts.init(c),a.charts.termFreq.setOption(l);const d=document.createElement("div");d.style.width="100%",d.classList.add("caption"),i.appendChild(d),d.innerHTML=`occurrence of <span>${e}</span> in the text by year`})(d,m),e("#termFreq").style.visibility="visible"),function(t,n,s,i,r){log.info("- renderSearchCriteria()");const o=new URLSearchParams(t);let l=o.get("resource");const c=[],d=[],u=[];a.params.notValidSearchCriteria.forEach((e=>o.delete(e)));const m='<span class="crit-key">',h='<span class="crit-val">',p='<span class="crit-count">',g="</span>",f={checkinTime:"checked in",updateTime:"updated",publicationDate:"published"};n?n<10&&(n=F(n)):n="Sorry, no";c.push(`${p}${n}${g}`),1===n&&(l=l.slice(0,-1));c.push(l),o.forEach(((e,t)=>{let a;if(Object.keys(f).includes(t)){const s=e.match(/(?<operator1>eq|since|until)?\((?<date>[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}|yesterday)\)|(?<operator2>between)?\((?<from>[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}|yesterday)\s*and\s*(?<to>[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}|yesterday)\)/);if(s){if(a=`${m}${f[t]}${g}`,s.groups.operator1){let e;e="since"===s.groups.operator1?1===n?"has been":"have been":1===n?"was":"were",c.push(e),"eq"===s.groups.operator1?a+=" on":a+=` ${s.groups.operator1}`,a+=` ${h}${s.groups.date}${g}`}else s.groups.operator2&&(a+=` ${h}between${g} ${h}${s.groups.from}${g} and ${h}${s.groups.to}${g}`);d.push(a)}}else{const n=e.match(/(?<operator>\w+)\((?<term>[\w\s]+)\)/);if(n){const{operator:e,term:s}=n.groups;a=`${m}${t}${g}${e.replace(/_/," ")} ${h}${s}${g}`}else if("q"===t)a=`${m}${e}${g} is in the text`;else if("captionText"===t)a=`${m}${e}${g} is in ${m}caption text${g}`;else if("geolocation"===t){const t=new RegExp("(?<operator>within)\\((radius:s*(?<radius>([+-]?([0-9]+)(.[0-9]+)?)),s*units:s*['\"](?<units>kilometers|miles)['\"],s*lat:s*(?<lat>([+-]?([0-9]+)(.[0-9]+)?)),s*lng:s*(?<lng>([+-]?([0-9]+)(.[0-9]+)?))|min_lat:s*(?<min_lat>([+-]?([0-9]+)(.[0-9]+)?)),min_lng:s*(?<min_lng>([+-]?([0-9]+)(.[0-9]+)?)),max_lat:s*(?<max_lat>([+-]?([0-9]+)(.[0-9]+)?)),max_lng:s*(?<max_lng>([+-]?([0-9]+)(.[0-9]+)?)))\\)"),n=e.match(t);if(n){let{operator:e,radius:t,units:s,lat:i,lng:r,min_lat:o,min_lng:l,max_lat:c,max_lng:d}=n.groups;t?(r=Number(r).toFixed(2),i=Number(i).toFixed(2),a=`${m}location${g} is within ${h}${t}${g} ${h}${s}${g} of ${h}lat ${i}${g} and ${h}lng ${r}${g}`):(l=Number(l).toFixed(2),o=Number(o).toFixed(2),d=Number(d).toFixed(2),c=Number(c).toFixed(2),a=`${m}location${g} is within a box with ${m}lower left corner${g} at ${h}lat ${o}, lng ${l}${g} and ${m}upper right corner${g} at ${h}lat ${c}, lng ${d}${g}`)}}else t=t.split(/([A-Z][a-z]+)/).filter((function(e){return e})).map((e=>e.toLowerCase())).join(" "),a=`${m}${t}${g} is ${h}${e}${g}`;u.push(a)}}));const $=[];d.length?$.push(...d):c.push("found");u.length&&c.push("where");let y;$.push(...u);const v=$.length;y=1===v?$[0]:2===v?`${$[0]} and ${$[1]}`:`${$.slice(0,v-2).join(", ")}, and ${$[v-1]}`;if(c.push(y),r){const e=new Date(s),t=new Date(s+i)-new Date;c.push(`<span aria-label="cache hit, stored ${R(e)}, expires in ${M(t)}" data-html="true" data-pop="top" data-pop-no-shadow data-pop-arrow data-pop-multiline>💥</span>`)}e("details.charts summary").innerHTML=c.join(" "),e("#charts-container summary").style.visibility="visible"}(l,c,f,$,y),a.charts.yearlyCounts&&(a.charts.yearlyCounts.dispose(),e("#yearlyCounts").style.visibility="hidden"),h&&(i({yearlyCounts:h.yearlyCounts,totals:h.totals}),e("#yearlyCounts").style.visibility="visible"),(m||h)&&(e("#charts").style.visibility="visible");e("input[name=searchtype]").checked&&(e("input[name=searchtype]").checked=!1,u(),H(l)),"images"===t&&new SimpleLightbox({elements:"figure",loadingCaption:'<img src="../../img/bug.gif">'})},E=(a,n,s,i)=>{log.info("- renderSlides()"),a.length?(e("#grid-images").innerHTML=a.join(""),(()=>{const e=t("figcaption > details");for(let t=0,a=e.length;t<a;t++)e[t].addEventListener("toggle",(a=>{const n=a.target.querySelector("summary"),s=n.dataset.title,i=s.length>30?`${s.substring(0,30)}…`:s;e[t].open?n.innerText=s:n.innerText=i}))})(),(()=>{const e=t("figure .reveal");for(let t=0,a=e.length;t<a;t++)e[t].addEventListener("click",x)})(),t(".carouselbox").forEach((e=>{w(e)}))):e("#grid-images").innerHTML=""},_=(t,a,n)=>{log.info("- renderPager()"),log.info(`  - qs: ${t}`),log.info(`  - prev: ${a}`),log.info(`  - next: ${n}`);const s=new URLSearchParams(t);s.delete("page"),e("#pager").innerHTML=`<a href="?${s.toString()}&page=${a}">prev</a> <a href="?${s.toString()}&page=${n}">next</a>`,e("#pager").classList.add("filled"),log.info("- listeners.addListenersToPagerLinks()")};const z=async t=>{log.info("- getResource(qs)"),e("#throbber").classList.remove("nothrob");const n=new URLSearchParams(t),s=n.get("page"),i=n.get("size"),r=n.get("grid")||"normal",o=a.figureSize[r],l=n.get("resource");let c;n.delete("resource"),n.has("q")&&(c=n.get("q"));const d="images"===l?a.params.validImages:a.params.validTreatments;d.push(...a.params.validCommon);let u=!0;if(Array.from(n).forEach((([t,a])=>{var s;d.includes(t)?a||(n.set("q",t),n.delete(t),c=t):(s=`"${t}" is not a valid param`,e(".warn").classList.contains("hidden")&&(e(".warn").innerHTML=s,e(".warn").classList.remove("hidden"),e("#throbber").classList.add("nothrob"),setTimeout((()=>{e(".warn").innerHTML="",e(".warn").classList.add("hidden")}),3e3)),u=!1)})),!1===u)return;const m="images"===l?`${a.cols.images.join("&cols=")}`:`${a.cols.treatments.join("&cols=")}`;let h=`${n.toString()}&cols=${m}`;c&&(h+="&termFreq=true"),n.has("treatmentId")||(h+="&yearlyCounts=true");const p=[];p.push(I({resource:l,queryString:h,figureSize:o})),Promise.all(p).then((e=>{const t={resource:l,prev:s>1?s-1:1,next:parseInt(s)+1,size:i,count:0,recs:[]};return e.forEach((e=>{void 0!==e&&(t.recs.push(...e.recs),t.count+=e.count,t.termFreq=e.termFreq,t.yearlyCounts=e.yearlyCounts,t.cacheHit=e.cacheHit,t.stored=e.stored,t.ttl=e.ttl)})),t})).then((e=>{const a=e.recs.map((e=>C({resource:l,figureSize:o,rec:e}))),n={resource:l,figureSize:o,slides:a,qs:t,count:e.count,prev:e.prev,next:e.next,stored:e.stored,ttl:e.ttl,cacheHit:e.cacheHit};e.termFreq&&(n.termFreq=e.termFreq,n.term=c),e.yearlyCounts&&(n.yearlyCounts=e.yearlyCounts),S(n)}))},I=async({resource:e,queryString:t,figureSize:n})=>{log.info(`- getResults({ resource, queryString, figureSize })\n    - resource: ${e}\n    - queryString: ${t},\n    - figureSize: ${n}`);const s=`${a.server}/${e}?${t}`,i=await fetch(s);if(i.ok){const t=await i.json(),s=t.item.result.records;let r;if(t.item.result.yearlyCounts){r={};const e=t.item.result.yearlyCounts,a=e.reduce(((e,t)=>(e.images+=t.num_of_images,e.treatments+=t.num_of_treatments,e.species+=t.num_of_species,e.journals+=t.num_of_journals,e)),{images:0,treatments:0,species:0,journals:0});r.yearlyCounts=e,r.totals=a}const o={resource:e,count:0,recs:[],termFreq:t.item.result.termFreq,yearlyCounts:r,prev:"",next:"",stored:t.stored,ttl:t.ttl,cacheHit:t.cacheHit||!1};if(s)return o.count=o.count+t.item.result.count,s.forEach((t=>{const s={};if("images"===e){s.treatmentId=t.treatmentId,s.treatments_id=t.treatments_id,s.images_id=t.images_id,s.treatmentTitle=t.treatmentTitle,s.zenodoRec=t.zenodoDep,s.figureSize=n;const e=t.httpUri.split("/")[4];t.httpUri.indexOf("zenodo")>-1?t.httpUri.indexOf(".svg")>-1?(s.uri="/img/kein-preview.png",s.fullImage="/img/kein-preview.png"):(s.uri=`https://zenodo.org/api/iiif/record:${e}:figure.png/full/250,/0/default.jpg`,s.img=`${a.zenodoUri}/${e}/thumb${n}`,s.fullImage=`https://zenodo.org/api/iiif/record:${e}:figure.png/full/^1200,/0/default.jpg`,s.fullImg=`${a.zenodoUri}/${e}/thumb1200`):(s.uri=`${t.httpUri}/singlefigAOF/`,s.fullImage=t.httpUri),s.captionText=t.captionText,s.treatmentDOI=t.treatmentDOI,s.articleTitle=t.articleTitle,s.articleAuthor=t.articleAuthor,s.latitude=t.latitude,s.longitude=t.longitude,s.loc=t.loc,t.convexHull?s.convexHull=t.convexHull[0].map((([e,t])=>[t,e])):s.convexHull=void 0}else"treatments"===e&&(s.treatmentId=t.treatmentId,s.treatments_id=t.treatments_id,s.treatmentTitle=t.treatmentTitle,s.zenodoRec=t.zenodoDep,s.figureSize=n,s.journalTitle=t.journalTitle,s.treatmentDOI=t.treatmentDOI,s.articleTitle=t.articleTitle,s.articleAuthor=t.articleAuthor,s.latitude=t.latitude,s.longitude=t.longitude,s.loc=t.loc,t.convexHull?s.convexHull=t.convexHull[0].map((([e,t])=>[t,e])):s.convexHull=void 0);o.recs.push(s)})),o}else alert("HTTP-Error: "+i.status)},H=t=>{log.info(`- qs2form(qs)\n    - qs: ${t}`);const n=new URLSearchParams(t);n.delete("refreshCache");const s=[];n.forEach(((t,n)=>{if(log.info(`val: ${t}, key: ${n}`),a.params.notValidQ.includes(n))"resource"===n?(log.info(`setting form to query resource ${t}`),j(t),"treatments"===t?(log.info("setting toggle-resource to true"),e("input[name=resource]").checked=!0):(log.info("setting toggle-resource to false"),e("input[name=resource]").checked=!1)):(log.info(`setting input name ${n} to ${t}`),e(`input[name=${n}]`).value=t);else{let e=n;t&&(e="q"===n?decodeURIComponent(t):`${n}=${t}`),s.push(e)}})),e("#q").value=s.join("&")},F=e=>e<10?["One","Two","Three","Four","Five","Six","Seven","Eight","Nine"][e-1].toLowerCase():e,D=()=>{log.info("submitForm()");const e=A();if(!e)return!1;O(e),z(e)},j=async t=>{const n=await(async(e,t)=>{if(!a.cache[e].yearlyCounts){let n=`${a.server}/${e}?cols=`;t&&(n+="&yearlyCounts=true");const s=await fetch(n);if(s.ok){const n=await s.json(),i=n.item.result.count;if(t){const t=n.item.result.yearlyCounts,s=t.reduce(((e,t)=>(e.images+=t.num_of_images,e.treatments+=t.num_of_treatments,e.species+=t.num_of_species,e.journals+=t.num_of_journals,e)),{images:0,treatments:0,species:0,journals:0});a.cache[e].yearlyCounts=t,a.cache[e].totals=s}else a.cache[e].totals[e]=i}else alert("HTTP-Error: "+s.status)}return a.cache[e]})(t,!0);((t,a)=>{let{images:n,treatments:s,species:i,journals:r}=a.totals;const o=a.yearlyCounts;let l="images"===t?n:s;e("#q").placeholder=`search ${t}`;const c=o.length,d=3*c;Math.max(...o);const u=40/l;function m(e,a,n,s,i,r,o){return`<g class="${a}" transform="translate(${e*i},0)">\n            <rect height="${n}" y="${s-n}" width="${i}" onmousemove="showTooltip(evt, '${r}: ${o} ${t}');" onmouseout="hideTooltip();"></rect>\n        </g>`}let h=`<svg id="svgSpark" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="chart" height="40" width="${d}" aria-labelledby="title" role="img">`;for(let e=0;e<c;e++){const a=o[e].year,n=o[e][`num_of_${t}`];h+=m(e,"bar",n*u,40,3,a,n)}h+="</svg>";const p=document.querySelector("#sparkBox");let g=h;l=Math.round(l/1e3,0),s=Math.round(s/1e3,0),n=Math.round(n/1e3,0),i=Math.round(i/1e3,0),r=Math.round(r/1e3,0),g+="images"===t?` <span>~${l}K</span> ${t}, <span>~${s}K</span> treatments, `:`<span>~${l}K</span> ${t}, <span>~${n}K</span> images, `,g+=`<span>~${i}K</span> species, <span>~${r}K</span> journals`,p.innerHTML=g})(t,n),e("#q").placeholder=`search ${t}`},A=()=>{const a=new URLSearchParams,n=!0===e("input[name=searchtype").checked?"as":"ss";let s=!0;if("ss"===n)log.info("- form2qs(): simple search"),Array.from(t("form input.query")).filter((e=>e.value)).forEach((e=>{let t=e.name,n=e.value;if("q"===e.name){const s=e.value.replaceAll(/ & /g,"%20%26%20");new URLSearchParams(s).forEach(((e,s)=>{if(""===e){const e=n.match(/(^10\.[0-9]{4,}.*)/);e&&e[1]?(t="articleDOI",n=e[1]):(t="q",n=s)}else t=s,n=e;a.append(t,n)}))}else"radio"===e.type||"checkbox"===e.type?"resource"===e.name?e.checked||"true"===e.checked?a.append(t,n):a.append(t,"images"):(e.checked||"true"===e.checked)&&a.append(t,n):a.append(t,n)}));else if("as"===n){log.info("- form2qs(): advanced search");["page","size","resource","refreshCache"].forEach((t=>{const n=e(`input[name=${t}]`);"resource"===t?n.checked||"true"===n.checked?a.append(t,n.value):a.append(t,"images"):(n.checked||"true"===n.checked)&&a.append(t,n.value)}));["q","treatmentTitle","authorityName","articleTitle","journalTitle","journals_id","collectionCode"].forEach((t=>{const n=e(`input[name="as-${t}"]`);n.value&&a.append(t,n.value)}));["status","refreshCache"].forEach((t=>{const n=e(`input[name="as-${t}"]`);(n.checked||"true"===n.checked)&&a.append(t,n.value)}));const t=["journalYear","publicationDate","checkinTime","biome"],n=t=>{const n=e(`select[name="as-${t}"]`),s=n.selectedIndex,i=n.options[s].value;if(i)if("journalYear"===t)a.append(t,i);else if("biome"===t)a.append(t,i);else if("between"===i){const n=e(`input[name="as-${t}From`),s=n.value,i=e(`input[name="as-${t}To`),r=i.value;if(s&&r)a.append(t,`between(${s} and ${r})`);else{let e=!0;if(""===s&&(n.classList.add("required"),e=!1),""===r&&(i.classList.add("required"),e=!1),!e)return!1}}else{const n=e(`input[name="as-${t}From`);console.log(t);const s=n.value;if(!s)return n.classList.add("required"),!1;a.append(t,`${i}(${s})`)}return!0};for(const e of t){if(!n(e)){s=!1;break}}["geolocation"].forEach((t=>{const n=e(`input[name="as-${t}"]`);n.value&&a.append(t,n.value)}))}if(s){const e=a.toString();return console.log(e),e}return console.log("false"),!1},O=e=>{log.info("- updateUrl(qs)");const t=`?${e}`;history.pushState({},"",t)},M=e=>{const t=36e5,a=864e5;let n=Math.floor(e/a),s=Math.floor((e-n*a)/t),i=Math.round((e-n*a-s*t)/6e4);const r=e=>e<10?"0"+e:e;return 60===i&&(s++,i=0),24===s&&(n++,s=0),`${n} days ${r(s)} hours ${r(i)} mins`},R=e=>{const t=e.getFullYear(),n=e.getMonth(),s=e.getDate(),i=e.getHours(),r=e.getMinutes(),o=e.getSeconds();return`${s} ${a.months[n]}, ${t} ${i}:${r}:${o}`};var U;function N(){const a=new URL(location);if(a.search){log.info(`- locSearch: ${a.search.substring(1)}`),H(a.search.substring(1));const e=A();z(e)}else j("images");log.info("- addListeners()"),e("#refreshCache").addEventListener("click",g),e("#ns-go").addEventListener("click",f),e("#as-go").addEventListener("click",$),e("#q").addEventListener("focus",b),e("#search-help").addEventListener("click",c),e("div.examples").addEventListener("toggle",h,!0),t(".modalToggle").forEach((e=>e.addEventListener("click",y))),t(".reveal").forEach((e=>e.addEventListener("click",x))),t(".example-insert").forEach((e=>e.addEventListener("click",p))),e("input[name=searchtype").addEventListener("click",u),e("input[name=resource").addEventListener("click",m),e('select[name="as-publicationDate"]').addEventListener("change",T),e('select[name="as-checkinTime"]').addEventListener("change",T),t("input[type=date").forEach((e=>e.addEventListener("change",d))),t("#charts-container").forEach((e=>{new r(e)})),document.addEventListener("keydown",l),t("a.quicksearch").forEach((e=>e.addEventListener("click",o)))}log.level=log[(U=window.location.hostname,"localhost"===U?"INFO":"ERROR")];export{q as hideTooltip,N as init,k as showTooltip};
