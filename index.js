var $ = require('jquery');
var requestAnimationFrame = require('raf');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var h = require('virtual-dom/h');

// explicit method to trigger refresh
// (may be using a private jQuery instance so must use it to trigger event)
window.vdomLiveRefresh = function () {
    $(window).trigger('vdomlive:refresh');
};

module.exports = function (zoneCode) {
    var factory = function (render) {
        var cleanup = null;

        var tree = render(h);
        var rootNode = createElement(tree);

        var redrawId = null;

        function requestRedraw() {
            if (!rootNode.parentNode) {
                cleanup();
                return;
            }

            if (redrawId === null) {
                redrawId = requestAnimationFrame(function () {
                    redrawId = null;

                    var newTree = render(h);
                    patch(rootNode, diff(tree, newTree));
                    tree = newTree;
                });
            }
        }

        $(window).on('vdomlive:refresh', requestRedraw);
        $(window).on('hashchange', requestRedraw);
        $(document.body).on('click', requestRedraw);

        cleanup = function () {
            $(window).off('vdomlive:refresh', requestRedraw);
            $(window).off('hashchange', requestRedraw);
            $(document.body).off('click', requestRedraw);
        };

        return rootNode;
    };

    zoneCode(factory);
};
