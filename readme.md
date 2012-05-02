# Map-site Template

A way to jumpstart building a map-based microsite, the map-site template bundles common html and css formatting with reusable javascript components. This template is designed to make it easy to get started and should be hacked up at will for your project.

To build a project based on this template, clone this repository, edit the html content and css, and alter the configuration script.

## Using this template

Edit the content by adjusting, removing, or adding to `index.html`. This is the main markup document with the content and layout for the map-site.

Adjust the design by editing the `style.css` file and adding any additional supporting structure to `index.html`.

Set the map features by writing a configuration script at the bottom of `index.html`. 

## HTML layout

The html markup for the template is in `index.html`. It's a simple HTML5 page layout. Generally, there are three things to change in this document:

1. Content elements like the `title`, `h1`, and `div#about` elements
2. Add new container elements for features like maps, layer switchers, and geocoders
3. Layout structure, as controlled by the `class` attribute on the `body` element
    
There are three layout classes that can be applied to the `body` element:

- `right` A full screen map with a header and right content sidebar (default)
- `left` A similar full screen map with a centered header and left content sidebar
- `hero` An inline map hero with a header and full-width, scrollable content section
    
## CSS styles

Most of the hard work on a microsite build is template design implemented through CSS. This template by default is simple and clean, and it's based on the tiles.mapbox.com full map view. This design and be completely overridden by applying new CSS styles.

CSS styles are in two files:

