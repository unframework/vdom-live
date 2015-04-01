var $ = require('jquery');
var requestAnimationFrame = require('raf');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

function addRedraw(fn, redraw) {
  return function() {
    fn.apply(this, arguments);
    redraw();
  }
}

var patchedHandlers = {};

function patchEventTargetMethods (obj, redraw) {
  var addDelegate = obj.addEventListener;
  obj.addEventListener = function (eventName, fn) {
    var patchedHandler = addRedraw(fn, redraw);
    // find better way of generating keys
    patchedHandlers[this.toString() + eventName] = patchedHandler;
    arguments[1] = patchedHandler;
    return addDelegate.apply(this, arguments);
  };
  
  var removeDelegate = obj.removeEventListener;
  obj.removeEventListener = function (eventName, fn) {
	var patchedHandler = patchedHandlers[this.toString() + eventName];
    arguments[1] = patchedHandler;
    var result = removeDelegate.apply(this, arguments);
    return result;
  };
};

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

    patchEventTargetMethods(window.EventTarget.prototype, requestRedraw);

    return rootNode;
};
