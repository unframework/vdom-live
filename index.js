var requestAnimationFrame = require('raf');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var h = require('virtual-dom/h');

require('zone.js'); // no exports, using the global zone reference instead

function getActiveZone() {
    return global.zone;
}

module.exports = function (zoneCode) {
    var redrawList = [];
    var isRendering = false;

    var factory = function (render) {
        var tree = render(h); // @todo this is assumed to run inside the zone, but ensure that somehow
        var rootNode = createElement(tree);

        var redrawId = null;

        function requestRedraw() {
            if (redrawId === null) {
                redrawId = requestAnimationFrame(function () {
                    redrawId = null;

                    // clean up
                    if (!rootNode.parentNode) {
                        redrawList.splice(redrawList.indexOf(requestRedraw), 1);
                        return;
                    }

                    // ensure entire patch operation is done within the zone run for proper handler attachment
                    isRendering = true; // avoid triggering a re-render

                    currentZone.run(function () {
                        var newTree = render(h);
                        patch(rootNode, diff(tree, newTree));
                        tree = newTree;
                    });

                    isRendering = false;
                });
            }
        }

        redrawList.push(requestRedraw);

        return rootNode;
    };

    var currentZoneIsInitialized = false;
    var currentZone = getActiveZone().fork({
        afterTask: function () {
            if (currentZoneIsInitialized && !isRendering) {
                redrawList.forEach(function (hook) { hook(); });
            }
        }
    });

    currentZone.run(function () {
        zoneCode(factory, h);
    });

    currentZoneIsInitialized = true;
};
