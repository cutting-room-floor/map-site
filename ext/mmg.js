// from mapbox/spots

function mmg() {
    var l = {},
        geojson = {},
        factory = null,
        _id = 0,
        _zoom,
        selection = {},
        map;

    var parent = document.createElement('div');
    parent.style.cssText = 'position: absolute; top: 0px;' +
      'left: 0px; width: 100%; height: 100%; margin: 0; padding: 0; z-index: 1';

    var level = parent.appendChild(document.createElement('div'));
    level.style.cssText = 'position: absolute; top: 0px;' +
      'left: 0px; width: 100%; height: 100%; margin: 0; padding: 0; z-index: 0';

    function defaultFactory(feature) {
        var d = document.createElement('div');
        d.className = 'mmg-default';
        return d;
    }

    l.gen_id = function() {
        return _id++;
    };

    l.correct = function(force) {
        if (_zoom !== Math.round(map.coordinate.zoom) || force) {
          _zoom = Math.round(map.coordinate.zoom);
          level.innerHTML = '';
          for (var i = 0; i < geojson.features.length; i++) {
            var feature = geojson.features[i];

            feature.elem = factory(feature);
            level.appendChild(feature.elem);

            var coord = map.locationCoordinate(new MM.Location(
              feature.geometry.coordinates[1],
              feature.geometry.coordinates[0]));

            coord = coord.zoomTo(map.coordinate.zoom);

            var tx = coord.column * map.tileSize.x - 10,
                ty = coord.row * map.tileSize.y - 25;

            // TODO: pass only scale or only w/h
            MM.moveElement(feature.elem, {
                x: tx,
                y: ty
            });
          }
        }
    };

    function clean(x) {
        var clean_features = [];
        for (var i = 0; i < geojson.features.length; i++) {
            clean_features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: geojson.features[i].geometry.coordinates
                },
                properties: geojson.features[i].properties
            });
        }
        return {
          type: "FeatureCollection",
          features: clean_features
        };
    }

    l.byid = function() {
        var x = {};
        var c = clean(geojson);
        for (var i = 0; i < c.features.length; i++) {
          x[c.features[i].properties.id] = c.features[i];
        }
        return x;
    };

    l.rm = function(id) {
        for (var i = 0; i < geojson.features.length; i++) {
            if (geojson.features[i].properties.id === id) {
              geojson.features.splice(i, 1);
            }
        }
    };

    l.geojson = function(x) {
        if (!arguments.length) return clean(geojson);

        geojson = x;
        l.correct(true);
        l.draw();

        return l;
    };

    l.draw = function() {
        var theCoord = map.coordinate.copy();
        var center = new MM.Point(map.dimensions.x/2, map.dimensions.y/2);

        MM.moveElement(level, {
            x: -(theCoord.column * 256) + center.x,
            y: -(theCoord.row * 256) + center.y
        });

        l.correct();
    };

    l.factory = function(x) {
      if (!x) return factory;
      factory = x;
      return l;
    };

    l.map = function(x) {
      if (!x) return map;
      map = x;
      return l;
    };

    l.parent = parent;

    l.factory(defaultFactory);

    return l;
}
