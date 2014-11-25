var ee = require('event-emitter');
var dotty = require('dotty');
var clone = require('clone');
var memory = {};

function Snapshot(key, val) {
    var self = this;
    self._key = key;
    self._val = clone(val);
}

Snapshot.prototype.val = function () {
    return this._val;
};

Snapshot.prototype.key = function () {
    return this._key;
};

function Memory(path, ref) {
    var self = this;
    if (path === '') throw new Error('Cannot create instance from root path');

    self._memory = ref || memory;
    self._path = path;
    self._emitter = ee();
    self._children = [];

    self.on = self._emitter.on;
    self.off = self._emitter.off;
    self.once = self._emitter.once;
}

Memory.prototype._get = function (path, ref) {
    var self = this;
    ref = ref || self._memory;
    var parts = path.split('/');
    var result = path === '' ? ref : dotty.get(ref, parts) || null;
    return result;
};

Memory.prototype._set = function (path, value, ref) {
    var self = this;
    ref = ref || self._memory;
    var parts = path.split('/');
    if (path === '') return;
    dotty.put(ref, parts, value);
};

Memory.prototype._remove = function (path, ref) {
    var self = this;
    ref = ref || self._memory;
    var parts = path.split('/');
    if (path === '') return;
    dotty.remove(ref, parts);
};


Memory.prototype.child = function (path) {
    var self = this;
    if (path === '') throw new Error('Cannot create instance from root path');
    var child = new Memory(self._path + '/' + path);
    self._children.push(child);
    return child;
};

Memory.prototype.key = function () {
    var self = this;
    var parts = self._path.split('/');
    if (parts.length === 1) {
        return null;
    } else {
        return parts[parts.length - 1];
    }
};

Memory.prototype.toString = function () {
    var self = this;
    return self._path;
};

Memory.prototype.set = function (value, onComplete) {
    var self = this;
    if (typeof value === 'object') {
        value = clone(value);
    }
    if (value === null) {
        self._remove(self._path);
        self._children = [];
    } else {
        self._set(self._path, value);
    }
    if (onComplete) onComplete(null);
};

Memory.prototype.update = function (values, onComplete) {
    var self = this;
    if (typeof values !== 'object') {
        // Todo: error
        return;
    }
    values = clone(values);
    var val;
    for (var key in values) {
        if (!values.hasOwnProperty(key)) return;
        val = values[key];
        if (typeof val === 'object') val = clone(val);
        self._set(self._path + '/' + key, val);
    }
    if (onComplete) onComplete(null);
};

Memory.prototype.remove = function (onComplete) {
    var self = this;
    self.set(null);
    if (onComplete) onComplete(null);
};


// Memory.prototype._broadcast = function() {
//     var self = this;
//     if (!self._ref) {
//         self._emitter.emit('value', null);
//     } else {
//         self._emitter.emit('value', new Snapshot(self._key, self._ref));
//     }
// }

// Memory.prototype.update = function (newValues) {
//     var self = this;
//     for (var key in newValues) {
//         if (newValues.hasOwnProperty(key)) {
//             if (newValues[key] === null) {
//                 delete self._data[key];
//             } else {
//                 self._ref[key] = newValues[key];
//             }
//         }
//     }
//     self._broadcast();
// };

// Memory.prototype.remove = function () {
//     var self = this;
//     delete self._ref;
//     self._broadcast();
// };

// Memory.prototype.child = function (path) {
//     return new Memory(this._path + '/' + path);
// };

module.exports = Memory;
