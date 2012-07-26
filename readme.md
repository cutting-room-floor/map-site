[Map Site templates](http://mapbox.com/map-sites) from [MapBox](http://mapbox.com/) are a
way to jumpstart building a map-based web feature. The map-site templates bundles common
HTML and CSS formatting with integration to the [MapBox Javascript API](http://mapbox.com/developers/mapbox.js/).

To build a project based on this template, fork this repository, edit the
HTML content and CSS, and alter the configuration script.

## Using this template

Edit the content by adjusting, removing, or adding to `index.html`. This is
the main markup document with the content and layout for the map-site.

Adjust the design by editing the `style.css` file and adding any additional
supporting structure to `index.html`.

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

## Javascript interaction

The map is configured in `script.js` and takes advantage of many [MapBox Javascript API](http://mapbox.com/developers/mapbox.js/)
features - so the documentation for the MapBox Javascript API applies to every part
of this site.

Additional integration is added with `mapbox.jquery.js`, which automatically binds
links that control the map - see the navigation links for examples.

### Address search

To search for an address, we need a geocoding service that converts a plain-text
address query into a geographic location. This template uses [MapQuest Open](http://open.mapquest.com/)
search, which is free to use for noncommercial and commercial applications alike. If you'd
like to use another service, edit the `geocode` function in `script.js`.

To add an address search to your page, build a simple html form to gather user input:

```html
<div data-control="geocode" id="search">
    <form class="geocode">
        <input placeholder="Search for an address" type="text">
        <input type="submit" />
        <div id="geocode-error"></div>
    </form>
</div>
```

By specifying `data-control="gecode"` on the `div` containing your `form`,
`mapbox.jquery.geocoder.js` will bind a function that handles address searches and repositions
the map accordingly. If the geocoder has a successful response to a search, it
will center the map and zoom it to show the bounding box extent of that response. If
the bounding box is small enough to zoom the map to its maximum zoom, the geocoder
will also place a pin with a star over the response's exact location.
