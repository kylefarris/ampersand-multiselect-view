/*global console*/
var MultiSelectView = require('../ampersand-multiselect-view');
var FormView = require('ampersand-form-view');

var Model = require('ampersand-state').extend({
    props: {
        id: 'string',
        title: 'string'
    }
});
var Collection = require('ampersand-collection').extend({
    model: Model
});

var collection1 = new Collection([
    { id: 'foo', title: 'Foo Option' },
    { id: 'bar', title: 'Bar Option' },
    { id: 'baz', title: 'Baz Option' }
]);


var BaseView = FormView.extend({
    fields: function () {
        var requiredInvalid = window.requiredInvalid = new MultiSelectView({
                name: 'three.2',
                parent: this,
                options: collection1,
                idAttribute: 'id',
                textAttribute: 'title',
                required: true,
        });

        var requiredInvalidEager = window.requiredInvalidEager = new MultiSelectView({
                name: 'three.2',
                parent: this,
                options: collection1,
                idAttribute: 'id',
                textAttribute: 'title',
                required: true,
                eagerValidate: true,
        });

        return [
            new MultiSelectView({
                name: 'one.1',
                parent: this,
                options: ['a', 'b', 'c'],
            }),
            new MultiSelectView({
                name: 'one.2',
                parent: this,
                options: ['a', 'b', 'c'],
            }),
            new MultiSelectView({
                name: 'one.3',
                parent: this,
                options: ['a', 'b', 'c'],
                value: ['c'],
            }),

            new MultiSelectView({
                name: 'two.2',
                parent: this,
                options: [ ['a', 'Option A'], ['b', 'Option B'], ['c', 'Option C'] ],
                value: ['b'],
            }),

            new MultiSelectView({
                name: 'three.1',
                parent: this,
                options: collection1,
                value: collection1.at(2),
                idAttribute: 'id',
                textAttribute: 'title',
            }),
            requiredInvalid,
            requiredInvalidEager,

            new MultiSelectView({
                name: 'three.3',
                parent: this,
                options: collection1,
                value: [collection1.at(2)],
                idAttribute: 'id',
                textAttribute: 'title',
                yieldModel: false
            }),

            new MultiSelectView({
                name: 'select-only',
                parent: this,
                options: ['a', 'b', 'c'],
                template: '<select multiple></select>'
            })
        ];
    }
});


document.addEventListener('DOMContentLoaded', function () {
    var baseView = new BaseView({el: document.body });
    baseView.on('all', function (name, field) {
        console.log('Got event', name, field.value, field.valid);
    });
    baseView.render();

    //cycle a field
    var i = 0;
    var field = baseView.getField('one.3');
    var options = [null].concat(field.options);

    setInterval(function () {
        i = (i + 1) % (field.options.length + 1);

        baseView.getField('one.3').setValue(options[i]);
    }, 1000);


    //Add options to a collection field
    setInterval(function () {
        collection1.add({ id: new Date().toString(), title: new Date().toString() });
    }, 1000);
});
