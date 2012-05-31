
var foursquare = {};


// Array for venues queue
foursquare.venues = [];


// Get venues
foursquare.start = function() {
    foursquare.getVenues();
};


// Fetch venues from foursquare
foursquare.getVenues = function() {
    var params = {
        client_id: '1SHOHFLYHC3KIQKMBMKRWHASORK0TPCNPPH04OQCT1Y5ZRGW',
        client_secret: '2DMK0XSZL3ZMZDNR0G0UQ4ARJYN2HIJXL4FKXZ1WUALXZYZV',
        v: '20120530',
        callback: 'callback'
    };
    query = '?' + _.map(params, function(num, key) {
        return key + "=" + num;
    }).join('&');
        
    reqwest({
        url: 'https://api.foursquare.com/v2/lists/4fc674d7e4b07a1f71542757' + query,
        type: 'jsonp',
        jsonCallback: 'callback',
        success: function(d) {
            foursquare.processVenues(d);
        }
    });
};


// Extract relevant data from venues
foursquare.processVenues = function(d) {
    _.each(d.response.list.listItems.items, function(item, index) {        
        if (item.venue.location && item.venue.location.lat && item.venue.location.lng) {
            foursquare.venues.push(item.venue);
        }
    });
    foursquare.table();
    foursquare.map();
};


// Build a table of locations
foursquare.table = function() {
    var template = _.template(
        '<div class="venue">' +
            '<div class="location"><a href="#<%= id %>"><%= location.address %></a> ' +
                '<% if(location.crossStreet) { %><%= location.crossStreet %><%}%>' +
            '</div>' +
            '<% if(contact.formattedPhone) { %>' +
            '<div class="phone"><%= contact.formattedPhone %></div>' +
            '<%}%>' +
        '</div>'
    );
    
    var groups = _.groupBy(foursquare.venues, function(item) { 
        return item.location.state; 
    });
    
    var output = [];
    _.each(groups, function(items, state) {
        output.push('<h3>'+ state + '</h3>');
        _.each(items, function(item) {
            output.push(template(item));    
        });
    });
    
    $('#content').append(output.join(''));
    $('.location a').click(function(e) {
        e.preventDefault();
        var id = $(this).attr('href').substring(1);

        if ($(this).parent().parent().hasClass('active')) {
            $(this).parent().parent().removeClass('active');
            $('#' + id).removeClass('active');
            $('#map').addClass('unlocked');
        } else {
            var point = _.find(foursquare.venues, function(item) {
                return item.id === id 
            });
            
            $('.mmg, .venue').removeClass('active');
            $(this).parent().parent().addClass('active');
            $('#map').removeClass('unlocked');
            
            // Move map to adjusted center
            MM_map.easey = easey().map(MM_map)
                .to(MM_map.locationCoordinate(locationOffset({ 
                    lat: point.location.lat, 
                    lon: point.location.lng
                })).zoomTo(MM_map.getZoom())).run(500, function() {
                    $('#' + id).addClass('active');
                });
        }
    });

    // Foursquare button
    (function() {
        window.___fourSq = {"uid":"19778482"};
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = 'http://platform.foursquare.com/js/widgets.js';
        s.async = true;
        var ph = document.getElementsByTagName('script')[0];
        ph.parentNode.insertBefore(s, ph);
    })();
};


// Map the venues
foursquare.map = function() {
    var points = { 'type': 'FeatureCollection',
        'features': []
    };

    _.each(_.rest(foursquare.venues, foursquare.last || 0), function(venue) {
        points.features.push({
            type: 'Feature',
            id: venue.id,
            geometry: { 
                type: 'Point',
                coordinates: [venue.location.lng, venue.location.lat] 
            },
            properties: {
                name: venue.name,
                location: venue.location,
                stats: venue.stats
            }
        });
    });
    
    foursquare.last = foursquare.venues.length;
    if (MM_map.venueLayer) {
        MM_map.venueLayer.geojson(points);
    } else {
        MM_map.venueLayer = mmg().factory(function(x) {
            var d = document.createElement('div'),
                overlay = document.createElement('div'),
                anchor = document.createElement('div');
            
            var template = _.template(
                '<div class="location">' + 
                    '<span class="name fn"><%= name %></span>' +
                    '<span class="adr">' +       
                        '<span class="address street-address"><%= location.address %></span>' +
                        '<% if (location.crossStreet) { %>' +
                        '<span class="cross-street"><%= location.crossStreet %></span>' + 
                        '<% } %>' +
                        '<span class="city-state">' + 
                            '<span class="locality"><%= location.city %></span>, ' +
                            '<span class="region"><%= location.state %></span>' +
                        '</span>' +
                    '</span>' +
                '</div>' + 
                '<div class="foursquare">' + 
                    '<a href="https://foursquare.com/intent/venue.html" class="fourSq-widget" data-variant="wide" data-context="'+ x.id +'">Save to foursquare</a>' +
                    '<div class="checkins">' + 
                        '<span class="number"><%= stats.checkinsCount %></span>' + 
                        '<span class="label">checkins</span>' + 
                    '</div>' + 
                    '<div class="users">' + 
                        '<span class="number"><%= stats.usersCount %></span>' + 
                        '<span class="label">users</span>' + 
                    '</div>' + 
                '</div>'
            );
            overlay.className = 'overlay';
            overlay.innerHTML = template(x.properties);

            anchor.className = 'anchor';
            anchor.appendChild(overlay);

            d.id = x.id;
            d.className = 'mmg vcard';
            d.appendChild(anchor);
            
            return d;
        }).geojson(points);
        MM_map.addLayer(MM_map.venueLayer);
    }
    MM_map.setCenter({
        lat: MM_map.getCenter().lat, 
        lon: MM_map.getCenter().lon
    });
    
    // Handlers
    $('.mmg').click(function(e) {
        e.preventDefault();
        $('[href=#' + $(this).attr('id') + ']').click();
    });
};

// Function for adjusting the foursquare venues based on search
function foursquareRefresh() {
    
}

// Calculate offset given #content
function locationOffset(location) {
    var offset = MM_map.locationPoint({ 
            lat: location.lat, 
            lon: location.lon
        });
    offset = MM_map.pointLocation({
        x: offset.x - $('#content').width() / 2,
        y: offset.y
    });
    return offset;
}
