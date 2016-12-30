Backbone.BBFormView = Backbone.View.extend({
    print_table_from_array: function (a) {
        if (!_.isArray(a) && !_.isObject(a)) {
            return false;
        }
        var dom = $('<div>').addClass('form-group');
        _.each(a, function (v, k, l) {
            var label = $('<label>').addClass('col-xs-2 input_atomic');
            label.text(k);
            var input_wrapper = $('<div class="col-xs-1">');
            var input = $('<input disabled>').addClass('form-control');
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
            }
            input.data('key', k);
            input.val(v);
            dom.append(label).append(input_wrapper.append(input));
        }, this);
        return dom;
    },
    update_ajax: function (e) {
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
                var v = e.val();
                if (e.prop('type') == 'checkbox') {
                    v = e.prop('checked');
                }
                if (typeof v == 'string') {
                    v = v.replace("$", "");
                }
                inputs[key] = v;
            });
            array_input.val(JSON.stringify(inputs));
            target = array_input;
        }
        var val = target.val().replace('$', '');
        if (isNumeric(val)){
            val = parseFloat(val);
        }
        new_attr[target.prop('name')] = val;
        if (!is_multi_select && target.parent().is('label')) {
            target.before('<span class="glyphicon glyphicon-upload"></span>');
        }
        var self = this.model;
        this.model.save(new_attr, {
            patch: true, success: function () {
                target.prevAll('span.glyphicon-upload').remove();
                if (is_multi_select) {
                    return;
                }
                target.before('<span class="glyphicon glyphicon-ok-circle upload_in_progress"></span>');
                setTimeout(function () {
                    target.prevAll('span.glyphicon-ok-circle').fadeOut(1400).remove();
                }, 2000);
            }, error: function () {
                target.prevAll('span.glyphicon-upload').remove();
            }
        });
    }
});