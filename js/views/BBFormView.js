Backbone.BBFormView = Backbone.View.extend({
    print_table_from_array: function (a, is_disabled) {
        if (!_.isArray(a) && !_.isObject(a)) {
            return false;
        }
        if (typeof is_disabled === "undefined") {
            is_disabled = true;
        }
        var dom = $('<div>').addClass('form-group');
        _.each(a, function (v, k, l) {
            var label = $('<label>').addClass('col-xs-2 input_atomic');
            label.text(k);
            var input_wrapper = $('<div class="col-xs-1">');
            var input = $('<input>').addClass('form-control');
            if (is_disabled) {
                input.attr('disabled', true);
            }
            //set checkbox here. updateajax to pull checked value too.
            if (v === true || v === 'true' || v === false || v === 'false') {
                input.prop('type', 'checkbox');
                input.removeClass('form-control');
                input_wrapper.addClass('input_atomic');
                if (v === true || v === 'true') {
                    input.prop('checked', 'checked');
                } else {
                    input.prop('checked', false);
                }
            } else {
                input.addClass('money');
                if (_.isEmpty(v) || v == 0 || v == '$0.00' || v == 0.00) {
                    v = '';
                }
            }
            input.data('key', k);
            input.val(v);
            dom.append(label).append(input_wrapper.append(input));
        }, this);
        return dom;
    },
    update_ajax: function (e) {
        if (is_validator_initializing) {
            return;
        }
        var flag_dont_update = false;
        var target = $(e.target);
        if (e.target.tagName == 'BUTTON' || target.hasClass('skip_ajax') || target.hasClass('file-caption') || target.prop('type') == 'file' || target.prop('readonly') == true) {
            return;
        }
        var is_multi_select = target.hasClass('multi_select') || target.hasClass('select2-search__field') || target.hasClass('select2-selection--multiple');
        var form = target.parents('form');
        var model = form.data('model');//offer
        var new_attr = {};
        if (_.isEmpty(target.prop('name'))) {
            //update ajax to the related JSON array field
            var wrapper_div = $(target.parents('div.array_field_wrapper'));
            var array_input = $('#' + wrapper_div.data('array_field_id'));
            var inputs = {};
            wrapper_div.find(':input').each(function (i, e) {
                e = $(e);
                var key = e.data('key');
                if (typeof key == 'undefined') {
                    flag_dont_update = true;
                    return;
                }
                var v = e.val();
                if (e.prop('type') == 'checkbox') {
                    v = e.prop('checked');
                }
                if (typeof v == 'string') {
                    v = v.replace("$", "");
                }
                if (target.hasClass('money') && typeof v == 'string') {
                    v = v.replace('$', '').replace('.00', '').replace(',', '');
                }
                inputs[key] = v;
            });
            if (flag_dont_update) return;
            array_input.val(JSON.stringify(inputs));
            target = array_input;
        }
        var val = target.val();
        if (typeof val == 'undefined') {
            return -1;
        }
        if (target.hasClass('money')) {
            val = val.replace('$', '').replace('.00', '').replace(',', '');
        }
        if (isNumeric(val)) {
            val = parseFloat(val);
        }
        new_attr[target.prop('name')] = val;
        if (!is_multi_select && target.parent().is('label')) {
            target.before('<span class="glyphicon glyphicon-upload"></span>');
        }
        var self = this;
        this.model.save(new_attr, {
            patch: true, success: function () {
                target.prevAll('span.glyphicon-upload').remove();
                if (is_multi_select) {
                    this.render(true);
                    return;
                }
                target.before('<span class="glyphicon glyphicon-ok-circle upload_in_progress"></span>');
                setTimeout(function () {
                    target.prevAll('span.glyphicon-ok-circle').fadeOut(1400).remove();
                    self.render(true);
                    bs_close_all_modals();
                }, 2000);
            }, error: function () {
                target.prevAll('span.glyphicon-upload').remove();
                bs_close_all_modals();
            }
        });
        bs_close_all_modals();
    },
    /**
     * Push value of current element el to the related JSON array field
     * Applicable for the fields of general expense and production expense
     */
    update_json_array: function (el) {
        var target = $(el);
        var flag_dont_update = false;
        var wrapper_div = $(target.closest('div.array_field_wrapper'));
        var array_input = $('#' + wrapper_div.data('array_field_id'));
        var inputs = {};
        wrapper_div.find(':input').each(function (i, e) {
            e = $(e);
            var key = e.data('key');
            if (typeof key === 'undefined') {
                flag_dont_update = true;
                return;
            }
            var v = e.val();
            if (e.prop('type') === 'checkbox') {
                v = e.prop('checked');
            }
            if (typeof v === 'string') {
                v = v.replace("$", "");
            }
            if (e.hasClass('money')) {
                v = v.replace('$', '').replace('.0000', '').replace('.00', '');
            }
            inputs[key] = v;
        });
        if (flag_dont_update) return;
        // array_input.val(JSON.stringify(inputs));
        array_input = $("." + wrapper_div.data('array_field_id'));
        array_input.val(JSON.stringify(inputs));

        target = array_input;
    }
});