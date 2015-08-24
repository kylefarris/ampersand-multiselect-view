var tape = require('tape');

var call = function (fn) { fn(); };

function suite (name, cb) {
    var beforeEach = [];
    var afterEach = [];

    var beforeRun = false;

    var runTest = function (cb) {
        return function (t) {
            beforeEach.forEach(call);
            cb(t);
            afterEach.forEach(call);
        };
    };

    var _suite = {
        beforeEach: function (cb) {
            beforeEach.push(cb);
        },

        afterEach: function (cb) {
            afterEach.push(cb);
        },

        test: function (name, cb) {
            tape(name, runTest(cb));
        }
    };

    _suite.test.only = function (name, cb) {
        tape.only(name, runTest(cb));
    };

    cb(_suite);
}

//Export original tape
suite.tape = tape;

module.exports = suite;
