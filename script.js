var MB = {};

MB.maps = {};

MB.api = function(l) {
    return 'http://api.tiles.mapbox.com/v3/' + l.id + '.jsonp';
};

MB.map = function(el, l) {
    wax.tilejson(MB.api(l), function(t) {
        MB.maps[el] = new MM.Map(el, new wax.mm.connector(t));
        MB.maps[el].setCenterZoom(
            new MM.Location(l.center.lat, l.center.lon), 
            l.center.zoom
        );

        wax.mm.attribution(MB.maps[el], t).appendTo(MB.maps[el].parent);
        
        if ($.inArray('zoomer',l.features) >= 0) {
            wax.mm.zoomer(MB.maps[el]).appendTo(MB.maps[el].parent);        
        }
        
        if ($.inArray('interaction',l.features) >= 0) {
            MB.maps[el].interaction = wax.mm.interaction()
                .map(MB.maps[el])
                .tilejson(t)
                .on(wax.movetip()
                    .parent(MB.maps[el].parent)
                    .events()
                );
        }
    });
};

MB.refresh = function(m, l) {

    if (l.id) {
        wax.tilejson(MB.api(l), function(t) {
            MB.maps[m].setLayerAt(0, new wax.mm.connector(t));
            MB.maps[m].interaction.tilejson(t);
        });
    }

    if (l.center) {
        var lat = l.center.lat || MB.maps[m].getCenter().lat,
            lon = l.center.lon || MB.maps[m].getCenter().lon,
            zoom = l.center.zoom || MB.maps[m].getZoom();
            
        if (l.center.ease > 0) {
            easey().map(MB.maps[m])
                .to(MB.maps[m].locationCoordinate({ lat: lat, lon: lon })
                .zoomTo(zoom)).run(l.center.ease);
        } else {
            MB.maps[m].setCenterZoom(new MM.Location(lat, lon), zoom);
        }
    }
};

MB.layers = function(el, m, layers) {
    $.each(layers, function(i, l) {
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
    });
};