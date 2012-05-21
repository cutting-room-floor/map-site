{% comment %}

A sample post file. Requires title, permalink,  and layout attributes.
Optional:
map: 
    api:
    center:
    zoomrange:
    features:
layers:
    - name:
      api:
      center:

{% endcomment %}

---
title: Exploring A Wider Circle Donations
permalink: /
layout: right
published: true
map: 
    api: "http://a.tiles.mapbox.com/v3/mapbox.mapbox-light.jsonp"
    center: {lat: 38.8850033656251, lon: -77.01439615889109, zoom: 14}
    zoomrange: [0, 15]
    features: [zoomwheel, tooltips, zoombox, zoompan, legend, share]
layers:
    - name: "Donors"
      api: "http://a.tiles.mapbox.com/v3/awidercircle.awc-addresses-don.jsonp"
      center: {lat: 38.913793178492, lon: -77.02, zoom: 13, ease: 1000}
    - name: "Recipients"
      api: "http://a.tiles.mapbox.com/v3/awidercircle.awc-addresses-rec.jsonp"
      center: {lat: 38.86585845552345, lon: -76.97635364532469, zoom: 14, ease: 2000}
    - name: "Both"
      api: "http://a.tiles.mapbox.com/v3/awidercircle.awc-addresses-don,awidercircle.awc-addresses-rec.jsonp"
      center: {lat: 38.90537696659096, lon: -76.94918823242188, zoom: 12, ease: 2000}
    - name: "Zip"
      api: "http://a.tiles.mapbox.com/v3/awidercircle.awc_don_rec_zip08.jsonp"
      center: {lat: 38.954386336035995, lon: -76.91768981933593, zoom: 11, ease: 1000}
---
<div id="about" markdown="1">

The Neighbor-to-Neighbor Program of [A Wider Circle](http://www.awidercircle.org/) provides furniture and other home items to families living without these basics.

Browse the map to see who A Wider Circle has helped.

</div>

{% include layers.html %}


## The full story

Or browse the story with inline navigation. <a data-control="layer" href="#donors">See the donors</a> in NW DC.

Then move <a data-control='layer' href="#recipients">south east</a> to see where donations flow.

Finally, zoom out to <a data-control="layer" href="#zip">see the regional impact</a>.


## See your neighborhood

{% include geocoder.html %}
