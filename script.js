var MB = {};

MB.maps = {};

MB.api = function(l) {
    return 'http://api.tiles.mapbox.com/v3/' + l.id + '.jsonp';
};

MB.map = function(el, l) {
    wax.tilejson(MB.api(l), function(t) {
        var h = [
            new MM.DragHandler,
            new MM.DoubleClickHandler,
            new MM.TouchHandler
        ];
        if ($.inArray('zoomwheel',l.features) >= 0) h.push(new MM.MouseWheelHandler);
        
        MB.maps[el] = new MM.Map(el, new wax.mm.connector(t), null, h);
        MB.maps[el].setCenterZoom(
            new MM.Location(l.center.lat, l.center.lon), 
            l.center.zoom
        );
        
        if (l.zoomRange) {
            MB.maps[el].setZoomRange(l.zoomRange[0], l.zoomRange[1]);
        } else {
            MB.maps[el].setZoomRange(t.minzoom, t.maxzoom);
        }
        
        wax.mm.attribution(MB.maps[el], t).appendTo(MB.maps[el].parent);
                
        if ($.inArray('zoompan',l.features) >= 0) {
            wax.mm.zoomer(MB.maps[el]).appendTo(MB.maps[el].parent);
        }

        if ($.inArray('zoombox',l.features) >= 0) {
            wax.mm.zoombox(MB.maps[el]);
        }

        if ($.inArray('legend',l.features) >= 0) {
            MB.maps[el].legend = wax.mm.legend(MB.maps[el], t).appendTo(MB.maps[el].parent);
        }

        if ($.inArray('bwdetect',l.features) >= 0) {
            wax.mm.bwdetect(MB.maps[el]);
        }
        
        if ($.inArray('tooltips',l.features) >= 0) {
            MB.maps[el].interaction = wax.mm.interaction()
                .map(MB.maps[el])
                .tilejson(t)
                .on(wax.tooltip()
                    .parent(MB.maps[el].parent)
                    .events()
                );
        } else if ($.inArray('movetips',l.features) >= 0) {
            MB.maps[el].interaction = wax.mm.interaction()
                .map(MB.maps[el])
                .tilejson(t)
                .on(wax.movetip()
                    .parent(MB.maps[el].parent)
                    .events()
                );
        }

        if ($.inArray('share',l.features) >= 0) {
            wax.mm.share(MB.maps[el], t).appendTo(MB.maps[el].parent);
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
            MB.maps[m].setCenterZoom(new MM.Location(lat, lon), zoom);
        }
    }
};

MB.layers = function(el, m, layers) {
    $.each(layers, function(i, l) {
        if (l.el) {
            $('#' + l.el)
                .click(function(e) {
                    e.preventDefault();
                    $('#' + el + ' .layer').removeClass('active');
                    $(this).addClass('active');
                    MB.refresh(m, l);
                });
        }
        
        if (el) {
            $('#' + el).append($('<a href="#">' + l.name + '</a>')
                .attr('id', 'layer-' + i)
                .addClass('layer')
                .click(function(e) {
                    e.preventDefault();
                    $('#' + el + ' .layer').removeClass('active');
                    $(this).addClass('active');
                    MB.refresh(m, l);
                })
            );
        }
    });
};

MB.geocoder = function(el, m, opt) {
    var placeholder = 'Search for an address';
    $('#' + el).append(
        $('<form class="geocode">')
            .append($('<input type="text">')
                .val(placeholder)
                .blur(function() {
                    if ($(this).val() === '') $(this).val(placeholder);
                })
                .focus(function() {
                    if ($(this).val() === placeholder) $(this).val('');
                })
            )
            .append($('<input type="submit">'))
            .submit(function(e) {
                e.preventDefault();
                geocode($('input[type=text]', this).val());
            })
    );
    var geocode = function(query) {
        query = encodeURIComponent(query);
        switch(opt.service) {
            case 'mapquest open':
                reqwest({
                    url: 'http://open.mapquestapi.com/nominatim/v1/search?format=json&json_callback=callback&&limit=1&q=' + query,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    success: function (r) {
                        r = r[0];
                        if (r === undefined) {
                            console.log('The search you tried did not return a result.');
                        } else {
                            MB.maps[m].setExtent([
                                new MM.Location(r.boundingbox[1], r.boundingbox[2]),
                                new MM.Location(r.boundingbox[0], r.boundingbox[3])
                            ]);
                            if (MB.maps[m].getZoom() === MB.maps[m].coordLimits[1].zoom) {
                                var point = { 'type': 'FeatureCollection',
                                    'features': [{ 'type': 'Feature',
                                    'geometry': { 'type': 'Point','coordinates': [r.lon, r.lat] },
                                    'properties': {}
                                }]};
                                
                                if (MB.maps[m].geocodeLayer) {
                                    MB.maps[m].geocodeLayer.geojson(point);
                                } else {
                                    MB.maps[m].geocodeLayer = mmg()
                                        .map(MB.maps[m])
                                        .geojson(point);
                                    MB.maps[m].addLayer(MB.maps[m].geocodeLayer);
                                }
                            }
                        }
                    }
                });
            break;
        }
        if ($('.wax-attribution').html().indexOf(opt.attribution) < 0) {
            $('.wax-attribution').append(' - ' + opt.attribution);
        }
    };
};

MB.layout = function() {
    if (location.hash === '#embed') $('body').removeClass().addClass('embed');
    
    $('body').append('<div id="layout"><a href="#" id="right">right</a><a href="#" id="left">left</a><a href="#" id="hero">hero</a></div>');
    $('#layout a').click(function(e) {
        e.preventDefault();
        $('body').removeClass().addClass($(this).attr('id'));
    });
};