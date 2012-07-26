var TileJSONs = [
    'http://a.tiles.mapbox.com/v3/mapbox.mapbox-light.jsonp',
    'http://a.tiles.mapbox.com/v3/awidercircle.awc-addresses-don.jsonp',
    'http://a.tiles.mapbox.com/v3/awidercircle.awc-addresses-rec.jsonp',
    'http://a.tiles.mapbox.com/v3/awidercircle.awc_don_rec_zip08.jsonp'
];
var m;
$('#map').mapbox(TileJSONs, function(map, tiledata) {
    m = map;

    map.getLayerAt(0).named('base');
    map.getLayerAt(1).named('donors');
    map.getLayerAt(2).named('recipients');
    map.getLayerAt(3).named('zip');

    // Do not composite base layer with other layers
    map.getLayer('base').composite(false);

    // Disable overlays by default
    map.disableLayer('donors');
    map.disableLayer('recipients');
    map.disableLayer('zip');

    // Set initial center and zoom
    map.setCenterZoom({
        lat: 38.88500,
        lon: -77.01439
    }, 14);

    // Set zoom range of map
    map.setZoomRange(0, 15);

    // Add a legend
    map.ui.legend.add();
    map.ui.attribution.add();
    map.ui.refresh();

    // Trigger a switch to the first overlay
    $('[href="#donors"]').click();

});
