var requestAnimationFrame = require('raf');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var h = require('virtual-dom/h');
var zoneWrapper = require('zone.js-tmp-browserify');

module.exports = function (zoneCode) {
    var redrawList = [];

    var factory = function (render) {
        var tree = render(h);
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

                    var newTree = render(h);
                    patch(rootNode, diff(tree, newTree));
                    tree = newTree;
                });
            }
        }

        redrawList.push(requestRedraw);

        return rootNode;
    };

    var currentZoneIsInitialized = false;
    var currentZone = zoneWrapper.zone.fork({
        afterTask: function () {
            if (currentZoneIsInitialized) {
                redrawList.forEach(function (hook) { hook(); });
            }
        }
    });

    currentZone.run(function () {
        zoneCode(factory);
    });

    currentZoneIsInitialized = true;
};
