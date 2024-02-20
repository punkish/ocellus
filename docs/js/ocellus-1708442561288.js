/* generated: Tue Feb 20 2024 16:22:41 GMT+0100 (Central European Standard Time) */
const e=e=>document.querySelector(e),t=e=>document.querySelectorAll(e),a={server:"localhost"===window.location.hostname?"http://localhost:3010/v3":"https://test.zenodeo.org/v3",cache:{images:{total:0,yearly:!1},treatments:{total:0,yearly:!1}},figureSize:{normal:250,small:100,tiny:50},results:{totalCount:0,figures:[],page:1,size:30},resources:["treatments","citations","images"],pseudoResources:["about","ip","contact","privacy"],params:{notValidQ:["resource","page","size","grid","refreshCache","cols"],validImages:["httpUri","caption","captionText","q","treatmentId","treatmentTitle","articleTitle","treatmentDOI","articleDOI","zenodoDep","authorityName","status","journalTitle","journalYear","kingdom","phylum","class","family","order","genus","species","publicationDate","checkinTime","latitude","longitude","geolocation","isOnLand","validGeo","eco_name","biome"],validTreatments:["treatmentId","treatmentTitle","treatmentDOI","zenodoDep","articleTitle","articleDOI","publicationDate","journalYear","authorityName","status","checkinTime","validGeo","q","latitude","longitude","geolocation","eco_name","biome","isOnLand","journalTitle","kingdom","phylum","class","family","order","genus","species"],validCommon:["refreshCache","page","size","cols"],notValidSearchCriteria:["resource","communities","communitiesChooser","refreshCache","view","size","page","reset","submit","source","grid"],images:["treatmentId","treatmentTitle","zenodoDep","treatmentDOI","articleTitle","articleAuthor","httpUri","caption"],treatments:["treatmentId","treatmentTitle","zenodoDep","treatmentDOI","articleTitle","articleAuthor","journalTitle"]},hiddenClasses:["hidden","noblock"],closedFigcaptionHeight:"30px",zenodoUri:"https://zenodo.org/records",tbUri:"https://tb.plazi.org/GgServer/html",H3ColorRamp:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],treatmentIcon:{iconUrl:"/img/treatment.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]},treatmentIconHighlighted:{iconUrl:"/img/treatment-highlighted.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]},months:["January","February","March","April","May","June","July","August","September","October","November","December"],termFreqChart:null,imageCountChart:null},r=function({selector:e,helpText:t,facets:a,cb:r}){const s=a.map((e=>e.key)),n=r;let o;const i=function({element:e,attribs:t,container:a}){const r=document.createElement(e);for(let[e,a]of Object.entries(t))"innerText"===e||"innerHTML"===e?r[e]=a:r.setAttribute(e,a);return a.appendChild(r),r},l=function(){const e=i({element:"div",attribs:{class:"fs-param-empty"},container:o});i({element:"div",attribs:{class:"fs-key fs-off"},container:e});const t=i({element:"input",attribs:{class:"query fs-key-input",placeholder:"choose a key…"},container:e});i({element:"div",attribs:{class:"fs-val fs-off"},container:e});const a=i({element:"input",attribs:{class:"query fs-val-input fs-off",placeholder:"choose a value…"},container:e}),r=i({element:"button",attribs:{class:"fs-cancel fs-off",type:"reset",innerHTML:"&#8855;"},container:e});t.addEventListener("keydown",c),a.addEventListener("keydown",c),r.addEventListener("click",d),u({type:"key",selector:t,values:s}),t.focus()},c=function(e){const t=(e=e||window.event).which||e.keyCode;let a=e.target;const r=a.parentElement,s=r.children[2],n=r.children[3],o=r.children[4];if(13==t)return""!==n.value&&(r.className="fs-param-filled",s.innerText=n.value,s.className="fs-val fs-on",n.className="fs-off",o.className="fs-cancel fs-on",l()),e.preventDefault(),e.stopPropagation(),!1;if((8==t||46==t)&&""===a.value){const e=`div#${fsDiv.id} div.fs-param-filled`,t=document.querySelectorAll(e),a=t[t.length-1];if(a)"fs-param-filled"===a.className?a.className="fs-param-filled fs-hilite":(a.className="fs-param-filled fs-hilite")&&a.parentElement.removeChild(a);else{const e=`div#${fsDiv.id} div.fs-param-empty`,t=document.querySelectorAll(e),a=t[t.length-1];a.parentElement.removeChild(a)}}},d=function(e){const t=this.parentElement;t.parentElement.removeChild(t)},u=function({type:e,selector:t,values:r}){new autoComplete({selector:t,source:async function(e,t){let a=[];if("function"==typeof r)a=r();else if("object"==typeof r&&r.url){const t=await fetch(`${r.url}${e}*`);if(!t.ok)throw Error("HTTP-Error: "+t.status);a=await r.cb(t)}else Array.isArray(r)&&(a=r);if(a.length){const r=[];for(let t=0;t<a.length;t++)~a[t].toLowerCase().indexOf(e)&&r.push(a[t]);t(r)}},minChars:Array.isArray(r)?0:3,delay:150,onSelect:function(t,r,n){const o=this.selector,i=o.parentElement;if("key"===e){const e=i.children[0];e.innerText=o.value,e.className="fs-key fs-on",o.className="fs-off";const t=a.filter((e=>e.key===r))[0];t.noDuplicates&&s.splice(s.indexOf(r),1);const n=i.children[3];n.className="fs-val-input fs-on",n.placeholder=t.prompt,u({type:"val",selector:n,values:t.values}),n.focus()}else if("val"===e){const e=i.children[2];r&&(e.innerText=o.value,e.className="fs-val fs-on"),o.className="fs-off",i.className="fs-param-filled",i.children[4].className="fs-cancel fs-on",l()}}})},m=function(e){const t=o.childNodes;let r={},s=0;const n=t.length;for(;s<n;s++){const e=t[s].children,n=e[1].value;if(n){const t=e[3].value.replace(/\n$/,""),s=a.filter((e=>e.key===n))[0].actualKey;if(s&&t)if(s in r)if("string"==typeof r[s]){const e=r[s];r[s]=[e,t]}else r[s].push(t);else r[s]=t}}e(r)};!function(e,t){const a=i({element:"div",attribs:{id:"fs-widget"},container:e});o=i({element:"div",attribs:{id:"fs",class:"fs"},container:a});const r=i({element:"div",attribs:{class:"switch resource regular pill green","aria-label":"toggle resource","data-pop":"right","data-pop-no-shadow":!0,"data-pop-arrow":!0},container:o});i({element:"input",attribs:{type:"radio",id:"switchResource-3",name:"resource",value:"images",class:"query",autocomplete:"off"},container:r}),i({element:"label",attribs:{for:"switchResource-3"},container:r}),i({element:"input",attribs:{type:"radio",id:"switchResource-4",name:"resource",value:"treatments",class:"query",autocomplete:"off"},container:r}),i({element:"label",attribs:{for:"switchResource-4"},container:r}),i({element:"button",attribs:{id:"fs-go",type:"submit",class:"fs-button-primary",innerText:"go"},container:a}).addEventListener("click",(function(e){e.preventDefault(),e.stopPropagation(),m(n)})),l()}(e)},s=r=>{log.info(`- qs2form(qs)\n    - qs: ${r}`);const s=new URLSearchParams(r);s.delete("refreshCache");const n=[];s.forEach(((r,s)=>{if(log.info(`val: ${r}, key: ${s}`),a.params.notValidQ.includes(s))"resource"===s?(log.info(`setting form to query resource ${r}`),g(r),Array.from(t("input[name=resource]")).filter((e=>e.value===r))[0].checked="true"):e(`input[name=${s}]`).value=r;else{let e=s;r&&(e="q"===s?decodeURIComponent(r):`${s}=${r}`),n.push(e)}})),e("#q").value=n.join("&")},n=({resource:e,figureSize:t,rec:r})=>{const s={figureSize:t,rec:r};return"images"===e?(({figureSize:e,rec:t})=>{const r=`<img src="img/bug.gif" width="${t.figureSize}" data-src="${t.uri}" class="lazyload" data-recid="${t.treatmentId}" onerror="this.onerror=null; setTimeout(() => { this.src='${t.uri}' }, 1000);">`,s=t.zenodoRec?`Zenodo ID: <a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank">more on Zenodo</a>`:"";let n="";t.treatmentId&&(n=`<a href="${a.tbUri}/${t.treatmentId}" target="_blank">more on TreatmentBank</a>`);let o="";n?o=`<a href="${a.tbUri}/${t.treatmentId}" target="_blank">${r}</a>`:s&&(o=`<a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank">${r}</a>`);const i=250===e?"visible":"noblock",l=`figure-${e} `+(t.treatmentId?"tb":""),c=t.treatmentTitle.length>30?`${t.treatmentTitle.substring(0,30)}…`:t.treatmentTitle;return`<figure class="${l}">\n    <div class="switches">\n        <div class="close"></div>\n    </div>\n    ${o}\n    <figcaption class="${i}">\n        <details>\n            <summary class="figTitle" data-title="${t.treatmentTitle}">${c}</summary>\n            <p>${t.captionText}</p>\n            ${n}<br>\n            ${s}\n        </details>\n    </figcaption>\n</figure>`})(s):(({figureSize:e,rec:t})=>{let r="";t.zenodoRec&&(r=`<a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank" title="more on Zenodo" alt="more on Zenodo"><img class="zenodoLink" src="img/zenodo-gradient-round.svg" width="50"></a>`);const s=250===e?"visible":"noblock",n=`figure-${e} `+(t.treatmentId?"tb":""),o=t.treatmentDOI?`<a href="https://dx.doi.org/${t.treatmentDOI}">${t.treatmentDOI}</a>`:"";let i="";return t.articleTitle&&(i+=`<span class="articleTitle">${t.articleTitle}</span>`),t.articleAuthor&&(i+=` by <span class="articleAuthor">${t.articleAuthor}</span>`),t.journalTitle&&(i+=` in <span class="journalTitle">${t.journalTitle}</span>`),o&&(i+=`. ${o}`),`<figure class="${n}">\n    <p class="treatmentTitle">${t.treatmentTitle}</p>\n    <p class="citation">${i}</p>\n    <figcaption class="${s}">\n        \x3c!--  --\x3e\n        <div>\n            ${r} <a href="${a.tbUri}/${t.treatmentId}" target="_blank" title="more on TreatmentBank" alt="more on TreatmentBank"><img class="tbLink" src="img/treatmentBankLogo.png" width="100"></a>\n        </div>\n    </figcaption>\n</figure>`})(s)},o=(t,a,r,s)=>{log.info("- renderFigures()"),t.length?(e("#grid-images").innerHTML=t.join(""),i(a,r,s),R(),U()):e("#grid-images").innerHTML=""},i=(t,a,r)=>{log.info("- renderPager()"),log.info(`  - qs: ${t}`),log.info(`  - prev: ${a}`),log.info(`  - next: ${r}`);const s=new URLSearchParams(t);s.delete("page"),e("#pager").innerHTML=`<a href="?${s.toString()}&page=${a}">prev</a> <a href="?${s.toString()}&page=${r}">next</a>`,e("#pager").classList.add("filled"),j()},l=(t,r,s,n,o)=>{log.info("- renderSearchCriteria(qs, count)"),log.info(`  - qs: ${t}`),log.info(`  - count: ${r}`);const i=new URLSearchParams(t),l=i.get("resource");i.get("page"),i.get("size"),r||(r="sorry, no");const u=[];let m;a.params.notValidSearchCriteria.forEach((e=>i.delete(e))),i.forEach(((e,t)=>{let a;const r=e.match(/(?<operator>\w+)\((?<term>[\w\s]+)\)/);if(r){const{operator:e,term:s}=r.groups;a=`<span class="crit-key">${t}</span> ${e.replace(/_/," ")} <span class="crit-val">${s}</span>`}else a="q"===t?`<span class="crit-key">${e}</span> is in the text`:`<span class="crit-key">${t}</span> is <span class="crit-val">${e}</span>`;u.push(a)}));const p=u.length;m=1===p?u[0]:2===p?`${u[0]} and ${u[1]}`:`${u.slice(0,p-2).join(", ")}, and ${u[p-1]}`,m=`<span class="crit-count">${r}</span> ${l} found where ${m}`;let h="";if(o){const e=new Date(s),t=new Date(s+n)-new Date;h=`cache hit, stored ${d(e)}, expires in ${c(t)}`,m+=`<span aria-label="${h}" data-html="true" data-pop="top" data-pop-no-shadow data-pop-arrow data-pop-multiline>💥</span>`}e("#search-criteria").innerHTML=m},c=e=>{const t=864e5,a=36e5;let r=Math.floor(e/t),s=Math.floor((e-r*t)/a),n=Math.round((e-r*t-s*a)/6e4);const o=e=>e<10?"0"+e:e;return 60===n&&(s++,n=0),24===s&&(r++,s=0),`${r} days ${o(s)} hours ${o(n)} mins`},d=e=>{const t=e.getFullYear(),r=e.getMonth(),s=e.getDate(),n=e.getHours(),o=e.getMinutes(),i=e.getSeconds();return`${s} ${a.months[r]}, ${t} ${n}:${o}:${i}`},u=(e,t)=>{let a=960;const r=document.getElementById("graphdiv");r.style.display="block";const s=r.offsetWidth;s<960&&(a=s);m(r,a,200,{x:"journal year",y1:"all",y2:"with images"},e,t)},m=(e,t,r,s,n,o)=>{const i={title:{text:`occurrence of '${n}' in text by year`,left:"center"},tooltip:{trigger:"axis",formatter:'<div class="leg">year {b}<hr>{a0}: {c0}<br/>{a1}: {c1}</div>'},legend:{left:55,top:60,orient:"vertical",borderWidth:1,borderRadius:5,borderColor:"#444",backgroundColor:"#fff"},xAxis:{type:"category",splitLine:{show:!1},data:o.map((e=>e.journalYear))},grid:{left:"3%",right:"4%",bottom:"3%",containLabel:!0},yAxis:{type:"log",minorSplitLine:{show:!0},axisLabel:{formatter:function(e,t){let a=e;return 1e3===e?a="1K":1e4===e?a="10K":1e5===e?a="100K":1e6===e?a="1M":1e7===e&&(a="10M"),a}}},series:[{name:s.y1,type:"line",data:o.map((e=>0==e.total?null:e.total)),color:"#f00",lineStyle:{color:"#f00",width:1}},{name:s.y2,type:"line",data:o.map((e=>0==e.withImages?null:e.withImages)),color:"#00f",lineStyle:{color:"#00f",width:1}}]};e.style.width=`${t}px`,e.style.height=`${r}px`,a.termFreqChart=echarts.init(e),a.termFreqChart.setOption(i)},p=async t=>{log.info("- getResource(qs)"),e("#throbber").classList.remove("nothrob");const r=new URLSearchParams(t),i=r.get("page"),c=r.get("size"),d=r.get("grid")||"normal",m=a.figureSize[d],p=r.get("resource");let f;r.delete("resource"),r.has("q")&&(f=r.get("q"));const g="images"===p?a.params.validImages:a.params.validTreatments;g.push(...a.params.validCommon);let y=!0;if(Array.from(r).forEach((([e,t])=>{g.includes(e)?t||(r.set("q",e),r.delete(e),f=e):(T(`"${e}" is not a valid param`),y=!1)})),!1===y)return;const v="images"===p?a.params.images.join("&cols="):a.params.treatments.join("&cols=");let $=`${r.toString()}&cols=${v}`;f&&($+="&termFreq=true");const b=[];b.push(h({resource:p,queryString:$,figureSize:m})),Promise.all(b).then((e=>{const t={resource:p,prev:i>1?i-1:1,next:parseInt(i)+1,size:c,count:0,recs:[]};return e.forEach((e=>{void 0!==e&&(t.recs.push(...e.recs),t.count+=e.count,t.termFreq=e.termFreq,t.cacheHit=e.cacheHit,t.stored=e.stored,t.ttl=e.ttl)})),t})).then((r=>{const i=r.recs.map((e=>n({resource:p,figureSize:m,rec:e}))),c={figureSize:m,figures:i,qs:t,count:r.count,prev:r.prev,next:r.next,stored:r.stored,ttl:r.ttl,cacheHit:r.cacheHit};r.termFreq&&(c.termFreq=r.termFreq,c.term=f),(t=>{const{figureSize:r,figures:n,qs:i,count:c,term:d,termFreq:m,prev:p,next:h,stored:f,ttl:g,cacheHit:y}=t;log.info(`- renderPage()\n    - figureSize: ${r}px\n    - figures: ${n.length} figures\n    - qs: ${i}\n    - count: ${c}\n    - prev: ${p}\n    - next: ${h}`),e("#grid-images").classList.add(`columns-${r}`),l(i,c,f,g,y),o(n,i,p,h),e("#throbber").classList.add("nothrob"),m&&m.length?u(d,m):a.termFreqChart&&(a.termFreqChart.dispose(),document.getElementById("graphdiv").style.display="none"),e("input[name=searchtype]").checked&&(e("input[name=searchtype]").checked=!1,w(),s(i))})(c)}))},h=async({resource:e,queryString:t,figureSize:r})=>{log.info(`- getResults({ resource, queryString, figureSize })\n    - resource: ${e}\n    - queryString: ${t},\n    - figureSize: ${r}`);const s=`${a.server}/${e}?${t}`,n=await fetch(s);if(n.ok){const t=await n.json(),s=t.item.result.records,o={resource:e,count:0,recs:[],termFreq:t.item.result.termFreq,prev:"",next:"",stored:t.stored,ttl:t.ttl,cacheHit:t.cacheHit||!1};if(s)return o.count=o.count+t.item.result.count,s.forEach((t=>{const s={};if("images"===e){s.treatmentId=t.treatmentId,s.treatmentTitle=t.treatmentTitle,s.zenodoRec=t.zenodoDep,s.figureSize=r;const e=t.httpUri.split("/")[4];t.httpUri.indexOf("zenodo")>-1?t.httpUri.indexOf(".svg")>-1?s.uri="/img/kein-preview.png":s.uri=`${a.zenodoUri}/${e}/thumb${r}`:s.uri=t.httpUri,s.captionText=t.captionText,s.treatmentDOI=t.treatmentDOI,s.articleTitle=t.articleTitle,s.articleAuthor=t.articleAuthor}else"treatments"===e&&(s.treatmentId=t.treatmentId,s.treatmentTitle=t.treatmentTitle,s.zenodoRec=t.zenodoDep,s.figureSize=r,s.journalTitle=t.journalTitle,s.treatmentDOI=t.treatmentDOI,s.articleTitle=t.articleTitle,s.articleAuthor=t.articleAuthor);o.recs.push(s)})),o}else alert("HTTP-Error: "+n.status)},f=()=>{log.info("submitForm()");const e=y();if(!e)return!1;v(e),p(e)},g=async e=>{const t=await(async e=>{if(!a.cache[e].total){const t=`${a.server}/${e}?cols=&yearlyCounts=true`,r=await fetch(t);if(r.ok){const t=await r.json();a.cache[e].total=t.item.result.count,a.cache[e].yearly=t.item.result.yearlyCounts.map((e=>({year:e.year,count:e.num_of_records})))}else alert("HTTP-Error: "+r.status)}return a.cache[e]})(e),r=await(async e=>{if(!a.cache[e]){const t=`${a.server}/${e}?cols=`,r=await fetch(t);if(r.ok){const t=(await r.json()).item.result.count;a.cache[e]=t}else alert("HTTP-Error: "+r.status)}return a.cache[e]})("species");((e,t,a)=>{const r=(t,a,r,s,n,o,i)=>`<g class="${a}" transform="translate(${t*n},0)">\n            <rect height="${r}" y="${s-r}" width="${n}" onmousemove="showTooltip(evt, '${o}: ${i} ${e}');" onmouseout="hideTooltip();"></rect>\n        </g>`,s=t.total,n=t.yearly,o=n.length,i=3*o;Math.max(...n);const l=40/s;let c=`<svg id="svgSpark" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="chart" height="40" width="${i}" aria-labelledby="title" role="img">`;for(let e=0;e<o;e++){const t=n[e].year,a=n[e].count;c+=r(e,"bar",a*l,40,3,t,a)}c+="</svg>",c+=`<span>~${Math.ceil(s/1e3)}K</span> ${e} extracted from <span>~${Math.ceil(a/1e3)}K</span> species over the years`,document.querySelector("#sparkBox").innerHTML=c})(e,t,r)},y=()=>{log.info("- form2qs()");const a=new URLSearchParams;let r=!0;if("ss"===(!0===e("input[name=searchtype").checked?"as":"ss"))log.info("- form2qs(): simple search"),Array.from(t("form input.query")).filter((e=>e.value)).forEach((e=>{let t=e.name,r=e.value;if("q"===e.name){const s=e.value.replaceAll(/ & /g,"%20%26%20");new URLSearchParams(s).forEach(((e,s)=>{if(""===e){const e=r.match(/(^10\.[0-9]{4,}.*)/);e&&e[1]?(t="articleDOI",r=e[1]):(t="q",r=s)}else t=s,r=e;a.append(t,r)}))}else"radio"===e.type||"checkbox"===e.type?(e.checked||"true"===e.checked)&&a.append(t,r):a.append(t,r)}));else{log.info("- form2qs(): advanced search");const t=t=>{const r=e(`input[name=${t}]`);(r.checked||"true"===r.checked)&&a.append(t,r.value)};["page","size","resource","refreshCache"].forEach((e=>t(e)));const s=t=>{const r=e(`input[name="as-${t}"]`);r.value&&a.append(t,r.value)};["q","treatmentTitle","authorityName","articleTitle","journalTitle"].forEach((e=>s(e)));const n=t=>{const r=e(`input[name="as-${t}"]`);(r.checked||"true"===r.checked)&&a.append(t,r.value)};["status","refreshCache"].forEach((e=>n(e)));const o=t=>{const r=e(`select[name="as-${t}"]`),s=r.selectedIndex,n=r.options[s].value;if(n)if("journalYear"===t||"biome"===t)a.append(t,n);else if("between"===n){const r=e(`input[name="as-${t}From`),s=r.value,n=e(`input[name="as-${t}To`),o=n.value;if(s&&o)a.append(t,`between(${s} and ${o})`);else{let e=!0;if(""===s&&(r.classList.add("required"),e=!1),""===o&&(n.classList.add("required"),e=!1),!e)return!1}}else{const r=e(`input[name="as-${t}From`),s=r.value;if(!s)return r.classList.add("required"),!1;a.append(t,`${n}(${s})`)}return!0},i=["journalYear","publicationDate","checkinTime","biome"];for(const e of i){if(!o(e)){r=!1;break}}}if(r){return a.toString()}return!1},v=e=>{log.info("- updateUrl(qs)"),history.pushState("",null,`?${e}`)},$=()=>{log.info("- addListeners()"),e("#refreshCache").addEventListener("click",E),e("#ns-go").addEventListener("click",z),e("#as-go").addEventListener("click",D),e("#q").addEventListener("focus",C),e("#search-help").addEventListener("click",b),e("div.examples").addEventListener("toggle",S,!0),t(".modalToggle").forEach((e=>e.addEventListener("click",I))),t(".reveal").forEach((e=>e.addEventListener("click",A)));t(".example-insert").forEach((e=>e.addEventListener("click",x)));t("input[name=searchType").forEach((e=>e.addEventListener("click",L)));e("#button-1").addEventListener("click",w);t(".resource input").forEach((e=>e.addEventListener("click",q)));const a=e('select[name="as-publicationDate"]'),r=e('select[name="as-checkinTime"]');a.addEventListener("change",H),r.addEventListener("change",H),t("input[type=date").forEach((e=>e.addEventListener("change",k)))},b=t=>{e(".examples").classList.contains("hidden")?e(".examples").classList.remove("hidden"):e(".examples").classList.add("hidden")},k=e=>{e.target.classList.contains("required")&&e.target.classList.remove("required")},T=t=>{e(".warn").classList.contains("hidden")&&(e(".warn").innerHTML=t,e(".warn").classList.remove("hidden"),e("#throbber").classList.add("nothrob"),setTimeout((()=>{e(".warn").innerHTML="",e(".warn").classList.add("hidden")}),3e3))},w=t=>{log.info("- toggling advanced search"),e("#as-container").classList.toggle("noblock");e("input[name=searchtype]").checked?(e("#q").value="",e("#q").placeholder="use advanced search below",e("#q").disabled=!0,e("#refreshCache").disabled=!0,e("#clear-q").disabled=!0,e('input[name="as-q"]').focus()):(e("#q").placeholder="search for something",e("#q").disabled=!1,e("#refreshCache").disabled=!1,e("#clear-q").disabled=!1)},L=a=>{e("#fancySearch").classList.toggle("hidden"),e("#fancySearch").classList.toggle("noblock"),e("#normalSearch").classList.toggle("hidden"),e("#normalSearch").classList.toggle("noblock");const r=Array.from(t("input[name=searchType]")).filter((e=>e.checked))[0].value;if(a){if("true"===a.target.dataset.checked){const t=e("input[name=searchType][data-checked=false]");t.dataset.checked=!0,t.checked=!0,a.target.dataset.checked="false",a.target.checked=!1}else{const t=e("input[name=searchType][data-checked=true]");t.dataset.checked=!1,t.checked=!1,a.target.dataset.checked="true",a.target.checked=!0}const s="fs"===r?"#fs":window.location.pathname;history.pushState?history.pushState(null,null,s):location.hash=s;const n=Array.from(t("input[name=resource]")),o=n.filter((e=>e.checked))[0],i=n.filter((e=>!e.checked&&e.value===o.value))[0];o.checked=!1,i.checked=!0}else{e("ns"===r?"#switchSearch-1":"#switchSearch-2").checked=!0}},q=e=>{const a=Array.from(t("input[name=resource]")).filter((e=>e.checked))[0];g(a.value)},S=e=>{if(e.target.open){var a=t("details[open]");Array.prototype.forEach.call(a,(function(t){t!==e.target&&t.removeAttribute("open")}))}},x=a=>{e("#q").value=a.target.textContent,e("#ns-go").classList.add("glowing");t("input[name=source").forEach((e=>{"treatments"===e.value&&(e.checked=!0)})),b(),a.stopPropagation(),a.preventDefault()},E=t=>{e("#refreshCache").toggleAttribute("data-pop-show")},z=t=>{""===e("#q").value?C(t):(e("#q").classList.remove("red-placeholder"),e("#throbber").classList.remove("nothrob"),e("#ns-go").classList.remove("glowing"),f()),t.stopPropagation(),t.preventDefault()},D=t=>{e("#throbber").classList.remove("nothrob"),f(),t.stopPropagation(),t.preventDefault()},I=r=>{const s=new URL(r.target.href).hash,n=t(".modal");s.length>0?(n.forEach((e=>{e.classList.add(...a.hiddenClasses)})),e(s).classList.remove(...a.hiddenClasses)):n.forEach((e=>e.classList.add(...a.hiddenClasses)))},C=t=>{e("#q").placeholder="search for something",e("#q").classList.remove("red-placeholder"),t.stopPropagation(),t.preventDefault()},A=e=>{const t=e.target.innerText;e.target.innerText=e.target.dataset.reveal,setTimeout((()=>{e.target.innerHTML=t}),2e3),e.stopPropagation(),e.preventDefault()},R=()=>{const e=t("figcaption > details");for(let t=0,a=e.length;t<a;t++)e[t].addEventListener("toggle",(a=>{const r=a.target.querySelector("summary"),s=r.dataset.title,n=s.length>30?`${s.substring(0,30)}…`:s;e[t].open?r.innerText=s:r.innerText=n}))},j=()=>{log.info("- listeners.addListenersToPagerLinks()")},U=()=>{const e=t("figure .reveal");for(let t=0,a=e.length;t<a;t++)e[t].addEventListener("click",A)},H=e=>{if("between"===e.target.value){e.target.parentNode.querySelectorAll(".hidden").forEach((e=>{e.classList.contains("hidden")&&(e.classList.remove("hidden"),e.classList.add("vis"))}))}else{e.target.parentNode.querySelectorAll(".vis").forEach((e=>{e.classList.add("hidden"),e.classList.remove("vis")}))}};function O(e,t){const a=document.getElementById("tooltip");a.innerHTML=t,a.style.display="block",a.style.left=e.offsetX+"px",a.style.top=e.offsetY+"px"}function M(){document.getElementById("tooltip").style.display="none"}const N="localhost"===window.location.hostname?"INFO":"ERROR";log.level=log[N];const F=()=>{const e=new URL(location),t="#fs"===e.hash?"fs":"ns";if(P(t),"fs"===t&&q(),e.search){(e=>{log.info("loadBookmarkedWebSite(qs)"),log.info(`- qs: ${e}`),$(),s(e),e=y(),p(e)})(e.search.substring(1))}else(async()=>{log.info("loadBlankWebSite()"),$(),g("images")})()},P=s=>{log.info("initializing fancySearch");const n=e=>async t=>{const a=await t.json(),r=[];return"biome"===e&&(e="biome_synonym"),a.item.result.records?a.item.result.records.forEach((t=>r.push(t[e]))):r.push("nothing found… please try again"),r},o=[{key:"text contains",actualKey:"q",values:"",prompt:"search the full text of treatments",noDuplicates:!0},{key:"title",actualKey:"treatmentTitle",values:"",prompt:"search for treatmentTitles starting with the search term",noDuplicates:!0},{key:"authority",actualKey:"authorityName",values:{url:`${a.server}/treatmentAuthors?treatmentAuthor=`,cb:n("author")},prompt:"type at least 3 letters to choose an author",noDuplicates:!0},{key:"family",actualKey:"family",values:{url:`${a.server}/families?family=`,cb:n("family")},prompt:"type at least 3 letters to choose a family",noDuplicates:!1},{key:"kingdom",actualKey:"kingdom",values:{url:`${a.server}/kingdoms?kingdom=`,cb:n("kingdom")},prompt:"type at least 3 letters to choose a kingdom",noDuplicates:!1},{key:"phylum",actualKey:"phylum",values:{url:`${a.server}/phyla?phylum=`,cb:n("phylum")},prompt:"type at least 3 letters to choose a phylum",noDuplicates:!1},{key:"class",actualKey:"class",values:{url:`${a.server}/classes?class=`,cb:n("class")},prompt:"type at least 3 letters to choose a class",noDuplicates:!1},{key:"genus",actualKey:"genus",values:{url:`${a.server}/genera?genus=`,cb:n("genus")},prompt:"type at least 3 letters to choose a genus",noDuplicates:!1},{key:"order",actualKey:"order",values:{url:`${a.server}/orders?order=`,cb:n("order")},prompt:"type at least 3 letters to choose an order",noDuplicates:!1},{key:"journal year",actualKey:"journalYear",values:((e,t)=>{const a=t-e;return Array.from({length:a},((t,a)=>a+e)).map((e=>String(e)))})(1995,2022),prompt:"pick a year of publication",noDuplicates:!0},{key:"biome",actualKey:"biome",values:{url:`${a.server}/biomes?biome=`,cb:n("biome")},prompt:"type at least 3 letters to choose a biome",noDuplicates:!1}];new r({selector:e("#fs-container"),helpText:"search images",facets:o,cb:a=>{const r=new URLSearchParams(a),s=Array.from(t("input[name=resource]")).filter((e=>e.checked))[0].value,n=e("input[name=page").value,o=e("input[name=size").value;r.append("resource",s),r.append("page",n),r.append("size",o);const i=r.toString();v(i),p(i)}}),e("#fancySearch").classList.add("hidden"),e("#fancySearch").classList.add("noblock"),"fs"===s&&L()};export{M as hideTooltip,F as init,O as showTooltip};
