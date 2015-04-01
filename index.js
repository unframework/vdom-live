var $ = require('jquery');
var requestAnimationFrame = require('raf');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

module.exports = function (render) {
    var cleanup = null;

    var tree = render();
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

                var newTree = render();
                patch(rootNode, diff(tree, newTree));
                tree = newTree;
            });
        }
    }

    $(window).on('hashchange', requestRedraw);
    $(document.body).on('click', requestRedraw);

    cleanup = function () {
        $(window).off('hashchange', requestRedraw);
        $(document.body).off('click', requestRedraw);
    };

    return rootNode;
};
