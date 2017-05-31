app.views.OfferView = Backbone.BBFormView.extend({
    tagName: "div",
    id: "offer_form",
    className: "col-sm-12",
    model: app.models.Offer,
    events: {
        "blur .edit": "update_ajax",
        "change .multi_select": "update_ajax",
        "blur #var_expense :input": "update_ve"
    },
    initialize: function () {
        this.delegateEvents();
    },
    render: function (is_edit_mode) {
        if (typeof is_edit_mode == "undefined" || !is_edit_mode) {
            is_edit_mode = false;
        }
        this.$el.html(this.template(this.model.attributes));
        var selects = this.$el.find('select');
        _.each(selects, function (e) {
            var val = this.model.get($(e).prop('name'));
            if (val == null) {
                val = '';
            }
            $(e).val(val);
        }, this);
        var gen_exp_html = this.print_table_from_array(app.utils.misc.json_parse(this.model.get_general_expense()));
        this.$el.find('#general_expense').html(gen_exp_html);
        var prod_exp_html = this.print_table_from_array(JSON.parse_3t(this.model.get_production_expense()));
        this.$el.find('#production_expense').html(prod_exp_html);

        this.update_ve(this.$el.find('input[name=rental_note]'), false, true);
        this.update_ve(this.$el.find('input[name=tixcom_note]'), false, true);
        this.update_ve(this.$el.find('input[name=tix_service_fee_note]'), false, true);
        this.update_ve(this.$el.find('input[name=box_office_fee_note]'), false, true);
        this.update_ve(this.$el.find('input[name=event_tax_note]'), false, true);
        this.update_ve(this.$el.find('input[name=insurance_note]'), false, true);
        this.update_ve(this.$el.find('input[name=sesec_note]'), false, true);
        this.update_ve(this.$el.find('input[name=ascap_note]'), false, true);
        this.update_ve(this.$el.find('input[name=bmi_note]'), false, true);
        this.update_ve(this.$el.find('input[name=cc_fee_note]'), false, true);


        var edit_switch = $('.edit_switch');
        edit_switch.trigger('change');
        b3_autonumeric();

        $('input[type=date]').datetimepicker({format: 'Y-m-d', timepicker: false});
        $('input[type=time]').datetimepicker({format: 'h:i:s', timepicker: true, datepicker: false});
        this.recalculate_aw_values();
        return this.$el;
    },
    after_render: function () {
        this.recalculate_aw_values();
        $(this.$el.find('.multi_select')).select2();
        // this.$el.find('#var_expense input[name$="flat_rate"]').trigger('change');
        b3_autonumeric();
        this.delegateEvents();

    },
    /**
     * Update variable expense values.
     * @param e Event or jQuery. This is variable expense input, such as rental_flat_rate
     * @param real_time_update boolean. True if this is real-time update
     * @param save_rest boolean Whether or not to initiate a RESTful patch
     */
    update_ve: function (e, save_rest, real_time_update) {
        if (typeof save_rest === "undefined") {
            save_rest = true;
        }
        if (typeof real_time_update === "undefined") {
            real_time_update = false;
        }
        var ve_form = $('#var_expense');
        var gross_potential = 0;
        var gross_ticket = 0, net_potential = 0, sellable_ticket = 0;
        var att = this.model.attributes;

        if (e instanceof jQuery) {//create mode real-time update
            ve_form = $('#var_expense_cr8');
            gross_potential = parseFloatOr0($('#create_offer .gross_potential').val());
            net_potential = parseFloatOr0($('#create_offer .net_potential').val());
            gross_ticket = parseFloatOr0($('#create_offer .sum_gross_ticket').val());
            sellable_ticket = parseFloatOr0($('#create_offer .total_sellable_ticket').val());
        } else {
            if (e === null) {
                e = $('#var_expense_cr8');//upon saving create form
                ve_form = $('#var_expense_cr8');
                gross_potential = parseFloatOr0($('#create_offer .gross_potential').val());
                net_potential = parseFloatOr0($('#create_offer .net_potential').val());
                gross_ticket = parseFloatOr0($('#create_offer .sum_gross_ticket').val());
                sellable_ticket = parseFloatOr0($('#create_offer .total_sellable_ticket').val());
            } else {
                e = $(e.target);
                gross_potential = parseFloatOr0($('#gross_potential').val());
                net_potential = parseFloatOr0($('#net_potential').val());
                gross_ticket = parseFloatOr0($('#gross_ticket').val());
                sellable_ticket = parseFloatOr0($('form.edit .total_sellable_ticket').val());
            }
        }
        if (real_time_update) {
            if (e.hasOwnProperty('target')) {//this is fired by event
                e = $(e.target);
            }
            //else, it should be element passed by this->render
            e = $(e);
            gross_potential = parseFloatOr0($('#gross_potential').val());
            net_potential = parseFloatOr0($('#net_potential').val());
            gross_ticket = parseFloatOr0($('#gross_ticket').val());
            sellable_ticket = parseFloatOr0($('form.edit .total_sellable_ticket').val());
        }

        var ve_values = flat_array_to_assoc(ve_form.find(':input:not([readonly])').serializeArray());
        var self = this;
        //find all siblings
        var $siblings = $(e.parent().parent().find(':input:not([readonly])'));
        var min = $siblings.filter(function (i, v) {
            return v.name.indexOf('_min') != -1;
        });
        min = parseFloatOr0(min.val());
        var max = $siblings.filter(function (i, v) {
            return v.name.indexOf('_max') != -1;
        });
        max = parseFloatOr0(max.val());
        var flat_rate = $siblings.filter(function (i, v) {
            return v.name.indexOf('_flat_rate') != -1;
        });
        if (flat_rate.length == 1) {
            flat_rate = parseFloatOr0(flat_rate.val());
        }
        var per_tix_percent = $siblings.filter(function (i, v) {
            return v.name.indexOf('_per_ticket_percent') != -1;
        });
        if (per_tix_percent.length == 1) {
            per_tix_percent = parseFloatOr0(per_tix_percent.val());
        }
        var per_tix_dollar = $siblings.filter(function (i, v) {
            return v.name.indexOf('_per_ticket_dollar') != -1;
        });
        if (per_tix_dollar.length == 1) {
            per_tix_dollar = parseFloatOr0(per_tix_dollar.val());
        }
        //start assigning sellout potential
        var $sellout_potential = $(e.parent().parent().find(':input[readonly]'));
        var sellout_potential = 0;
        if (per_tix_percent > 0) {
            sellout_potential = net_potential * per_tix_percent / 100;
        }
        var sellable_or_gross_ticket = sellable_ticket;
        if (['event_tax', 'insurance', 'sesec', 'bmi', 'ascap'].indexOf($sellout_potential.data('category')) !== -1) {
            sellable_or_gross_ticket = gross_ticket;
        }
        if (per_tix_dollar > 0) {
            sellout_potential = sellable_or_gross_ticket * per_tix_dollar;
        }
        if (flat_rate > 0) {
            sellout_potential = flat_rate;
        }
        if (max != 0) {
            sellout_potential = max;
        }
        $sellout_potential.val(Number(sellout_potential).toFixed(2));
        if (save_rest === true) {
            this.model.save('variable_expense', JSON.stringify(ve_values), {patch: true, success: self.recalculate_aw_values});
        } else {
            $('#variable_expense_input_cr8').val(JSON.stringify(ve_values));//this is quickfix for Create Mode
        }

        //calculate ASCAP and BMI
        var form = e.closest('form');
        var rate = 0;
        if (gross_ticket < 0) {
        }
        else if (gross_ticket <= 2500) {
            rate = parseFloatOr0(form.find('input[name="ascap_0_2500"]').val()) / 100;
        }
        else if (gross_ticket <= 5000) {
            rate = parseFloatOr0(form.find('input[name="ascap_2501_5000"]').val()) / 100;
        }
        else if (gross_ticket <= 10000) {
            rate = parseFloatOr0(form.find('input[name="ascap_5001_10000"]').val()) / 100;
        }
        else if (gross_ticket <= 25000) {
            rate = parseFloatOr0(form.find('input[name="ascap_10001_25000"]').val()) / 100;
        }
        else {
            rate = parseFloatOr0(form.find('input[name="ascap_25001_x"]').val()) / 100;
        }
        var ascap_sellout_potential = Number(rate * net_potential).toFixed(2);
        var ascap_max = parseFloatOr0(form.find('input[name="ascap_max"]').val());
        if (ascap_max > 0 && ascap_sellout_potential > ascap_max) {
            ascap_sellout_potential = ascap_max;
        }
        var ascap_flat_rate = parseFloatOr0(form.find('input[name="ascap_flat_rate"]').val());
        if (ascap_flat_rate > 0) {
            ascap_sellout_potential = ascap_flat_rate;
        }
        form.find('input.sys_gen.sellout_potential[data-category="ascap"]').val(ascap_sellout_potential);

        rate = 0;
        if (gross_ticket < 0) {
        }
        else if (gross_ticket <= 2500) {
            rate = parseFloatOr0(form.find('input[name="bmi_0_2500"]').val()) / 100;
        }
        else if (gross_ticket <= 3500) {
            rate = parseFloatOr0(form.find('input[name="bmi_2501_3500"]').val()) / 100;
        }
        else if (gross_ticket <= 5000) {
            rate = parseFloatOr0(form.find('input[name="bmi_3501_5000"]').val()) / 100;
        }
        else if (gross_ticket <= 10000) {
            rate = parseFloatOr0(form.find('input[name="bmi_5001_10000"]').val()) / 100;
        }
        else {
            rate = parseFloatOr0(form.find('input[name="bmi_10001_x"]').val()) / 100;
        }
        var bmi_sellout_potential = Number(rate * net_potential).toFixed(2);
        var bmi_max = parseFloatOr0(form.find('input[name="bmi_max"]').val());
        if (bmi_max > 0 && bmi_sellout_potential > bmi_max) {
            bmi_sellout_potential = bmi_max;
        }
        var bmi_flat_rate = parseFloatOr0(form.find('input[name="bmi_flat_rate"]').val());
        if (bmi_flat_rate > 0) {
            bmi_sellout_potential = bmi_flat_rate;
        }
        form.find('input.sys_gen.sellout_potential[data-category="bmi"]').val(bmi_sellout_potential);


    },
    recalculate_aw_values: function () {
        //now update sellout potential
        var gross_potential = parseFloatOr0($('#gross_potential').val());
        var gross_ticket = parseFloatOr0($('#gross_ticket').val());

        //calculate total
        var sellout_total = 0;
        if (_.isObject(this.$el)) {
            this.$el.find('input.sellout_potential').each(function (i, v) {
                // if ($(v).data('category') !== 'cc_fee') {
                sellout_total += parseFloatOr0(v.value);
                // }
            });
        }
        sellout_total = sellout_total.toFixed(2);

        var $cc_fee_sellout = $('input.sellout_potential[data-category="cc_fee"]');
        var artist_split_percent = parseFloatOr0($('#aw_artist_split_percent').val());
        var $cc_box_office_sales_percent = $('input[name="cc_box_office_sales_percent"]');
        if ($cc_box_office_sales_percent.val() > 0) {
            $cc_fee_sellout.val(parseFloatOr0($cc_fee_sellout.val()) * $cc_box_office_sales_percent.val() / 100);
        }
        $('#total_variable_expense').val(sellout_total);
        var total_expense = parseFloatOr0($('#total_fixed_expenses').val()) + parseFloatOr0(sellout_total);
        var aw_est_total = total_expense + parseFloatOr0($('#aw_artist_fee').val());
        var net_potential = parseFloatOr0($('#aw_net_potential').val());
        var split_point = Number(net_potential - total_expense).toFixed(2);
        var aw_artist_split = parseFloat(Number(split_point * artist_split_percent / 100).toFixed(2));
        var avg_tick_price = $('#average_ticket_price').val();
        var breakeven_tix = null;
        if (typeof avg_tick_price === 'string') {
            avg_tick_price = parseFloatOr0(avg_tick_price.replace('$', ''));
            breakeven_tix = (avg_tick_price !== 0) ? Number(aw_est_total / avg_tick_price).toFixed(0) : null;
        } else avg_tick_price = null;

        $('#aw_est_expense').val(total_expense);
        $('#aw_est_total').val(aw_est_total);
        $('#aw_breakeven_tix').val(breakeven_tix);
        $('#aw_est_split_point').val(split_point);
        $('#aw_artist_split').val(aw_artist_split);
        $('#aw_promoter_split').val(Number(split_point * (100 - artist_split_percent) / 100).toFixed(2));
        $('#aw_artist_walkout').val(Number(aw_artist_split + parseFloatOr0($('#aw_artist_production').val())).toFixed(2));
        b3_autonumeric();
    }

});
