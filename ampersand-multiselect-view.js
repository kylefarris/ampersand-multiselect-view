/* $AMPERSAND_VERSION */
var domify = require('domify');
var dom = require('ampersand-dom');
var matches = require('matches-selector');
var View = require('ampersand-view');

// Replaceable with anything with label, message-container, message-text data-hooks and a <select multiple="multiple"s>
var defaultTemplate = [
    '<label class="select">',
        '<span data-hook="label"></span>',
        '<select multiple="multiple"></select>',
        '<span data-hook="message-container" class="message message-below message-error">',
            '<p data-hook="message-text"></p>',
        '</span>',
    '</label>'
].join('\n');

var createOption = function(value, text, disabled) {
    var node = document.createElement('option');

    // Set to empty-string if undefined or null, but not if 0, false, etc
    if (value === null || value === undefined) {
        value = '';
    }

    if (disabled) {
        node.disabled = true;
    }
    node.textContent = text;
    node.value = value;

    return node;
};

module.exports = View.extend({
    initialize: function(opts) {
        opts = opts || {};

        if (typeof opts.name !== 'string') {
            throw new Error('MultiSelectView requires a name property.');
        }
        this.name = opts.name;

        if (!Array.isArray(opts.options) && !opts.options.isCollection) {
            throw new Error('MultiSelectView requires select options.');
        }
        this.options = opts.options;

        if (this.options.isCollection) {
            this.idAttribute = opts.idAttribute || this.options.mainIndex || 'id';
            this.textAttribute = opts.textAttribute || 'text';
            this.disabledAttribute = opts.disabledAttribute;
        }

        this.el = opts.el;
        if (opts.label === undefined) {
            this.label = this.name;
        } else {
            this.label = opts.label;
        }
        this.parent = opts.parent || this.parent;
        this.template = opts.template || defaultTemplate;
        this.startingValues = opts.value;
        this.yieldModels = (opts.yieldModels === false) ? false : true;

        this.eagerValidate = opts.eagerValidate;
        this.required = opts.required || false;
        this.validClass = opts.validClass || 'input-valid';
        this.invalidClass = opts.invalidClass || 'input-invalid';
        if (opts.requiredMessage === undefined) {
            this.requiredMessage = 'Selection required';
        } else {
            this.requiredMessage = opts.requiredMessage;
        }

        this.onChange = this.onChange.bind(this);

        this.startingValues = this.setValue(opts.value, this.eagerValidate ? false : true, true);

        if (opts.beforeSubmit) {
            this.beforeSubmit = opts.beforeSubmit;
        }
        if (opts.autoRender) {
            this.autoRender = opts.autoRender;
        }
    },

    render: function () {
        var elDom,
            labelEl;
        if (this.rendered) {
            return;
        }

        elDom = domify(this.template);
        if (!this.el) {
            this.el = elDom;
        } else {
            this.el.appendChild(elDom);
        }

        labelEl = this.el.querySelector('[data-hook~=label]');
        if (labelEl) {
            labelEl.textContent = this.label;
            this.label = labelEl;
        } else {
            delete this.label;
        }

        if (this.el.tagName === 'SELECT') {
            this.select = this.el;
        } else {
            this.select = this.el.querySelector('select');
        }
        if (!this.select) {
            throw new Error('no select found in template');
        }
        if (matches(this.el, 'select')) {
            this.select = this.el;
        }
        if (this.select) {
            this.select.setAttribute('name', this.name);
        }

        this.select.selectedIndices = [];

        this.bindDOMEvents();
        this.renderOptions();
        this.updateSelectedOptions();

        if (this.options.isCollection) {
            this.options.on('add remove reset', function() {
                this.renderOptions();
            }.bind(this));
        }
        this.validate(this.eagerValidate ? false : true, true);
        return this;
    },

    getAllOptions: function() {
        return Array.prototype.slice.call(this.select.querySelectorAll('option'),0);
    },

    getSelectedValues: function() {
        return Array.prototype.slice.call(this.select.querySelectorAll('option:checked'),0).map(function(v) { return v.value; });
    },

    getSelectedIndices: function() {
        return Array.prototype.slice.call(this.select.querySelectorAll('option:checked'),0).map(function(v) { return v.index; });
    },

    onChange: function () {
        this.setValue(this.getSelectedValues().map(function(v) {
            if (this.options.isCollection && this.yieldModels) {
                return this.getModelForId(v);
            } else {
                return v;
            }
        }.bind(this)));
    },

    /**
     * Finds a model in the options collection provided an ID
     * @param  {any} id
     * @return {State}
     * @throws {RangeError} If model not found
     */
    getModelForId: function (id) {
        return this.options.filter(function (model) {
            // intentionally coerce for '1' == 1
            return model[this.idAttribute] == id;
        }.bind(this))[0];
    },

    bindDOMEvents: function () {
        this.el.addEventListener('change', this.onChange, false);
    },

    renderOptions: function () {
        if (!this.select) {
            return;
        }

        this.select.innerHTML = '';
        this.options.forEach(function (option) {
            this.select.appendChild(
                createOption(
                    this.getOptionValue(option),
                    this.getOptionText(option),
                    this.getOptionDisabled(option)
                )
            );
        }.bind(this));
    },

    /**
     * Updates the <select> control to set the select options when the options
     * have changed programatically (i.e. not through direct user selection)
     * @return {MultiSelectView} this
     * @throws {Error} If no option exists for this.value
     */
    updateSelectedOptions: function () {
        var lookupValues = this.value;

        // Unselect all options (we'll re-select the matching options later if neccessary)
        this.getAllOptions().forEach(function(v,i) {
           this.select.options[i].selected = false;
        }.bind(this));

        if (lookupValues === null || lookupValues === undefined || lookupValues === '') {
            return this;
        }

        // Make sure values is an array or collection
        if (!lookupValues.isCollection && Object.prototype.toString.call(lookupValues) !== '[object Array]') {
            lookupValues = [lookupValues];
        }

        // Remove any options that don't exist in the collection (if collection is provided for options)
        // and get just the idAttribute values
        if (this.options.isCollection && this.yieldModels) {
            lookupValues = lookupValues.filter(function(v) {
                return (v.hasOwnProperty(this.idAttribute) ? false : true);
            }.bind(this)).map(function(v) {
                return v[this.idAttribute];
            }.bind(this));
        }

        // Actually set the matching options to "selected"
        lookupValues.forEach(function(v) {
            var option = this.select.querySelector('[value="'+v+'"]');
            if (option && 'selected' in option) {
                option.selected = true;
            }
        }.bind(this));

        return this;
    },

    remove: function () {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
        this.el.removeEventListener('change', this.onChange, false);
    },

    /**
     * Sets control to unselectedText option, or user specified option with `null`
     * value
     * @return {MultiSelectView} this
     */
    clear: function() {
        this.setValue([], true);
        return this;
    },

    /**
     * Sets the selected option and view value to the original option value provided
     * during construction
     * @return {MultiSelectView} this
     */
    reset: function() {
        return this.setValue(this.startingValues, true);
    },

    setValue: function (values, skipValidationMessage) {
        if (values === null || values === undefined || values === '' || values === []) {
            this.value = [];
        } else {
            // Only keep values that actually exist in the option set
            this.value = values.filter(function(v) {
                return (this.getOptionByValue(v) === false ? false : true);
            }.bind(this));
        }

        this.validate(skipValidationMessage);
        if (this.select) {
            this.updateSelectedOptions();
        }
        if (this.parent && typeof this.parent.update === 'function') {
            this.parent.update(this);
        }
        return this.value;
    },

    validate: function (skipValidationMessage) {
        if (!this.required) {
            // selected option always known to be in option set,
            // thus field is always valid if not required
            this.valid = true;
            if (this.select) {
                this.toggleMessage(skipValidationMessage);
            }
            return this.valid;
        }

        if (this.required && (!this.value || this.value === [])) {
            this.valid = false;
            if (this.select) {
                this.toggleMessage(skipValidationMessage, this.requiredMessage);
            }
        } else {
            this.valid = true;
            if (this.select) {
                this.toggleMessage(skipValidationMessage);
            }
        }

        return this.valid;
    },

    /**
     * Called by FormView on submit
     * @return {MultiSelectView} this
     */
    beforeSubmit: function() {},

    /**
     * Gets the option corresponding to provided value.
     * @param  {*} string, state, or model
     * @return {*} string, array, state, or model
     */
    getOptionByValue: function(value) {
        var model;
        if (this.options.isCollection) {
            // find value in collection, error if no model found
            if (this.options.indexOf(value) === -1) {
                model = this.getModelForId(value);
            } else {
                model = value;
            }
            if (!model) {
                console.error('model or model idAttribute not found in options collection');
                return false;
            }
            return this.yieldModels ? model : model[this.idAttribute];
        } else if (Array.isArray(this.options)) {
            // find value value in options array
            // find option, formatted [['val', 'text'], ...]
            if (this.options.length && Array.isArray(this.options[0])) {
                for (var i = this.options.length - 1; i >= 0; i--) {
                    if (this.options[i][0] == value) {
                        return this.options[i];
                    }
                }
            }
            // find option, formatted ['valAndText', ...] format
            if (this.options.length && this.options.indexOf(value) !== -1) {
                return value;
            }
            return false;
        }
        throw new Error('select option set invalid');
    },

    /**
     * Tests if option set has an option corresponding to the provided value
     * @param  {*} value
     * @return {Boolean}
     */
    hasOptionByValue: function(value) {
        try {
            this.getOptionByValue(value);
            return true;
        } catch (err) {
            return false;
        }
    },

    getOptionValue: function (option) {
        if (Array.isArray(option)) {
            return option[0];
        }
        if (this.options.isCollection) {
            return option[this.idAttribute];
        }
        return option;
    },

    getOptionText: function (option) {
        if (Array.isArray(option)) {
            return option[1];
        }
        if (this.options.isCollection) {
            if (this.textAttribute && option[this.textAttribute] !== undefined) {
                return option[this.textAttribute];
            }
        }

        return option;
    },

    getOptionDisabled: function (option) {
        if (Array.isArray(option)) {
            return option[2];
        }
        if (this.options.isCollection && this.disabledAttribute) {
            return option[this.disabledAttribute];
        }

        return false;
    },

    toggleMessage: function (hide, message) {
        var mContainer = this.el.querySelector('[data-hook~=message-container]'),
            mText = this.el.querySelector('[data-hook~=message-text]');

        if (!mContainer || !mText) {
            return;
        }

        if (hide) {
            dom.hide(mContainer);
            mText.textContent = '';
            dom.removeClass(this.el, this.validClass);
            dom.removeClass(this.el, this.invalidClass);
            return;
        }

        if (message) {
            dom.show(mContainer);
            mText.textContent = message;
            dom.addClass(this.el, this.invalidClass);
            dom.removeClass(this.el, this.validClass);
        } else {
            dom.hide(mContainer);
            mText.textContent = '';
            dom.addClass(this.el, this.validClass);
            dom.removeClass(this.el, this.invalidClass);
        }
    }
});
