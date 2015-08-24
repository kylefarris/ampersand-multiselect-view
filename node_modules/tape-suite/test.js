var suite = require('./tape-suite');
var assert = require('assert');

(function () {
    var beforeRan = 0;
    var afterRan = 0;

    suite('Let us test the test suite', function (t) {
        t.beforeEach(function () {
            beforeRan++;
        });

        t.afterEach(function () {
            afterRan++;
        });
    });

    setTimeout(function () {
        assert.equal(beforeRan, 0);
        assert.equal(afterRan, 0);
        console.log('✔ With no tests, before/after do not run');
    }, 500);
})();

(function () {
    var seq = [];

    suite('Let us test the test suite', function (t) {
        t.beforeEach(function () {
            seq.push('before');
        });

        t.afterEach(function () {
            seq.push('after');
        });

        t.test('first test', function (t) {
            seq.push('test 1');
            t.end();
        });

        t.test('second test', function (t) {
            seq.push('test 2');
            t.end();
        });
    });

    setTimeout(function () {
        assert.deepEqual(seq, [
            'before',
            'test 1',
            'after',

            'before',
            'test 2',
            'after'
        ]);
        console.log('✔ With tests, sequence is correct');
    }, 500);
})();


(function () {
    var seq = [];

    suite('Let us test the test suite', function (t) {
        t.beforeEach(function () {
            seq.push('before');
        });

        t.beforeEach(function () {
            seq.push('before 2');
        });

        t.afterEach(function () {
            seq.push('after');
        });

        t.afterEach(function () {
            seq.push('after 2');
        });

        t.test('first test', function (t) {
            seq.push('test 1');
            t.end();
        });

        t.test('second test', function (t) {
            seq.push('test 2');
            t.end();
        });
    });

    setTimeout(function () {
        assert.deepEqual(seq, [
            'before',
            'before 2',
            'test 1',
            'after',
            'after 2',

            'before',
            'before 2',
            'test 2',
            'after',
            'after 2'
        ]);
        console.log('✔ With tests, sequence is correct');
    }, 500);
})();

