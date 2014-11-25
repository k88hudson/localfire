var assert = require('assert');
var Memory = require('../lib/memory');

var m;

describe('Memory', function() {
    beforeEach(function () {
        var memory = {};
        m = new Memory('test', memory);
    });
    describe('interface', function () {
        it('should be an object with Memory prototype', function () {
            assert.equal(typeof m, 'object');
            assert(m instanceof Memory);
        });
        it('should not allow setting the root as a path', function () {
            assert.throws(function () {
                var x = new Memory('');
            });
        });
    });
    describe('_get', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m._get, 'function');
        });
        it('should return a child of an object given a path and a reference', function () {
            var test1 = {one: 1, ten: {number: 10}};
            assert.equal(m._get('one', test1), 1);
            assert.equal(m._get('ten/number', test1), 10);
        });
        it('should return a child of an object from memory given a path', function () {
            var test = {gala: 15};
            m._memory['fruit'] = {apples: test};
            assert.equal(m._get('fruit/apples/gala'), 15);
            assert.equal(m._get('fruit/apples'), test);
        });
        it('should return null if any part of the path does not exist', function () {
            var test1 = {one: 1, ten: {number: 10}};
            m._memory['fruit'] = {apples: 12};
            assert.equal(m._get('ten/whatever', test1), null);
            assert.equal(m._get('nothing/whatever'), null);
        });
    });
    describe('_set', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m._set, 'function');
        });
        it('should return a child of an object given a path and a reference', function () {
            var test1 = {one: 1, ten: {number: 10}};
            m._set('one', 'one', test1);
            m._set('ten/number', 'ten', test1);
            assert.equal(test1.one, 'one');
            assert.equal(test1.ten.number, 'ten');
            m._set('ten', 10, test1);
            assert.equal(test1.ten, 10);
        });
        it('should not set the base reference', function () {
            var test1 = {test: 1};
            var foo = {bar: 123};
            m._set('', 10, test1);
            m._set('', foo, test1);
            assert.equal(test1.test, 1);
        });
    });
    describe('_remove', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m._remove, 'function');
        });
        it('should delete references', function () {
            var test1 = {hello: 'world', one: {two: 'three'}};
            m._remove('hello', test1);
            assert.equal(test1.hello, undefined);
            m._remove('one/two', test1);
            assert.equal(test1.one.two, undefined);
        });
    });

    describe('child', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.child, 'function');
        });
        it('should create a child', function () {
            var n = m.child('hello');
            var o = n.child('world');
            assert(n instanceof Memory);
            assert(o instanceof Memory);
            assert.equal(n._path, 'test/hello');
            assert.equal(o._path, 'test/hello/world');
            assert.equal(m._children[0], n);
        });
        it('should not allow setting \'\' as a path', function () {
            assert.throws(function () {
                var x = m.child('');
            });
        });
    });

    // TODO
    describe('parent', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.parent, 'function');
        });
    });

    // TODO
    describe('root', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.root, 'function');
        });
    });

    describe('key', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.key, 'function');
        });
        it('should return null for root reference', function () {
            assert.equal(m.key(), null);
        });
        it('should return key for child references', function () {
            var a = m.child('blob');
            var b = new Memory('test/whatever');
            assert.equal(a.key(), 'blob');
            assert.equal(b.key(), 'whatever');
        });
    });

    describe('toString', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.toString, 'function');
        });
        it('should return the path', function () {
            var x = new Memory('hello/what');
            assert.equal(m.toString(), 'test');
            assert.equal(x.toString(), 'hello/what');
        });
    });

    describe('set', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.set, 'function');
        });
        it('should set the firebase value', function () {
            var test = {hello: 'world'};
            m.set(100);
            assert.equal(m._memory.test, 100);
            m.set(test);
            assert.notEqual(m._memory.test, test);
            assert.equal(m._memory.test.hello, 'world');
        });
        it('should remove itself if value is null', function () {
            m.set(null);
            assert.equal(m._memory.test, undefined);
        });
        it('should set the firebase value and run a callback', function (done) {
            m.set(100, function (err) {
                assert.equal(err, null);
                assert.equal(m._memory.test, 100);
                done();
            });
        });
    });

    describe('update', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.update, 'function');
        });
        it('should update child values', function () {
            m.update({hello: 'world'});
            assert.equal(m._memory.test.hello, 'world');
        });
        it('should create clones of objects', function () {
            var test = {one: 1};
            m.update({hello: test});
            assert.notEqual(m._memory.test.hello, test);
            assert.equal(m._memory.test.hello.one, 1);
        });
    });

    describe('remove', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.remove, 'function');
        });
        it('should remove itself', function () {
            m.remove();
            assert.equal(typeof m._memory.test, 'undefined');
        });
    });

    describe('push', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.push, 'function');
        });
    });

    describe('setWithPriority', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.setWithPriority, 'function');
        });
    });

    describe('setPriority', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.setPriority, 'function');
        });
    });

    describe('transaction', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.transaction, 'function');
        });
    });
});

describe('Memory (query)', function () {
    beforeEach(function () {
        var memory = {};
        m = new Memory('test', memory);
    });

    describe('on', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.on, 'function');
        });
    });

    describe('off', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.off, 'function');
        });
    });

    describe('once', function () {
        it('should be a function on Memory prototype', function () {
            assert.equal(typeof m.once, 'function');
        });
    });

    // describe('orderByChild', function () {
    //     it('should be a function on Memory prototype', function () {
    //         assert.equal(typeof m.orderByChild, 'function');
    //     });
    // });

    // describe('orderByKey', function () {
    //     it('should be a function on Memory prototype', function () {
    //         assert.equal(typeof m.orderByKey, 'function');
    //     });
    // });

    // describe('orderByPriority', function () {
    //     it('should be a function on Memory prototype', function () {
    //         assert.equal(typeof m.orderByPriority, 'function');
    //     });
    // });

    // describe('startAt', function () {
    //     it('should be a function on Memory prototype', function () {
    //         assert.equal(typeof m.startAt, 'function');
    //     });
    // });

    // describe('endAt', function () {
    //     it('should be a function on Memory prototype', function () {
    //         assert.equal(typeof m.endAt, 'function');
    //     });
    // });

    // describe('equalTo', function () {
    //     it('should be a function on Memory prototype', function () {
    //         assert.equal(typeof m.equalTo, 'function');
    //     });
    // });
});
