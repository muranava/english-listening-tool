define('dom', [], function () {
    function dom (arg, parent) {
        var m;
        if (typeof arg === 'string') {
            m = arg.match(/^<(\w+)(?:#(\w+))?(?:\.(\w+))?\/?>(?:(.*)<\/\1>)?$/);
            if (!m) { return document.querySelector(arg); }
            var elt = document.createElement(m[1]);
            if (m[2]) elt.id = m[2];
            if (m[3]) elt.className = m[3];
            if (m[4]) elt.innerHTML = m[4];
            if (parent) { parent.appendChild(elt); }
            return elt;
        }
        if (arg instanceof HTMLElement) {
            return arg;
        }
        throw new TypeError("either selector, or dom node should be passed");
    }
    var textPropName = 'innerText' in document.body ? 'innerText' : 'textContent';
    dom.text = function (elt, value) {
        if (typeof value === 'undefined') { return elt[textPropName]; }
        elt[textPropName] = value;
    };
    return dom;
});
