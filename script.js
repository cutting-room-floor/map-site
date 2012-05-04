var MB = {};

MB.maps = {};

MB.api = function(l) {
    return 'http://api.tiles.mapbox.com/v3/' + l.id + '.jsonp';
};

MB.map = function(el, l) {
    wax.tilejson(MB.api(l), function(t) {
        var handlers = [
            new MM.DragHandler(),
            new MM.DoubleClickHandler(),
            new MM.TouchHandler()
        ];
        if ($.inArray('zoomwheel',l.features) >= 0) {
            handlers.push(new MM.MouseWheelHandler());
        }

        MB.maps[el] = new MM.Map(el, new wax.mm.connector(t), null, handlers);
        MB.maps[el].setCenterZoom({
            lat: (l.center) ? l.center.lat : t.center[1],
            lon: (l.center) ? l.center.lon : t.center[0]
        }, (l.center) ? l.center.zoom : t.center[2]
        );

        if (l.zoomRange) {
            MB.maps[el].setZoomRange(l.zoomRange[0], l.zoomRange[1]);
        } else {
            MB.maps[el].setZoomRange(t.minzoom, t.maxzoom);
        }

        wax.mm.attribution(MB.maps[el], t).appendTo(MB.maps[el].parent);

        for (var i = 0; i < l.features.length; i++) {
            switch(l.features[i]) {
                case 'zoompan':
                    wax.mm.zoomer(MB.maps[el]).appendTo(MB.maps[el].parent);
                    break;
                case 'zoombox':
                    wax.mm.zoombox(MB.maps[el]);
                    break;
                case 'legend':
                    MB.maps[el].legend = wax.mm.legend(MB.maps[el], t).appendTo(MB.maps[el].parent);
                    break;
                case 'bwdetect':
                    wax.mm.bwdetect(MB.maps[el]);
                    break;
                case 'share':
                    wax.mm.share(MB.maps[el], t).appendTo(MB.maps[el].parent);
                    break;
                case 'tooltips':
                    MB.maps[el].interaction = wax.mm.interaction()
                        .map(MB.maps[el])
                        .tilejson(t)
                        .on(wax.tooltip()
                            .parent(MB.maps[el].parent)
                            .events()
                        );
                    break;
                case 'movetips':
                    MB.maps[el].interaction = wax.mm.interaction()
                        .map(MB.maps[el])
                        .tilejson(t)
                        .on(wax.movetip()
                            .parent(MB.maps[el].parent)
                            .events()
                        );
                    break;
            }
        }
    });
};

MB.refresh = function(m, l) {

    if (l.id) {
        wax.tilejson(MB.api(l), function(t) {
            var layer = l.layer || 0;
            try {
                MB.maps[m].setLayerAt(layer, new wax.mm.connector(t));
            } catch (e) {
                MB.maps[m].insertLayerAt(layer, new wax.mm.connector(t));
            }
            if (MB.maps[m].interaction) MB.maps[m].interaction.tilejson(t);
            if (MB.maps[m].legend) {
                MB.maps[m].legend.content(t);
            }
        });
    }

    if (l.center) {
        var lat = l.center.lat || MB.maps[m].getCenter().lat,
            lon = l.center.lon || MB.maps[m].getCenter().lon,
            zoom = l.center.zoom || MB.maps[m].getZoom();

        if (l.center.ease > 0) {
            MB.maps[m].easey = easey().map(MB.maps[m])
                .to(MB.maps[m].locationCoordinate({ lat: lat, lon: lon })
                .zoomTo(zoom)).run(l.center.ease);
        } else {
            MB.maps[m].setCenterZoom({ lat: lat, lon: lon }, zoom);
        }
    }
};

// Bind the geocoder functionality to any div with the format
//
//     <div data-control='geocode' id="search">
//        <form class="geocode">
//          <input placeholder='Search for an address' type="text">
//          <input type='submit' />
//          <div id='geocode-error'></div>
//        </form>
//      </div>
//
function bindGeocoder() {
    $('[data-control="geocode"] form').submit(function(e) {
        var m = $('[data-control="geocode"]').attr('data-map');
        // If this doesn't explicitly name the layer it should affect,
        // use the first layer in MB.maps
        if (!m) {
            for (var k in MB.maps) { m = k; break; }
        }
        e.preventDefault();
        geocode($('input[type=text]', this).val(), m);
    });
    var geocode = function(query, m) {
        query = encodeURIComponent(query);
        $('form.geocode').addClass('loading');
        reqwest({
            url: 'http://open.mapquestapi.com/nominatim/v1/search?format=json&json_callback=callback&&limit=1&q=' + query,
            type: 'jsonp',
            jsonpCallback: 'callback',
            success: function (r) {
                r = r[0];

                if (MB.maps[m].geocodeLayer) {
                    MB.maps[m].geocodeLayer.removeAllMarkers();
                }

                $('form.geocode').removeClass('loading');

                if (r === undefined) {
                    $('#geocode-error').text('This address cannot be found.').fadeIn('fast');
                } else {
                    $('#geocode-error').hide();
                    MB.maps[m].setExtent([
                        { lat: r.boundingbox[1], lon: r.boundingbox[2] },
                        { lat: r.boundingbox[0], lon: r.boundingbox[3] }
                    ]);

                    if (MB.maps[m].getZoom() === MB.maps[m].coordLimits[1].zoom) {
                        var point = { 'type': 'FeatureCollection',
                            'features': [{ 'type': 'Feature',
                            'geometry': { 'type': 'Point','coordinates': [r.lon, r.lat] },
                            'properties': {}
                        }]};

                        if (MB.maps[m].geocodeLayer) {
                            MB.maps[m].geocodeLayer.removeAllMarkers();
                            MB.maps[m].geocodeLayer.geojson(point);
                        } else {
                            MB.maps[m].geocodeLayer = mmg()
                                .geojson(point);
                            MB.maps[m].addLayer(MB.maps[m].geocodeLayer);
                        }

                        MB.maps[m].setCenter({ lat: r.lat, lon: r.lon });
                    }
                }
            }
        });
        var attribution = 'Search by <a href="http://developer.mapquest.com/web/products/open">MapQuest Open</a>';
        if ($('.wax-attribution').html().indexOf(attribution) < 0) {
            $('.wax-attribution').append(' - ' + attribution);
        }
    };
}

MB.layout = function() {
    if (location.hash === '#embed') $('body').removeClass().addClass('embed');

    $('body').append('<div id="layout"><a href="#" id="right">right</a><a href="#" id="left">left</a><a href="#" id="hero">hero</a></div>');
    $('#layout a').click(function(e) {
        e.preventDefault();
        $('body').removeClass().addClass($(this).attr('id'));
    });
};

$(function() {
    $('body').on('click.map', '[data-control="layer"]', function(e) {
        var $this = $(this),
            href = $this.attr('href');
        href = href.replace(/.*(?=#[^\s]+$)/, '');
        e.preventDefault();
        console.log(href);
    });

    bindGeocoder();
});
