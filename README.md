Virtual DOM Live
----------------

Render [virtual DOM](https://github.com/Matt-Esch/virtual-dom) as an element and then keep updating it as interesting things (page events) happen, without observables.

- [NPM package](https://www.npmjs.com/package/vdom-live)
- [Live demo on RequireBin!](http://requirebin.com/?gist=41d87350052e03ba6ebb)

Motivation:

* bye-bye application state change tracking, observables, digest loops, watches
    * or something
* great for
    * quick prototyping
    * not worrying about premature optimization
    * writing awesome-sauce codes

Uses `requestAnimationFrame` to queue and debounce re-renders. Cleans up event listeners when root element is removed from the document tree.

Relying on the [Angular Zone.js](https://github.com/angular/zone.js) library to detect incoming page and network events. Anything that runs inside the `vdomLive` wrapper will get incoming asynchronous events and timeouts picked up and triggering a redraw on the next animation frame.

```js
var vdomLive = require('vdom-live');

vdomLive(function (renderLive) {
    var liveDOM = renderLive(function (h) {
        return h('span', new Date().toString());
    });

    document.body.appendChild(liveDOM);
});

// ... and then let the user click something/receive AJAX/etc
```

### Todo

* keep investigating other ways to detect interesting events