- `style.css` contains all the layout and typographic styles as well as some overridden styles for map controls, as well as a [reset stylesheet](http://meyerweb.com/eric/tools/css/reset/). Implement your design by editing this file.
- `map.css` holds the default map styles from tiles.mapbox.com embeds.

## Site configuration

An internal javascript library abstracts common things microsites need maps to do in an easy and repeatable way:

- Add one or more maps to a page
- Turn on features and controls for the map like zoom buttons, share links and embed code, interactive overlays, and more
- Overlays can be fixed to a specific location or full the mouse cursor 
- Add one or more layer switchers for each map, which can take the form of a list of layers or inline links
- Specify with layer of a map to change when changing layers
- Use the layer switcher's list or inline links to control the maps position and zoom level with configurable easing
- Add a geocoder search to orient the map based on a plain-text address. Place names zoom the map to their bounding extent and address points add a marker on each specific location

With the configuration script, you can add three types of features to your map-site:

- A map
- A layer switcher
- A geocode search

And you can add as many of these things as needed. So you can build a page with one map and two layer switchers. Or have two maps, a layer switcher for each, and a geocoder on one of the maps. 

### Adding a map:

Start witha `<div>` container with `id="map"`. Styles to lay out the map container come from `class="map"`.

```html
<div id="map" class="map"></div>
```

Insert a map into the container. The `id` of the container is the first argument (`'map'`), and an object of options is the second argument. The simplest, only required option is `id`, and it should contain the Map ID from MapBox. MapBox maps each have a unique id in the formate of `user`.`map` where `user` is the MapBox account name and `map` is the url hash for the map.

```js
new MB.map('map', { id: 'mapbox.mapbox-light' });
```

The map options object can take several options:

- id (the MapBox Map ID for the map)
- center (an object of `{ lat: ##, lon: ##, zoom: ## }` that defines the map's initial view. If not is provided, the default center set through MapBox will be used.)
- zoomRange (an array of `[##, ##]` where the first element is the minimum zoom level and the second is the max.)
- features (an array of additional features for the map.)

The features object may contain any of the following:

- `zoomwheel` Use the scroll wheel on the mouse to zoom the map
- `tooltips` or `movetips` For layers with interactive overlays, display fixed `tooltips` or `movetips`, which are overlays the follow the cursor
- `zoombox` Allow uses to zoom to a bounding box by holding the shift key and dragging over the map
- `zoompan` Show zoom controls on the map
- `legend` Show a legend on the map. Legends from multiple layers will stack on top of each other
- `share` Show a share button on the map with Twitter, Facebook links and an embed code for the map. The embedded view of the map will add a `class="embed"` to the `<body>` element of the page for easy theming. For instance, by default the embed layout is a full screen map with the layer switcher over it on the left. The header and content are hidden.
- `bwdetect` Automatically detect low bandwidth contections and decrease the quality of the map images to accomodate

A map with all the options would look like this:

```js
new MB.map('map', {
    id: 'mapbox.mapbox-light',
    center: {
        lat: 38.8850033656251,
        lon: -77.01439615889109,
        zoom: 14
    },
    zoomRange: [0, 15],
    features: [
        'zoomwheel',
        'tooltips', // or 'movetips'
        'zoombox',
        'zoompan',
        'legend',
        'share',
        'bwdetect'
    ]
});
```

### Adding a layer switcher

A layer switcher is a simple interface for changing the content of the map. It is a list of map settings that are applied by clicking on an element in the layer switcher's list. Here's what a simple version looks like:

Start with a container `<div>` to hold the layer switcher, just like we did with the map's container. Give it an id and a `class="layers"` for styles.

```html
<div id="nav" class="layers"></div>
```

Just like the map, we start by defining the container element's `id` in the first argument: here it's `'nav'`. The second argument is the map to which the layer switcher should be applied, identified by the `id` of its container: here it's `'map'`. Finally we pass an array of map objects, which make up the different layers in the layer switcher. For the simplest example, we'll just have two layers. Each layer object needs at least a `name` to label it. Since we want this layer switcher to change the map's content, we also set the `id` for each layer, which is just like the `id` for the map: it's the Map ID from MapBox.

```js
new MB.layers('nav', 'map', [
    {
        name: 'Donors',
        id: 'mapbox.mapbox-light,awidercircle.awc-addresses-don'
    },
    {
        name: 'Recipients',
        id: 'mapbox.mapbox-light,awidercircle.awc-addresses-rec'
    }
]);
```

If instead we want the layer switcher to move the map but not change its content, we can pass it a `center` object instead. The `center` object also works similarly to its use in the map, with a `lat`, `lon`, and optional `zoom` property (if `zoom` is omitted, the map will recenter, but keep its current zoom level). There's also a new property called `ease`, which is the time in milliseconds to animate moving the map to this new location. It's optional too. Omitting it will just snap the map to its new location.

```js
new MB.layers('nav', 'map', [
    {
        name: 'North West',
        center: {
            lat: 38.913793178492,
            lon: -77.02
        }
    },
    {
        name: 'South East',
        center: {
            lat: 38.86585845552345,
            lon: -76.97635364532469,
            zoom: 14,
            ease: 2000
        }
    }
]);
```
And of course, we can set both the `id` and `center` of a layer at the same time:

```js
new MB.layers('nav', 'map', [
    {
        name: 'Donors',
        id: 'mapbox.mapbox-light,awidercircle.awc-addresses-don',
        center: {
            lat: 38.913793178492,
            lon: -77.02,
            zoom: 13,
            ease: 1000
        }
    },
    {
        name: 'Recipients',
        id: 'mapbox.mapbox-light,awidercircle.awc-addresses-rec',
        center: {
            lat: 38.86585845552345,
            lon: -76.97635364532469,
            zoom: 14,
            ease: 2000
        }
    }
]);
```

By default, changing the Map ID with a layer switcher will replace the content in the map. This is why in the `id` properties, I am including `mapbox.mapbox-light,` before the map layer with the data I want to show. That composites the MapBox Light base layer with the data layer: `awidercircle.awc-addresses-don`. If you'd like your layer switcher to not affect your base layer and only change the data layer (or if you'd like to only change the base layer and not the data layer...) you can set a `layer` property that will organize your map in different layer levels that stack on top of each other instead of replacing each other. Note, using multiple layers like this makes for smoother map transitions, but it can have a major impact on the performance and page weight of your site. It's better to using compositing for stacking multiple layers, as in `id: 'mapbox.mapbox-light,awidercircle.awc-addresses-don'`.

To set a layer level for your layer, just give it a number. The initial layer you make when you first set up the map will be `layer: 0`. Additional layer levels should be sequential.

```js
new MB.layers('nav', 'map', [
    {
        name: 'Change base layer',
        id: 'mapbox.mapbox-zenburn',
        layer: 0
    },
    {
        name: 'Overlay donors',
        id: 'awidercircle.awc-addresses-don',
        layer: 1
    },
    {
        name: 'Overlay recipients',
        id: 'awidercircle.awc-addresses-rec',
        layer: 1
    }
]);
```

Layer switchers also have two layout options. By default they fill a container with a list of links for each layer:

But the layers in a layer switcher can also be attached to links that are inline with other content on the page. These inline links can be in addition to or instead of the list links. The main example site shows both styles.

![](https://img.skitch.com/20120502-fns54d4r5akekhjp8bab4sqnss.jpg)

To connect a layer with an inline link, first make sure the link has a unique `id`:

```html
<a id="donors" href="#">See the donors</a> in NW DC. 
Then move <a id="recipients" href="#">south east</a> to see where donations flow.
```

Then add a `el` property to the cooresponding layer with the name of the link's `id`:

```js
new MB.layers('nav', 'map', [
    {
        name: 'Donors',
        id: 'awidercircle.awc-addresses-don',
        el: 'donors'
    },
    {
        name: 'Recipients',
        id: 'awidercircle.awc-addresses-rec',
        el: 'recipients'
    }
]);
```

Or to only display inline links and no list, just replace the first argument of the layer switcher with `null`:

```js
new MB.layers(null, 'map', [
    {
        name: 'Donors',
        id: 'awidercircle.awc-addresses-don',
        el: 'donors'
    },
    {
        name: 'Recipients',
        id: 'awidercircle.awc-addresses-rec',
        el: 'recipients'
    }
]);
```

### Adding a geocoder

This final feature supported in this template is a geocode search. This adds a form to the page for entering plain text addresses or place names and adjusts the map to center on that area. Just like maps and layer switchers, geocoders need a container element:

```html
<div id="search"></div>
```

And to add a geocoder to your page, first specify the container's `id`, `'search'`, the map's container `id`, `'map'`, and an options object.

```js
new MB.geocoder('search', 'map', {
    service: 'mapquest open',
    attribution: 'Search by <a href="http://developer.mapquest.com/web/products/open">MapQuest Open</a>'
});
```

Right now the only supported geocoding service is [MapQuest Open](http://developer.mapquest.com/web/products/open), but you can add your own. Geocoders also usually require you to add attribution to your map citing them as the owner of the resulting data, so you can define a `attribution` property for your geocoder that will add html to your map's attribution when a geocoder search is submitted.

If the geocoder has a successful response to a search, it will center the map and zoom it to show the bounding box extent of that response. If the bounding box is small enough to zoom the map to its maximum zoom, the geocoder will also place a pin with a star over the response's exact location. You can adjust this marker or hide is by editing the `mmg-default` styles in `style.css`.

![](https://img.skitch.com/20120502-cxftsce4ejckxxjwjs6h2jp95s.jpg)

### Further Reading

* [MapBox Hosting API](http://mapbox.com/hosting/api/)
* [MapBox Wax](http://mapbox.com/wax/)
* [MapBox Easey](http://mapbox.com/easey/)
* [Modest Maps](http://modestmaps.com/)
* [jQuery](http://jquery.com/)
