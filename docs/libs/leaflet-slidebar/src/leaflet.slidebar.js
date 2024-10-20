const Slidebar = L.Control.extend({
    //includes: L.Mixin.Events,
    //includes: L.Evented,
    
    options: {
        content: '<i>Click on a marker for more info</i>',

        // 'full' | 'half' | 'quarter' | 'closed'
        state: 'full',

        threshold: 50,
        doubleThreshold: 200
    },

    initialize: function(options) {
        L.Util.setOptions(this, options);
        
        this.on('swipeup', function(evt) {
            let targetSize;

            if (evt.value > this.options.doubleThreshold) {
                //this.toggleSize('full');
                targetSize = 'full';
            } 
            else {
                switch (this._size) {
                    case 'closed':
                        //this.toggleSize('quarter');
                        targetSize = 'quarter';
                        break;
                    case 'quarter':
                        //this.toggleSize('half');
                        targetSize = 'half';
                        break;
                    case 'half':
                        //this.toggleSize('full');
                        targetSize = 'full';
                        break;
                }
            }

            this.toggleSize(targetSize);
        });

        this.on('swipedown', function(evt) {
            let targetSize;

            if (evt.value > this.options.doubleThreshold) {
                //this.toggleSize('closed');
                targetSize = 'closed';
            } 
            else {
                switch (this._size) {
                    case 'full':
                        //this.toggleSize('half');
                        targetSize = 'half';
                        break;
                    case 'half':
                        //this.toggleSize('quarter');
                        targetSize = 'quarter';
                        break;
                    case 'quarter':
                        //this.toggleSize('closed');
                        targetSize = 'closed';
                        break;
                }
            }

            this.toggleSize(targetSize);
        });

        return this;
    },

    toggleSize: function(targetSize) {
        const el = document.querySelector('#leaflet-slidebar');
        const sizes = [ 'closed', 'quarter', 'half', 'full' ];
        sizes.forEach(s => el.classList.remove(s));
        el.classList.add(targetSize);
        this._size = targetSize;
        
        // Create the event
        //const event = new CustomEvent("sizeToggled", { "detail": "Info window size was toggled" });

        // Dispatch/Trigger/Fire the event
        //this.dispatchEvent(event);
        //this.fire("sizeToggled")
    },

    onAdd: function(map) {

        // if no container was specified or not found, create it with id and 
        // class 'leaflet-slidebar'
        if (!this._div) {
            this._div = L.DomUtil.create('div', 'leaflet-slidebar');
            this._div.classList.add(this.options.state);
            this._div.id = 'leaflet-slidebar';
            this._size = this.options.state;

            L.DomUtil.create('hr', '', this._div);
            //L.DomEvent.on(hr, 'click', this.toggleSize, this);

            // TO FIX: turned off navbar construction for now because of the 
            // conflict between touch and click events.

            // this._div.innerHTML = `
            //     <nav>
            //         <ul class="right">
            //             <li><button name="full" title="maximize the info window" data-lat="" data-lng="">&#9633;</button></li>
            //             <li><button name="half" title="set info window to half size" data-lat="" data-lng="">&lrtri;</button></li>
            //             <li><button name="quarter" title="set info window to a quarter size" data-lat="" data-lng="">&mdash;</button></li>
            //             <li><button name="closed" title="close the info window" data-lat="" data-lng="">&times;</button></li>
            //         </ul>
            //     </nav>`;
            //this._div.innerHTML += '<main></main>';
            L.DomUtil.create('main', '', this._div);
        }

        // Note: We return 'this._div' here, not 'this'
        return this._div;
    },

    onRemove: function(map) {

        // nothing to be done
        return this;
    },

/*
       ◀──────────  x   ─────────▶                                                                                                 max_x,
                                                                                                                                   max_y 
  ▲    ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
  │    │                         │     │                         │     │                         │     │                         │
  │    │                         │     │                         │     │                         │     │                         │
  │    │           ▲•            │     │                         │     │                         │     │                         │
  │    │           │          o  │     │           ▲•         o  │     │                      o  │     │                      o ◀┼─ clicked
  │    │┌──────────┼────────────┐│     │           │             │     │                         │     │                         │  marker 
  │    ││          │            ││     │     0.25y │             │     │           ▲•            │     │                         │
  │    ││    0.375y│            ││     │           │             │     │     0.125y│             │     │                         │
  │    ││          │            ││     │┌──────────┼────────────┐│     │           │             │     │                         │
  │    ││          ▼x ◀─────────┼┼─────┼┼──────────▼x ──────────┼┼─────┼───────────▼x ───────────┼─────┼─────────── • ───────────┼─ center 
       ││                       ││     ││                       ││     │                         │     │                         │
  y    ││                       ││     ││                       ││     │                         │     │                         │
       ││                       ││     ││                       ││     │                         │     │                         │
  │    ││                       ││     ││                       ││     │                         │     │        0y               │
  │    ││                       ││     ││                       ││     │┌───────────────────────┐│     │                         │
  │    ││                       ││     ││                       ││     ││                       ││     │                         │
  │    ││       sliding         ││     ││                       ││     ││                       ││     │                         │
  │    ││        panel          ││     ││                       ││     ││                       ││     │                         │
  │    ││                       ││     ││                       ││     ││                       ││     │                         │
  ▼    └┴───────────────────────┴┘     └┴───────────────────────┴┘     └┴───────────────────────┴┘     └─────────────────────────┘
     min_x,
     min_y
*/

    reCenter: function(latlng) {
        const centerPx = this._map.latLngToLayerPoint(latlng);
        const newCenterPx = [];
        const { min, max } = this._map.getPixelBounds();

        if (document.body.clientWidth < 400) {
            const y = max.y - min.y;
            let delta = 0;
            
            if (this._size === 'full') {
                delta = 0.375;
            }
            else if (this._size === 'half') {
                delta = 0.25;
            }
            else if (this._size === 'quarter') {
                delta = 0.125;
            }

            newCenterPx.push(centerPx.x, centerPx.y + (delta * y));
        }
        else {
            newCenterPx.push(centerPx.x, centerPx.y);
        }

        const newCenter = this._map.layerPointToLatLng(newCenterPx);
        this._map.flyTo(newCenter);
    },

    update: async function({ content, latlng }) {
        
        //this._div.innerHTML = content;
        const main = this._div.querySelector('#leaflet-slidebar main');
        main.innerHTML = content;
        this._newCenter = latlng;

        if (this._size === 'closed') {
            this.toggleSize('full');
        }

        this.reCenter(this._newCenter);
        
        // const buttons = document.querySelectorAll('#leaflet-slidebar ul.right button');
        // buttons.forEach((button) => {
        //     button.dataset.lat = latlng.lat;
        //     button.dataset.lng = latlng.lng;
        // });

        return this;
    },

    /**
     * @method addTo(map: Map): this
     * Adds the control to the given map. 
     * Overrides the implementation of L.Control, changing the DOM mount target 
     * from map._controlContainer.topleft to map._container
     */
    addTo: function (map) {
        this.onRemove();
        this._map = map;
        this._container = this.onAdd(map);

        L.DomUtil.addClass(this._container, 'leaflet-slidebar');
 
        if (L.Browser.touch) {
            L.DomUtil.addClass(this._container, 'leaflet-touch');
        }
        
        // when adding to the map container, we should stop event propagation
        L.DomEvent.disableScrollPropagation(this._container);
        L.DomEvent.disableClickPropagation(this._container);

        L.DomEvent.on(
            this._container, 
            'contextmenu', 
            L.DomEvent.stopPropagation
        );

        L.DomEvent.on(
            this._container, 
            'touchstart', 
            this._startSwipe, 
            this
        );

        L.DomEvent.on(
            this._container, 
            'touchend', 
            this._endSwipe, 
            this
        );

        // insert as first child of map container (important for css)
        map._container.insertBefore(this._container, map._container.firstChild);

        // const buttons = document.querySelectorAll('#leaflet-slidebar ul.right button');
        // const that = this;
        // buttons.forEach((button) => {
        //     button.addEventListener('click', function fn(e) {
        //         that.toggleSize(button.name);
        //         const latlng = new L.LatLng(
        //             Number(button.dataset.lat), 
        //             Number(button.dataset.lng)
        //         );
        //         that.reCenter(latlng);
        //     });
        // });

        return this;
    },

    _startSwipe: function(evt) {
        const touch = evt.touches && evt.touches[0];

        if (!touch || !this._map) {
            return;
        }

        if (evt.target && evt.target.tagName == 'A') {
            return;
        }

        this._startPoint = this._map.mouseEventToContainerPoint(touch);
        L.DomEvent.preventDefault(evt);
    },
    
    _endSwipe: function(evt) {
        const touch = evt.changedTouches && evt.changedTouches[0];

        if (!touch || !this._startPoint || !this._map) {
            return;
        }

        const endPoint = this._map.mouseEventToContainerPoint(touch);
        const diff = endPoint.subtract(this._startPoint),
            absX = Math.abs(diff.x),
            absY = Math.abs(diff.y);
        this._startPoint = null;

        if (absX < this.options.threshold && absY < this.options.threshold) {

            // Not enough distance
            return;
        }

        if (absX / absY > 0.5 && absX / absY < 2) {

            // Unclear direction
            return;
        }

        let direction;
        let value;

        if (absX > absY) {
            value = absX;
            direction = diff.x < 0 ? 'left' : 'right';
        } 
        else {
            value = absY;
            direction = diff.y < 0 ? 'up' : 'down';
        }

        this.fire('swipe' + direction, {
            direction,
            value
        });
    }
});

// The proper way to create Evented control
// https://stackoverflow.com/a/49551041/183692
L.extend(Slidebar.prototype, L.Evented.prototype);

export { Slidebar }