# svg.draggable.js

A plugin for the [svgdotjs.github.io](https://svgdotjs.github.io/) library to make elements gridhelper.

svg.gridhelper.js is licensed under the terms of the MIT License.

## Usage

Install the plugin:

```sh
npm install @svgdotjs/svg.js svg.gridhelper.js
```

Include this plugin after including the svg.js library in your html document.

```html
<script src="node_modules/@svgdotjs/svg.js/dist/svg.js"></script>
<script src="node_modules/dist/svg.gridhelper.js"></script>
```

Or for esm just require it:

```js
import { SVG } from "@svgdotjs/svg.js";
import '@svgdotjs/svg.panzoom.js' //optional
import "svg.gridhelper.js";
```

To make an element gridhelper just call `gridhelper()` on the element

```javascript
const draw = SVG()
  .addTo(dom)
  .size("100%", "100%")
  .viewbox(0, 0, dom.clientWidth, dom.clientHeight)
  .panZoom() //svg.panzoom.js
  .gridHelper();
```

Yes indeed, that's it! .

## get gridHelper instance

```javascript
const gridHelper = draw.gridHelper;
```

## Full configuration options

````javascript
{
  gridSize: 100,       // Basic grid size (unit: pixels)
  minPixels: 100,      // Minimum visible grid spacing (used when auto-scaling)
  gridColor: "gray",   // Grid line color
  labelColor: "#666",  // Label text color
  gridStrokeWidth: 1,  // Grid line width
  labelFontSize: 12,   // Basic label font size
  showLabel: true      // Whether to display coordinate labels
}

## Methods

### `toggle()`

Toggle gridhelper visibility.

```javascript
draw.gridHelper.toggle();      // toggle
draw.gridHelper.toggle(true);  // show
draw.gridHelper.toggle(false); // hide
```

### `update()`

Update gridhelper position and size.

```javascript
  draw.on("zoom", () => {
    draw.gridHelper.update();
  });

});
```

### `resize()`

Resize gridhelper to match the current viewbox size.

```javascript
window.addEventListener("resize", () => {
  draw.size("100%", "100%")
  .viewbox(0, 0, dom.clientWidth, dom.clientHeight)
  draw.gridHelper.resize();
});
```

## Destroy

Destroy gridhelper and remove all event listeners.

```javascript
draw.gridHelper.destroy();
```

## Dependencies

This module requires svg.js >= v3.0.10
````
