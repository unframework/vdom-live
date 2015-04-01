Virtual DOM Live
----------------

Render virtual DOM as an element and then keep updating it as interesting things (page events) happen.

* bye-bye application state change tracking, observables, digest loops, watches
    * or something
* great for
    * quick prototyping
    * not worrying about premature optimization
    * writing awesome-sauce codes

Uses `requestAnimationFrame` to queue and debounce re-renders. Cleans up event listeners when root element is removed from the document tree.

```js
var renderLive = require('vdom-live');

var liveDOM = renderLive(function () {
    return h('span', new Date().toString());
});

document.body.appendChild(liveDOM);

// ... and then let the user click something/etc
```

### Todo

* remove jQuery dependency (yep, I know)
* add more events to listen on
* possibly override `setTimeout` with a wrapper? audacious!
