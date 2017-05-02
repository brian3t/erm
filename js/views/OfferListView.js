/*
 A list of Offers. With search box and list of items on the left
 */
app.views.OfferListView = Backbone.BBFormView.extend({
    tagName: 'div',
    className: 'container row panel-body',
    OfferCollection: {},
    collection: {},
    cur_model_index: 0,//current model that is being selected out of collection
    $action_btns: {},
    $create_btn: {},
    $save_btn: {},
    $reset_btn: {},
    $cancel_btn: {},
    switchery: {},

    initialize: function () {
        this.OfferCollection = app.collections.Offer.extend({
            url: config.restUrl + 'offer?' + $.param({'belong_company_id': app.cur_user.get('company').get('id')})
        });
        // this.OfferCollection = app.collections.Offer;
        this.collection = new this.OfferCollection();
        this.collection.fetch();
        this.offer_search_list_view = new app.views.OfferSearchListView({collection: this.collection});
        this.offer_form_view = new app.views.OfferView();
        this.listenTo(this.collection, 'update', this.render);
    },
    events: {
        "click a.select_item": "select_item",
        "keyup #offer_search": "filter_item",
        "click button.toggle_create_mode": "toggle_create_item",
        "click button.reset": "reset_form",
        "click button.save": "save_form",
        "click button.delete": "delete_model",
        "change .edit_switch": "toggle_edit_mode",
        "click button.pdf": "pdf_item",
        "change #create_offer input": "update_field_cr8"
    },
    toggle_edit_mode: function (e) {
        var $e = $(e.currentTarget);
        var span_text = $e.parentsUntil('div.row').find('span.toggle_state');
        var is_checked = $e.prop('checked');
        var $form = $($e.parentsUntil('.form_wrapper').parent().find('.edit_form_wrapper form.edit'));
        if (is_checked) {
            $('div.edit_form_wrapper').addClass('in_edit_mode');
            span_text.text('On');
            $($form.find(':input')).removeAttr('disabled');
            this.$el.find('button.delete').show();
        }
        else {
            $('div.edit_form_wrapper').removeClass('in_edit_mode');
            span_text.text('Off');
            $($form.find(':input')).prop('disabled', true);
            this.$el.find('button.delete').hide();
        }
    },
    toggle_create_item: function () {
        var temp_model = new app.models.Offer();
        $('.action_buttons.edit_switch_wrapper').toggle();
        $('button.create').toggle();
        $('button.save').toggle();
        $('button.reset').toggle();
        $('button.cancel').toggle();
        this.$el.find('#offer_form_wrapper').toggle();
        this.$el.find('#create_offer').toggle();
        this.reset_form();
        //reset gen exp and prod exp inputs
        var gen_exp_html = this.print_table_from_array(temp_model.general_expense_array, false);
        this.$el.find('.general_expense').html(gen_exp_html);
        var prod_exp_html = this.print_table_from_array(temp_model.production_expense_array, false);
        this.$el.find('.production_expense').html(prod_exp_html);
    },
    update_field_cr8: function () {
        var $co = $('#create_offer');//wrapper div
        this.update_json_array('.general_expense');
        this.offer_form_view.update_ve($co.find('input[name=rental_note]'), false);
        this.recalculate_aw_values_cr8();
        this.update_json_array('.var_expense');
        this.update_json_array('.production_expense');
        var V = {};//Array to store variables
        var ve = {};
        var variable_expense = $co.find('#variable_expense_input_cr8').val();
        if (variable_expense === '') {
            variable_expense = '{}';
        }
        var production_expense = $co.find('.production_expense_input').val();
        if (production_expense === '') {
            production_expense = '{}';
        }
        var general_expense = $co.find('.general_expense_input').val();
        if (general_expense === '') {
            general_expense = '{}';
        }
        var is_tbd_date = $co.find('input[name="is_tbd_date"]').val() || 0;
        var is_on_sale_date_tbd = $co.find('input[name="is_on_sale_date_tbd"]').val() || 0;
        var show_date = $co.find('input[name="show_date"]').val() || 'today';
        var post_show_lockout = $co.find('input[name="post_show_lockout"]').val();
        var post_show_lockout_unit = $co.find('input[name="post_show_lockout_unit"]').val();
        var support_artist_1_total = $co.find('input[name="support_artist_1_total"]').val() || 0;
        var support_artist_2_total = $co.find('input[name="support_artist_2_total"]').val() || 0;
        var support_artist_3_total = $co.find('input[name="support_artist_3_total"]').val() || 0;
        var housenut_total = $co.find('input[name="housenut_total"]').val() || 0;
        var is_artist_production_buyout = $co.find('input[name="is_artist_production_buyout"]').val();
        var tax_per_ticket = $co.find('input[name="tax_per_ticket"]').val();
        var tax = $co.find('input[name="tax"]').val() || 0;
        var artist_guarantee = $co.find('input[name="artist_guarantee"]').val() || 0;
        var artist_comp = $co.find('input[name="artist_comp"]').val() || 0;
        var production_comp = $co.find('input[name="production_comp"]').val() || 0;
        var promotional_comp = $co.find('input[name="promotional_comp"]').val() || 0;
        var house_comp = $co.find('input[name="house_comp"]').val() || 0;
        var kill = $co.find('input[name="kill"]').val() || 0;

        var l1_price = parseFloatOr0($co.find('input[name="l1_price"]').val()),
            l2_price = parseFloatOr0($co.find('input[name="l2_price"]').val()),
            l3_price = parseFloatOr0($co.find('input[name="l3_price"]').val()),
            l4_price = parseFloatOr0($co.find('input[name="l4_price"]').val()),
            l5_price = parseFloatOr0($co.find('input[name="l5_price"]').val());
        var l1_kill = parseFloatOr0($co.find('input[name="l1_kill"]').val()),
            l2_kill = parseFloatOr0($co.find('input[name="l2_kill"]').val()),
            l3_kill = parseFloatOr0($co.find('input[name="l3_kill"]').val()),
            l4_kill = parseFloatOr0($co.find('input[name="l4_kill"]').val()),
            l5_kill = parseFloatOr0($co.find('input[name="l5_kill"]').val());
        var l1_gross_ticket = parseFloatOr0($co.find('input[name="l1_gross_ticket"]').val()),
            l2_gross_ticket = parseFloatOr0($co.find('input[name="l2_gross_ticket"]').val()),
            l3_gross_ticket = parseFloatOr0($co.find('input[name="l3_gross_ticket"]').val()),
            l4_gross_ticket = parseFloatOr0($co.find('input[name="l4_gross_ticket"]').val()),
            l5_gross_ticket = parseFloatOr0($co.find('input[name="l5_gross_ticket"]').val());
        V.l1_gross = (l1_gross_ticket - l1_kill) * l1_price;
        V.l2_gross = (l2_gross_ticket - l2_kill) * l2_price;
        V.l3_gross = (l3_gross_ticket - l3_kill) * l3_price;
        V.l4_gross = (l4_gross_ticket - l4_kill) * l4_price;
        V.l5_gross = (l5_gross_ticket - l5_kill) * l5_price;

        V.sum_gross = V.l1_gross + V.l2_gross + V.l3_gross + V.l4_gross + V.l5_gross;
        V.sum_gross_ticket = l1_gross_ticket + l2_gross_ticket + l3_gross_ticket + l4_gross_ticket + l5_gross_ticket;
        V.sum_kill = l1_kill + l2_kill + l3_kill + l4_kill + l5_kill;
        V.total_gross_ticket_price = (V.sum_gross_ticket - V.sum_kill == 0) ? 0 : V.sum_gross / (V.sum_gross_ticket - V.sum_kill);
        V.playable_on = new Date(show_date);
        switch (post_show_lockout_unit) {
            case 'Days':
                V.playable_on = new Date(V.playable_on.setTime(V.playable_on.getTime() + post_show_lockout * 86400000));
                break;
            case 'Months':
                V.playable_on = new Date(V.playable_on.setMonth(V.playable_on.getMonth() + post_show_lockout));
                break;
            default:
                break;
        }
        ve = {};
        try {
            ve = JSON.parse(variable_expense);
        } catch (e) {
            console.error("Cr8 Error parsing var expense: " + variable_expense + " error: " + e);
        }
        this.offer_form_view.update_ve(null, false);
        V.total_ve = $('#total_variable_expense').val();

        V.support_artist_total = parseFloatOr0(support_artist_1_total) + parseFloatOr0(support_artist_2_total) + parseFloatOr0(support_artist_3_total);
        var pe = {};
        try {
            pe = JSON.parse(production_expense);
        } catch (e) {
            console.error("Cr8 Error parsing prod expense: " + production_expense + " error: " + e);
        }
        V.tour_production_expenses = app.utils.misc.calc_sum_from_array(pe);
        var ge = {};
        try {
            ge = JSON.parse(general_expense);
        } catch (e) {
            console.error("Cr8 Error parsing gen expense: " + general_expense + " error: " + e);
        }
        V.tour_production_expenses = app.utils.misc.calc_sum_from_array(pe);
        V.general_expenses_total = app.utils.misc.calc_sum_from_array(ge) + parseFloatOr0(housenut_total);
        V.total_fixed_expenses = V.general_expenses_total + V.tour_production_expenses;

        V.tax_per_ticket_total = parseFloatOr0(tax_per_ticket * (V.sum_gross_ticket - V.sum_kill)).toFixed(2);
        V.tax_total = V.sum_gross - (V.sum_gross / (1 + tax / 100)); //Tax Total=Gross Potential-(Gross Potential/(Tax %+1))
        V.net_potential = V.sum_gross - V.tax_total - V.tax_per_ticket_total;

        V.total_estimated_expenses = V.total_fixed_expenses;

        V.aw_artist_split_percent = 0;
        V.aw_artist_split = 0;
        V.aw_artist_fee = parseFloat(artist_guarantee);
        V.aw_artist_production = 0;
        if (is_artist_production_buyout && is_artist_production_buyout == 1) {
            V.aw_artist_fee += V.tour_production_expenses;
            V.aw_artist_production = V.tour_production_expenses;
        }
        V.aw_promoter_split_percent = 0;
        V.aw_promoter_split = 0;

        V.total_comp_kill = Number(artist_comp + production_comp + promotional_comp + house_comp + kill).toFixed(0);

//format NAN
        $.each(V, function (i, v) {
            if (isNumeric(V[i])) {
                V[i] = Number(V[i]).toFixed(2);
            }
        });
        //bind to html
        $.each(V, function (i, v) {
            // console.info(i);
            // console.info(v);
            var a = 1;
        });
    },
    recalculate_aw_values_cr8: function () {
        //update sellout potential of create form
        var $co = $('#create_offer');//wrapper div

        var gross_potential = parseFloatOr0($co.find('.gross_potential').val());
        var gross_ticket = parseFloatOr0($co.find('.gross_ticket').val());

        //calculate total
        var sellout_total = 0;
        $co.find('input.sellout_potential').each(function (i, v) {
            sellout_total += parseFloatOr0(v.value);
        });
        sellout_total = sellout_total.toFixed(2);

        var $cc_fee_sellout = $co.find('input.sellout_potential[data-category="cc_fee"]');
        var artist_split_percent = parseFloatOr0($co.find('.aw_artist_split_percent').val());
        var $cc_box_office_sales_percent = $co.find('input[name="cc_box_office_sales_percent"]');
        if ($cc_box_office_sales_percent.val() > 0) {
            $cc_fee_sellout.val(parseFloatOr0($cc_fee_sellout.val()) * $cc_box_office_sales_percent.val() / 100);
        }
        $co.find('.total_variable_expense').val(sellout_total);
        var total_expense = parseFloatOr0($co.find('.total_fixed_expenses').val()) + parseFloatOr0(sellout_total);
        var estimated_total = total_expense + parseFloatOr0($co.find('.aw_artist_fee').val());
        var net_potential = parseFloatOr0($co.find('.aw_net_potential').val());
        var split_point = net_potential - total_expense;
        var artist_split = Number(split_point * artist_split_percent / 100).toFixed(2);
        var avg_tick_price = $co.find('.average_ticket_price').val();
        var breakeven_tix = null;
        if (typeof avg_tick_price == 'string') {
            avg_tick_price = parseFloatOr0(avg_tick_price.replace('$', ''));
            breakeven_tix = (avg_tick_price != 0) ? Number(estimated_total / avg_tick_price).toFixed(0) : null;
        } else avg_tick_price = null;

        $co.find('.aw_est_expense').val(total_expense);
        $co.find('.aw_est_total').val(estimated_total);
        $co.find('.aw_breakeven_tix').val(breakeven_tix);
        $co.find('.aw_est_split_point').val(split_point);
        $co.find('.aw_artist_split').val(artist_split);
        $co.find('.aw_promoter_split').val(Number(split_point * (100 - artist_split_percent) / 100).toFixed(2));
        $co.find('.aw_artist_walkout').val(Number(artist_split + parseFloatOr0($('#aw_artist_production').val())).toFixed(2));
        $('input.money').autoNumeric('init', {aSign: '$'});
    },
    save_form: function (e) {
        e.preventDefault();
        this.update_json_array('.general_expense');
        this.offer_form_view.update_ve(null, false);
        this.update_json_array('.var_expense');
        this.update_json_array('.production_expense');
        var $form = $(this.$el.find('#create_offer > form'));
        var form_data = flat_array_to_assoc($form.serializeArray());
        var new_offer = new app.models.Offer();
        // new_offer.setOrganizer(app.cur_offer.get('offer'));
        var self = this;
        new_offer.save(form_data, {
            success: function (new_model) {
                self.toggle_create_item();
                self.collection.add(new_model);
            }, error: function (response) {
                app_alert('There is an error saving this offer. Please contact support for more information');
            }
        });
    },
    reset_form: function () {
        this.$el.find('#create_offer > form').trigger('reset');
        $('.multi_select').select2('val', null);
    },
    delete_model: function (e) {
        var self = this;
        app_confirm("Are you sure to delete this offer?", function (response) {
            if (response == true || response == 1) {
                var cur_model = self.collection.at(self.cur_model_index);
                self.collection.remove(cur_model);
                cur_model.destroy();
            }
        });
    },
    filter_item: function (e) {
        this.offer_search_list_view.text_to_filter = e.currentTarget.value.toLowerCase();
        this.offer_search_list_view.render();
        this.offer_search_list_view.after_render();
    },
    select_item: function (e) {
        var $target = $(e.currentTarget);
        this.cur_model_index = $target.data('index');
        this.offer_form_view.model = this.collection.at(this.cur_model_index);
        this.offer_form_view.render();
        this.offer_form_view.after_render();
    },
    pdf_item: function (e) {
        var curr_id = this.offer_form_view.model.get('id');
        if (isInWeb) {
            window.open('http://admin.entertainmentdirectmetrics.com/offer/pdf?id=' + curr_id, '_blank')
        }
    },
    offer_form_view: {},
    offer_search_list_view: {},
    render: function () {
        this.$el.empty();
        //get first offer in collection
        var first_offer = this.collection.first();
        this.$el.html(this.template());
        if (_.isObject(first_offer)) {
            this.cur_model_index = 0;
            this.offer_form_view.model = first_offer;
            $('#offer_form_wrapper').html(this.offer_form_view.render());
            this.offer_form_view.after_render();
        }
        this.$el.find('#offer_search_list').html(this.offer_search_list_view.render());
        this.offer_search_list_view.after_render();
        var edit_switch = this.$el.find('.edit_switch');
        this.switchery = new Switchery(edit_switch[0]);
        edit_switch.trigger('change');
        this.delegateEvents();
        return this.el;
    },
    after_render: function () {
        this.$action_btns = $('.action_buttons');
        this.$create_btn = this.$action_btns.find('.create');
        this.$save_btn = this.$action_btns.find('.save');
        this.$reset_btn = this.$action_btns.find('.reset');
        this.$cancel_btn = this.$action_btns.find('.cancel');
        this.offer_form_view.after_render();
        this.delegateEvents();
    }
});

