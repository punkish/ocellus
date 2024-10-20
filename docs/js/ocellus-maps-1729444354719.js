/* generated: Sun Oct 20 2024 19:12:34 GMT+0200 (Central European Summer Time) */
const e=e=>document.querySelector(e);const t={fetchOpts:{},uri:function(){const e="ocellus.localhost"===window.location.hostname,t="ocellus.local"===window.location.hostname,o="127.0.0.1"===window.location.hostname,i="localhost"===window.location.hostname;let n="https://test.zenodeo.org/v3",a="https://maps.zenodeo.org";return(e||t||o||i)&&(n=`http://${window.location.hostname}:3010/v3`,a=`http://${window.location.hostname}:3000`),{zenodeo:n,maps:a,zenodo:"https://zenodo.org",treatmentBank:"https://tb.plazi.org/GgServer/html"}}(),cache:{images:{yearlyCounts:!1,totals:!1},treatments:{yearlyCounts:!1,totals:!1},journals:null,collectionCodes:null,bins:{}},figureSize:{normal:250,small:100,tiny:50},defaultPlaceholder:"search images",results:{totalCount:0,figures:[],page:1,size:30},resources:["treatments","citations","images"],pseudoResources:["about","ip","contact","privacy"],params:{notValidQ:["resource","page","size","grid","refreshCache","cols"],validImages:["httpUri","caption","captionText","q","treatmentId","treatmentTitle","articleTitle","treatmentDOI","articleDOI","zenodoDep","authorityName","collectionCode","status","journalTitle","journals_id","journalYear","kingdom","phylum","class","family","order","genus","species","publicationDate","checkinTime","latitude","longitude","geolocation","isOnLand","validGeo","eco_name","biome","biome_id"],validTreatments:["treatmentId","treatmentTitle","treatmentDOI","zenodoDep","articleTitle","articleDOI","publicationDate","journalYear","authorityName","status","checkinTime","validGeo","q","latitude","longitude","geolocation","eco_name","biome","isOnLand","journalTitle","kingdom","phylum","class","family","order","genus","species"],validCommon:["refreshCache","page","size","cols","groupby"],notValidSearchCriteria:["resource","communities","communitiesChooser","refreshCache","view","size","page","reset","submit","source","grid"]},cols:{images:["treatmentId","treatmentTitle","zenodoDep","treatmentDOI","articleTitle","articleAuthor","httpUri","caption","latitude","longitude"],treatments:["treatmentId","treatmentTitle","zenodoDep","treatmentDOI","articleTitle","articleAuthor","journalTitle","latitude","longitude"]},maps:{},hiddenClasses:["hidden","noblock"],closedFigcaptionHeight:"30px",H3ColorRamp:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],markerIcons:{default:L.icon({iconUrl:"/img/marker.png",iconSize:[24,38],iconAnchor:[12,38],popupAnchor:[0,0],shadowUrl:"/img/marker-shadow.png",shadowSize:[41,41],shadowAnchor:[11,37]}),active:L.icon({iconUrl:"/img/marker-active.png",iconSize:[24,38],iconAnchor:[12,38],popupAnchor:[0,0],shadowUrl:"/img/marker-shadow.png",shadowSize:[41,41],shadowAnchor:[12,38]}),clicked:L.icon({iconUrl:"/img/marker-clicked.png",iconSize:[24,38],iconAnchor:[12,38],popupAnchor:[0,0],shadowUrl:"/img/marker-shadow.png",shadowSize:[41,41],shadowAnchor:[12,38]})},months:["January","February","March","April","May","June","July","August","September","October","November","December"],charts:{termFreq:null,yearlyCounts:null}};async function o(e,o){if("imageMarkerClusters"in o&&e.hasLayer(o.imageMarkerClusters)&&(log.info("removing image marker clusters"),e.removeLayer(o.imageMarkerClusters),o.slidebar.remove()),"h3"in o)e.hasLayer(o.h3)||(log.info("re-adding existing h3 layer"),e.addLayer(o.h3),o.h3info.addTo(e));else{log.info("initializing h3 layer");const n=await async function(e){const o=`${t.uri.zenodeo}/bins/${e}`,n=await fetch(o,t.fetchOpts);if(n.ok){const e={type:"FeatureCollection",features:[]},t=["81033ffffffffff","83f293fffffffff"],o=await n.json();t.forEach((e=>delete o[e]));for(const[t,i]of Object.entries(o)){const o=Math.round(h3.cellArea(t,h3.UNITS.km2)),n={type:"Feature",properties:{numOfTreatments:i,area:o,density:i/o},geometry:{type:"Polygon",coordinates:[h3.cellToBoundary(t).map((e=>[e[1],e[0]]))]}};e.features.push(n)}return i(e),e}alert("HTTP-Error: "+n.status)}(3),a=n.features.map((e=>e.properties.density)),r=1/Math.min(...a),l=function({data:e,scaleFactor:t,colorRamp:o,typeOfBins:i}){const n=o.length,a=[];if("equalWidth"===i){const t=Object.values(e);t.reduce(((e,t)=>e+t));const i=Math.max(...t)+1,r=Math.min(...t),l=(i-r)/n;let s=0;for(let e=r;e<i;e+=l){const t=e+l,i=o[s];a.push({from:Math.round(e),to:Math.round(t),fillColor:i,num:0}),s++}a.forEach((t=>{t.num=Object.values(e).filter((e=>e>=t.from&&e<t.to)).length}))}else if("equalFreq"===i){const i=Object.keys(e).length,r=Math.round(i/n),l=[];for(const[o,i]of Object.entries(e))l.push({id:o,num:Math.round(i*t)});const s=l.sort(((e,t)=>e.num-t.num));for(let e=0;e<n;e++){const t=e*r,i=t+r,n=s.slice(t,i),l=n[0].num,c=n[n.length-1].num;a[e]={from:l,to:c,fillColor:o[e],num:n.length}}}return a}({data:a,scaleFactor:r,colorRamp:t.H3ColorRamp,typeOfBins:"equalFreq"}),s=function(e){let t="#f5f5f5",o=0;const i=e.properties.density*r;return i>0&&(t=function(e,t){for(let o=0,i=t.length;o<i;o++)if(e>=t[o].from&&e<t[o].to)return t[o].fillColor}(i,l),o=.7),{fillColor:t,color:"grey",weight:0,fillOpacity:o}};o.h3=L.geoJSON(n,{style:s,onEachFeature:(e,t)=>{t.on({mouseover:e=>{!function({mapLayers:e,bin:t}){t.setStyle({weight:2,color:"#666",dashArray:"",fillOpacity:.1}),L.Browser.ie||L.Browser.opera||L.Browser.edge||t.bringToFront();e.h3info.update(t.feature.properties)}({mapLayers:o,bin:e.target})},mouseout:e=>{!function({mapLayers:e,bin:t}){e.h3.resetStyle(t),e.h3info.update()}({mapLayers:o,bin:e.target})}})}}),e.addLayer(o.h3),function(e,t){const o=L.control(),i="Hover over a bin to see num of images";o.onAdd=function(e){return this._div=L.DomUtil.create("div","h3info"),this._div.innerHTML=i,this._div},o.update=function(e){this._div.innerHTML=e?`${e.numOfTreatments} treatments in ${e.area} km<sup>2</sup>`:i},t.h3info=o,o.addTo(e)}(e,o)}}function i(e){const{type:t}=e;if("FeatureCollection"===t)return void e.features.map(i);const{type:o,coordinates:r}=e.geometry;switch(o){case"LineString":return void n(r);case"Polygon":return void a(r);case"MultiPolygon":return void r.forEach((e=>a(e)));default:throw new Error(`Unknown geometry type: ${o}`)}}function n(e){let t=!1;for(let o=0;o<e.length;o++)if(Math.abs(e[0][0]-e[(o+1)%e.length][0])>180){t=!0;break}t&&e.forEach((e=>function(e){const t=e[0];e[0]=t<0?t+360:t}(e)))}function a(e){e.forEach((e=>n(e)))}const r=L.Control.extend({options:{content:"<i>Click on a marker for more info</i>",state:"full",threshold:50,doubleThreshold:200},initialize:function(e){return L.Util.setOptions(this,e),this.on("swipeup",(function(e){let t;if(e.value>this.options.doubleThreshold)t="full";else switch(this._size){case"closed":t="quarter";break;case"quarter":t="half";break;case"half":t="full"}this.toggleSize(t)})),this.on("swipedown",(function(e){let t;if(e.value>this.options.doubleThreshold)t="closed";else switch(this._size){case"full":t="half";break;case"half":t="quarter";break;case"quarter":t="closed"}this.toggleSize(t)})),this},toggleSize:function(e){const t=document.querySelector("#leaflet-slidebar");["closed","quarter","half","full"].forEach((e=>t.classList.remove(e))),t.classList.add(e),this._size=e},onAdd:function(e){return this._div||(this._div=L.DomUtil.create("div","leaflet-slidebar"),this._div.classList.add(this.options.state),this._div.id="leaflet-slidebar",this._size=this.options.state,L.DomUtil.create("hr","",this._div),L.DomUtil.create("main","",this._div)),this._div},onRemove:function(e){return this},reCenter:function(e){const t=this._map.latLngToLayerPoint(e),o=[],{min:i,max:n}=this._map.getPixelBounds();if(document.body.clientWidth<400){const e=n.y-i.y;let a=0;"full"===this._size?a=.375:"half"===this._size?a=.25:"quarter"===this._size&&(a=.125),o.push(t.x,t.y+a*e)}else o.push(t.x,t.y);const a=this._map.layerPointToLatLng(o);this._map.flyTo(a)},update:async function({content:e,latlng:t}){return this._div.querySelector("#leaflet-slidebar main").innerHTML=e,this._newCenter=t,"closed"===this._size&&this.toggleSize("full"),this.reCenter(this._newCenter),this},addTo:function(e){return this.onRemove(),this._map=e,this._container=this.onAdd(e),L.DomUtil.addClass(this._container,"leaflet-slidebar"),L.Browser.touch&&L.DomUtil.addClass(this._container,"leaflet-touch"),L.DomEvent.disableScrollPropagation(this._container),L.DomEvent.disableClickPropagation(this._container),L.DomEvent.on(this._container,"contextmenu",L.DomEvent.stopPropagation),L.DomEvent.on(this._container,"touchstart",this._startSwipe,this),L.DomEvent.on(this._container,"touchend",this._endSwipe,this),e._container.insertBefore(this._container,e._container.firstChild),this},_startSwipe:function(e){const t=e.touches&&e.touches[0];t&&this._map&&(e.target&&"A"==e.target.tagName||(this._startPoint=this._map.mouseEventToContainerPoint(t),L.DomEvent.preventDefault(e)))},_endSwipe:function(e){const t=e.changedTouches&&e.changedTouches[0];if(!t||!this._startPoint||!this._map)return;const o=this._map.mouseEventToContainerPoint(t).subtract(this._startPoint),i=Math.abs(o.x),n=Math.abs(o.y);if(this._startPoint=null,i<this.options.threshold&&n<this.options.threshold)return;if(i/n>.5&&i/n<2)return;let a,r;i>n?(r=i,a=o.x<0?"left":"right"):(r=n,a=o.y<0?"up":"down"),this.fire("swipe"+a,{direction:a,value:r})}});async function l(e,o){const i=e.getBounds(),n=await async function(e){const o=e.getSouthWest().lat,i=e.getSouthWest().lng,n=e.getNorthEast().lat,a=e.getNorthEast().lng,r=`${t.uri.zenodeo}/images?geolocation=within(min_lat:${o},min_lng:${i},max_lat:${n},max_lng:${a})&cols=treatmentId&cols=treatmentTitle&cols=latitude&cols=longitude&size=5000`,l=await fetch(r,t.fetchOpts);if(l.ok)return(await l.json()).item.result.records;alert("HTTP-Error: "+l.status)}(i);o.imageMarkerClusters||(o.imageMarkerClusters=L.markerClusterGroup({disableClusteringAtZoom:10}));const a=[];n.forEach((i=>{const n=i.images_id;if(!o.imageMarkers.has(n)){const r=i.treatmentId,l={title:r,icon:t.markerIcons.default},s=new L.LatLng(i.latitude,i.longitude),c=L.marker(s,l);c.on("click",(async function(l){const c=l.target;c.setIcon(t.markerIcons.active);const d=await async function(e){if(!e)return"Click on an image marker for more info";{const o=e.treatmentId,i=`${t.uri.zenodeo}/images?id=${e.images_id}&cols=httpUri&cols=caption`;let n=`<h3>${e.treatmentTitle}</h3>`;const a=await fetch(i,t.fetchOpts);if(a.ok){const e=(await a.json()).item.result.records[0];if(e.httpUri){const i=250,a=e.httpUri.split("/")[4];let r;r=e.httpUri.indexOf("zenodo")>-1?e.httpUri.indexOf(".svg")>-1?"/img/kein-preview.png":`${t.uri.zenodo}/api/iiif/record:${a}:figure.png/full/250,/0/default.jpg`:`${e.httpUri}/singlefigAOF/`,n+=`\n                <figure class="figure-${i}">\n                    <img src="../img/bug.gif" width="${i}" data-src="${r}" \n                        class="lazyload" data-recid="${a}">\n                    <figcaption>${e.captionText} <a href="${t.uri.treatmentBank}/treatments?treatmentId=${o}" target="_blank">more on TB</a></figcaption>\n                </figure>`}else n+=`<a href="${t.uri.treatmentBank}/treatments?treatmentId=${o}" target="_blank">more on TB</a>`;return n}}}(i);o.slidebar.update({content:d,latlng:s});document.querySelector("#leaflet-slidebar").style.visibility="visible",function(e,t,o){const i=e.getCenter(),n=Math.round(1e5*i.lat)/1e5,a=Math.round(1e5*i.lng)/1e5,r=e.getZoom();let l=`#show=maps&lat=${n}&lng=${a}&zoom=${r}&treatmentId=${t}-${o}`;const s={zoom:r,center:{lat:n,lng:a}};window.history.pushState(s,"map",l)}(e,r,n),o.imageMarkerClusters.getVisibleParent(c);const u=a[a.length-1];u&&u.setIcon(t.markerIcons.clicked),a.push(c)})),o.imageMarkers.set(n,c),o.imageMarkerClusters.addLayer(c)}})),e.addLayer(o.imageMarkerClusters)}async function s(e,t){"h3"in t&&e.hasLayer(t.h3)&&(log.info("removing h3 layer"),e.removeLayer(t.h3),t.h3info.remove()),"imageMarkerClusters"in t?(log.info("re-adding existing image marker clusters"),await l(e,t),t.slidebar.addTo(e)):(log.info("initializing image marker clusters"),function(e,t){t.slidebar=new r({state:"closed"}),t.slidebar.addTo(e)}(e,t),t.imageMarkers=new Map,await l(e,t))}async function c({baseLayerSource:e,map:o}){const i={minZoom:1,maxZoom:17,zoomOffset:-1,tileSize:512};let n;if("arcgis"===e)i.attribution="&copy; ESRI",n=L.tileLayer("https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",i).addTo(o);else if("geodeo"===e){const e=`${t.uri.maps}/nev_raster/{z}/{x}/{y}`,i={ne_50m_admin_1_states_provinces_lakes:{maxZoom:2,tms:!0,styles:{weight:1,color:"blue",fillColor:"",fillOpacity:.5,fill:!0}},ne_50m_admin_0_countries:{maxZoom:2,tms:!0,styles:{weight:1,color:"#444",fillColor:"f5f5f5",fillOpacity:.25,fill:!0}},ne_10m_admin_1_sel:{maxZoom:5,tms:!0,styles:{weight:1,color:"#444",fillColor:"#f5f5f5",fillOpacity:.25,fill:!0}},nev:{maxNativeZoom:7,maxZoom:10,tms:!0,vectorTileLayerStyles:{playa:{stroke:!0,weight:1,color:"aliceblue",fillColor:"aliceblue",fillOpacity:.25,fill:!0},urban:{stroke:!0,weight:1,color:"bisque",fillColor:"bisque",fillOpacity:.25,fill:!0},water:{stroke:!0,weight:1,color:"black",fillColor:"lightblue",fillOpacity:.25,fill:!0},ice:function(e){return"glacier"===e.type?{weight:1,color:"white",fillColor:"white",fillOpacity:.45,fill:!0}:"ice_shelf"===e.type?{weight:1,color:"white",fillColor:"lightgrey",fillOpacity:.45,fill:!0}:void 0},river:{weight:1,color:"blue",fillColor:"",fillOpacity:1,fill:!1},railroad:{stroke:!0,weight:1,color:"brown"},road:{weight:1,color:"#ffcc00",fillColor:"",fillOpacity:1,fill:!1},country_label:{stroke:!1,fill:!1},state_label:{stroke:!1,fill:!1},marine_label:{stroke:!1,fill:!1},lake_label:{stroke:!1,fill:!1},place_label:{stroke:!1,fill:!1},airport_label:{stroke:!1,fill:!1},port_label:{stroke:!1,fill:!1},admin:function(e,t){const o=e.admin_level;return 0===o?{weight:1,color:"#444",fill:!1}:1===o?{weight:.5,color:"#444",fill:!1}:2===o?{weight:1,color:"#cf52d3",dashArray:"2, 6",fillColor:"green",fillOpacity:.25,fill:!0}:void 0}}},nev_raster:{maxZoom:15,tms:!0}};L.tileLayer(e,{maxNativeZoom:6,maxZoom:10,tms:!0}).addTo(o);const n="nev",a=i[n];L.vectorGrid.protobuf(`${t.uri.maps}/${n}/{z}/{x}/{y}`,a).addTo(o)}else if("gbif"===e){i.attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> / &copy; <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>';const e=parseInt(window.devicePixelRatio)||1;n=L.tileLayer("https://tile.gbif.org/3857/omt/{z}/{x}/{y}@{r}x.png?style=gbif-natural".replace("{r}",e),i).addTo(o)}return n}async function d({mapContainer:o,baseLayerSource:i,drawControl:n}){if(t.maps[o])"map"===o&&(e("#not-map").classList.add("hidden"),e("#map").classList.remove("hidden"));else{const{zoom:a,lat:r,lng:l,treatmentId:s}=function({zoom:e,lat:t,lng:o,treatmentId:i}){const n=new URLSearchParams(window.location.hash.substring(1));return{zoom:e=parseInt(n.get("zoom"),10)||e,lat:t=parseFloat(n.get("lat"))||t,lng:o=parseFloat(n.get("lng"))||o,treatmentId:i=n.get("treatmentId")||i}}({zoom:5,lat:0,lng:0}),d=L.map(o).setView({lat:r,lng:l},a);!function(e){let t=!0;e.on("moveend",(function(){if(!t)return void(t=!0);const o=e.getCenter(),i=Math.round(1e5*o.lat)/1e5,n=Math.round(1e5*o.lng)/1e5,a=e.getZoom(),r=window.location.pathname.split(".").shift().substring(1);let l;"maps"===r?l=`#lat=${i}&lng=${n}&zoom=${a}`:"index"===r&&(l=`#show=maps&lat=${i}&lng=${n}&zoom=${a}`);const s=new URLSearchParams(window.location.hash.substring(1)).get("treatmentId")||void 0;s&&(l+=`&treatmentId=${s}`);const c={zoom:a,center:{lat:i,lng:n}};window.history.pushState(c,"map",l)})),window.addEventListener("popstate",(function(o){null!==o.state&&(e.setView(o.state.center,o.state.zoom),t=!1)}))}(d),t.maps[o]=d,d.attributionControl.setPrefix(""),d.on("moveend",(async function(e){await u(d,h)}));const h={baseLayer:c({baseLayerSource:i,map:d})};if(n&&function(t,o){o.drawControls=new L.FeatureGroup,function(e,t){e.hasLayer(t)||e.addLayer(t)}(t,o.drawControls);const i={position:"topleft",draw:{polyline:!1,polygon:!1,circle:{shapeOptions:{weight:1}},rectangle:{shapeOptions:{clickable:!1,weight:1}},circlemarker:!1,marker:!1},edit:{featureGroup:o.drawControls}},n=new L.Control.Draw(i);t.addControl(n),t.on(L.Draw.Event.CREATED,(function(t){const i=t.layerType,n=t.layer,a=e("#coords"),r=e("input[name=as-geolocation");if("rectangle"===i){const e=n.toGeoJSON().geometry.coordinates,[t,o,i,l,s]=e[0],c=t[1].toFixed(2),d=t[0].toFixed(2),u=i[1].toFixed(2),h=i[0].toFixed(2);a.innerHTML=`lower left: lat ${c}, lng: ${d}; upper right: lat ${u}, lng ${h}`,r.value=`within(min_lat:${c},min_lng:${d},max_lat:${u},max_lng:${h})`}else if("circle"===i){const e=t.layer.getLatLng(),o=e.lng.toFixed(2),i=e.lat.toFixed(2),n=(t.layer.getRadius()/1e3).toFixed(2);a.innerHTML=`within ${n} kms of ${o}, ${i}`,r.value=`within(radius:${n},units:'kilometers',lat:${i},lng:${o})`}o.drawControls.addLayer(n)})),t.on(L.Draw.Event.DELETED,(function(t){e("input[name=as-geolocation").value="",e("#coords").innerHTML=""}))}(d,h),await u(d,h),function(t){L.Control.CloseButton=L.Control.extend({onAdd:function(t){let o=t=>{e("#map").classList.add("hidden"),e("#not-map").classList.remove("hidden")};"maps"===window.location.pathname.split(".").shift().substring(1)&&(o=e=>window.location.href="index.html");const i=L.DomUtil.create("button","close-btn");return i.addEventListener("click",o),i},onRemove:function(e){}}),L.control.closeButton=function(e){return new L.Control.CloseButton(e)},L.control.closeButton({position:"topright"}).addTo(t)}(d),s){s.split("-");const e=h.imageMarkers.has(s);e&&(h.imageMarkerClusters.zoomToShowLayer(e),e.fireEvent("click"))}}}async function u(e,t){e.getZoom()<=5?o(e,t):await s(e,t)}var h;L.extend(r.prototype,L.Evented.prototype),log.level=log[(h=window.location.hostname,"localhost"===h?"INFO":"ERROR")];export{d as initializeMap};
