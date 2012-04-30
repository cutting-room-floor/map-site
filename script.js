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
            .submit(function(e) {
                e.preventDefault();
                geocode($('input[type=text]', this).val());
            })
    );
    $('wax-attribution').append(opt.attribution);
    var geocode = function(query) {
        query = encodeURIComponent(query);
        switch(opt.service) {
            case 'mapquest open':
                $.ajax({
                    url: 'http://open.mapquestapi.com/nominatim/v1/search?format=json&json_callback=callback&&limit=1&q=' + query,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    success: function (value) {
                        value = value[0];
                        if (value === undefined) {
                            console.log('The search you tried did not return a result.');
                        } else {
                            MB.maps[m].setExtent([
                                new mm.Location(boundingbox[1], boundingbox[2]),
                                new mm.Location(boundingbox[0], boundingbox[3])
                            ]);
                        }
                    }
                });
            break;
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