app.views.OfferSearchListView = Backbone.View.extend({
    tagName: "table",
    collection: {},
    className: "table table-responsive item_list",
    initialize: function () {
        this.listenTo(this.collection, 'change reset add remove', this.render);
        this.listenTo(this.collection, 'destroy', this.close)
    },
    text_to_filter: '',
    render: function () {
        var self = this;
        var models = this.collection;
        models = models.filter(function (v) {
            if (this.text_to_filter == '') return true;
            var booked_by = v.get('user');
            return true;//todob implement filter here
        });
        this.$el.html(this.template({collection: models}));
        this.delegateEvents();
        return this.el;
    },
    after_render: function () {
        this.delegateEvents();
    }
});
app.views.OfferView = Backbone.BBFormView.extend({
    tagName: "div",
    id: "offer_form",
    className: "col-sm-12",
    model: app.models.Offer,
    events: {
        "blur .edit": "update_ajax",
        "change .multi_select": "update_ajax",
        "change #var_expense :input": "update_ve"
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
        var edit_switch = $('.edit_switch');
        edit_switch.trigger('change');
        $('input.money').autoNumeric('init', {aSign: '$'});
        return this.$el;
    },
    after_render: function () {
        $(this.$el.find('.multi_select')).select2();
        // this.$el.find('#var_expense input[name$="flat_rate"]').trigger('change');
        $('input.money').autoNumeric('init', {aSign: '$'});
        this.delegateEvents();

    },
    /**
     * Update variable expense values.
     * @param e Event or jQuery. This is variable expense input, such as rental_flat_rate
     * @param save_rest boolean Whether or not to initiate a RESTful patch
     */
    update_ve: function (e, save_rest) {
        if (typeof save_rest === "undefined") {
            save_rest = true;
        }
        var ve_form = $('#var_expense');
        var gross_potential = 0;
        var gross_ticket = 0;

        if (e instanceof jQuery) {//create mode real-time update
            ve_form = $('#var_expense_cr8');
            gross_potential = parseFloatOr0(e.find('.gross_potential').val()); here gross potential
            gross_ticket = parseFloatOr0(e.find('.gross_ticket').val());
        }else {
            if (e === null){
                e = $('#var_expense_cr8');//upon saving create form
            }
            e = $(e.target);
            gross_potential = parseFloatOr0($('#gross_potential').val());
            gross_ticket = parseFloatOr0($('#gross_ticket').val());
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
            sellout_potential = gross_potential * per_tix_percent / 100;
        }
        if (per_tix_dollar > 0) {
            sellout_potential = gross_ticket * per_tix_dollar;
        }
        if (flat_rate > 0) {
            sellout_potential = flat_rate;
        }
        if (max != 0 && sellout_potential > max) {
            sellout_potential = max;
        }
        $sellout_potential.val(sellout_potential);
        if (save_rest === true) {
            this.model.save('variable_expense', JSON.stringify(ve_values), {patch: true, success: self.recalculate_aw_values});
        } else {
            $('#variable_expense_input_cr8').val(JSON.stringify(ve_values));//this is quickfix for Create Mode
        }
    },
    recalculate_aw_values: function () {
        //now update sellout potential
        var gross_potential = parseFloatOr0($('#gross_potential').val());
        var gross_ticket = parseFloatOr0($('#gross_ticket').val());

        //calculate total
        var sellout_total = 0;
        $('input.sellout_potential').each(function (i, v) {
            sellout_total += parseFloatOr0(v.value);
        });
        sellout_total = sellout_total.toFixed(2);

        var $cc_fee_sellout = $('input.sellout_potential[data-category="cc_fee"]');
        var artist_split_percent = parseFloatOr0($('#aw_artist_split_percent').val());
        var $cc_box_office_sales_percent = $('input[name="cc_box_office_sales_percent"]');
        if ($cc_box_office_sales_percent.val() > 0) {
            $cc_fee_sellout.val(parseFloatOr0($cc_fee_sellout.val()) * $cc_box_office_sales_percent.val() / 100);
        }
        $('#total_variable_expense').val(sellout_total);
        var total_expense = parseFloatOr0($('#total_fixed_expenses').val()) + parseFloatOr0(sellout_total);
        var estimated_total = total_expense + parseFloatOr0($('#aw_artist_fee').val());
        var net_potential = parseFloatOr0($('#aw_net_potential').val());
        var split_point = net_potential - total_expense;
        var artist_split = Number(split_point * artist_split_percent / 100).toFixed(2);
        var avg_tick_price = $('#average_ticket_price').val();
        var breakeven_tix = null;
        if (typeof avg_tick_price == 'string') {
            avg_tick_price = parseFloatOr0(avg_tick_price.replace('$', ''));
            breakeven_tix = (avg_tick_price != 0) ? Number(estimated_total / avg_tick_price).toFixed(0) : null;
        } else avg_tick_price = null;

        $('#aw_est_expense').val(total_expense);
        $('#aw_est_total').val(estimated_total);
        $('#aw_breakeven_tix').val(breakeven_tix);
        $('#aw_est_split_point').val(split_point);
        $('#aw_artist_split').val(artist_split);
        $('#aw_promoter_split').val(Number(split_point * (100 - artist_split_percent) / 100).toFixed(2));
        $('#aw_artist_walkout').val(Number(artist_split + parseFloatOr0($('#aw_artist_production').val())).toFixed(2));
        $('input.money').autoNumeric('init', {aSign: '$'});
    }

});

/**
 * Recalculate offer values
 * Being used both in edit mode and create mode
 * Needs variables available: V, l1_price, etc...
 * In edit mode, these variables are initiated using _ template
 * In create mode, these variables are re-initiated everytime a field is blurred: function update_field_cr8
 */

