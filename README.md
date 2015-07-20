# ampersand-multiselect-view

Lead Maintainer: [Kyle Farris (@kylefarris)](https://github.com/kylefarris)

# overview

A view module for intelligently rendering and validating selectbox input. Works well with ampersand-form-view. Based off of ampersand-select-view.

## install

```
npm install ampersand-multiselect-view
```

<!-- starthide -->
Part of the [Ampersand.js toolkit](http://ampersandjs.com) for building clientside applications.
<!-- endhide -->

## API Reference

### clear() - [Function] - returns `this`
Alias to calling `setValue(null, true)`.  Unselects all options.

### reset() - [Function] - returns `this`
Sets the selected option and view value to the original option value provided during construction.

### setValue([value, skipValidationMessage]) - [Function] - returns `this`
Sets the selected options to those which match the provided value(s).  Updates the view's `.values` accordingly.  MultiSelectView will error if no matching options exist.

### constructor - [Function] `new MultiSelectView([options])`
#### options
##### general options
- `autoRender`: [default: `false`] generally, we leave rendering of this FieldView to its controlling form
- `name`: the `<select>`'s `name` attribute's value. Used when reporting to parent form
- `parent`: parent form reference
- `options`: array/collection of options to render into the select box
- `[el]`: element if you want to render the view into
- `[template]`: a custom template to use (see 'template' section, below, for more)
- `[required]`: [default: `false`] field required
- `[eagerValidate]`: [default: `false`] validate and show messages immediately.  Note: field will be validated immediately to provide a true `.valid` value, but messages by default are hidden.
- `[values]`: initial value(s) (array) for the `<select>`.  `values` **must** be a members of the `options` set.

##### label & validation options
- `[label]`: [default: `name` value] text to annotate your select control
- `[invalidClass]`: [default: `'select-invalid'`] class to apply to root element if invalid
- `[validClass]`: [default: `'select-valid'`] class to apply to root element if valid
- `[requiredMessage]`: [default: `'Selection required'`] message to display if invalid and required

##### collection option set
If using a collection to produce `<select>` `<option>`s, the following may also be specified:

- `[disabledAttribute]`: boolean model attribute to flag disabling of the option node
- `[idAttribute]`: model attribute to use as the id for the option node.  This will be returned by `SelectView.prototype.value`
- `[textAttribute]`: model attribute to use as the text of the option node in the select box
- `[yieldModel]`: [default: `true`] if options is a collection, yields the full model rather than just its `idAttribute` to `.value`

When the collection changes, the view will try and maintain its currently `.value`.  If the corresponding model is removed, the &lt;select&gt; control will default to the 0th index &lt;option&gt; and update its value accordingly.

## custom template
You may override the default template by providing your own template string to the [constructor](#constructor---function-new-selectviewoptions) options hash.  Technically, all you must provided is a `<select>` element.  However, your template may include the following under a single root element:

1. An element with a `data-hook="label"` to annotate your select control
1. An `<select>` element to hold your `options` with the `multiple` or `multiple="multiple"` attribute.
1. An element with a `data-hook="message-container"` to contain validation messages
1. An element with a `data-hook="message-text"` nested beneath the `data-hook="message-container"` element to show validation messages

Here's the default template for reference:
```html
<label class="select">
    <span data-hook="label"></span>
    <select multiple="multiple"></select>
    <span data-hook="message-container" class="message message-below message-error">
        <p data-hook="message-text"></p>
    </span>
</label>
```

## example

```javascript
var FormView = require('ampersand-form-view');
var MultiSelectView = require('ampersand-multiselect-view');


module.exports = FormView.extend({
    fields: function () {
        return [
            new MultiSelectView({
                label: 'Pick some colors!',
                // actual field name
                name: 'color',
                parent: this,
                // you can pass simple string options
                options: ['blue', 'orange', 'red'],
                // you can specify that they have to pick at least one
                required: true
            }),
            new MultiSelectView({
                name: 'option',
                parent: this,
                // you can also pass array, first is the value, second is used for the label
                // and an optional third value can used to disable the option
                options: [ ['a', 'Option A'], ['b', 'Option B'], ['c', 'Option C', true] ]
            }),
            new MultiSelectView({
                name: 'model',
                parent: this,
                // you can pass in a collection here too
                options: collection,
                // and pick some item from the collection as the selected ones
                values: [collection1.at(2), collection1.at(5)],
                // here you specify which attribute on the objects in the collection
                // to use for the value returned.
                idAttribute: 'id',
                // you can also specify which model attribute to use as the title
                textAttribute: 'title',
                // you can also specify a boolean model attribute to render items as disabled
                disabledAttribute: 'disabled',
                // here you can specify if it should return the selected model(s) from the
                // collection, or just the id attribute(s).  defaults `true`
                yieldModel: false
            })
        ];
    }
});

```
## gotchas

* Numeric option values are generally stringified by the browser.  Be mindful doing comparisons.  You'll generally desire to inspect `selectView.values` (the value of your selected options' input) over `selectView.select.values` (the value returned from the browser).
    * Additionally, do **not** use option sets containing values that `==` one another.  E.g., do not use options whose values are "2" (string) and 2 (number).  Browsers cannot distinguish between them in the select control context, thus nor can ampersand-select-view.
* `null`, `undefined`, or `''` option values are not considered `valid` when the field is required.  This does not apply when options are from a collection and `yieldModel` is enabled.

## browser support

[![testling badge](https://ci.testling.com/AmpersandJS/ampersand-select-view.png)](https://ci.testling.com/AmpersandJS/ampersand-select-view)

## changelog

* We're still on the beta version!

## credits

Based considerably off of the `ampersand-select-view` by [Christopher Dieringer (@cdaringe)](https://github.com/cdaringe).

## contributing

Do it. This is still experimental--I can use all the help I can get!

## license

MIT

