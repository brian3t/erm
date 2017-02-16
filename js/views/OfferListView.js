/*
 A list of Offers. With search box and list of items on the left
 */
app.views.OfferListView = Backbone.View.extend({
    tagName: 'div',
    className: 'container row panel-body',
    collection: {},
    cur_model_index: 0,//current model that is being selected out of collection
    $action_btns: {},
    $create_btn: {},
    $save_btn: {},
    $reset_btn: {},
    $cancel_btn: {},
    switchery: {},

    initialize: function () {
        this.collection = app.collections.offers;
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
        "click button.pdf": "pdf_item"
    },
    toggle_edit_mode: function (e) {
        var $e = $(e.currentTarget);
        var span_text = $e.parentsUntil('div.row').find('span.toggle_state');
        var is_checked = $e.prop('checked');
        var $form = $($e.parentsUntil('.form_wrapper').parent().find('.edit_form_wrapper form.edit'));
        if (is_checked) {
            span_text.text('on');
            $($form.find(':input')).removeAttr('disabled');
            this.$el.find('button.delete').show();
        }
        else {
            span_text.text('off');
            $($form.find(':input')).prop('disabled', true);
            this.$el.find('button.delete').hide();
        }
    },
    toggle_create_item: function () {
        this.$create_btn.toggle();
        this.$save_btn.toggle();
        this.$reset_btn.toggle();
        this.$cancel_btn.toggle();
        this.$el.find('#offer_form_wrapper').toggle();
        this.$el.find('#create_offer').toggle();
        this.reset_form();
    },
    save_form: function (e) {
        e.preventDefault();
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
        if (isInWeb){
            window.open('http://admin.entertainmentdirectmetrics.com/offer/pdf', '_blank')
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
            $(this.$el.find('#offer_form_wrapper')).html(this.offer_form_view.render());
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
        this.$action_btns = $(this.$el.find('.action_buttons'));
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
        var gen_exp_html = this.print_table_from_array(JSON.parse(this.model.get('general_expense')));
        this.$el.find('#general_expense').html(gen_exp_html);
        var prod_exp_html = this.print_table_from_array(JSON.parse(this.model.get('production_expense')));
        this.$el.find('#production_expense').html(prod_exp_html);
        var edit_switch = $('.edit_switch');
        edit_switch.trigger('change');
        $('input.money').autoNumeric('init', {aSign: '$'});
        return this.$el;
    },
    after_render: function () {
        $(this.$el.find('.multi_select')).select2();
        $(this.$el.find('form[data-toggle="validator"]')).validator();
        // this.$el.find('#var_expense input[name$="flat_rate"]').trigger('change');
        $('input.money').autoNumeric('init', {aSign: '$'});
        this.delegateEvents();

    },
    update_ve: function (e) {
        e = $(e.target);
        var gross_potential = parseFloatOr0($('#gross_potential').val());
        var gross_ticket = parseFloatOr0($('#gross_ticket').val());
        var ve_form = $('#var_expense');
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
        this.model.save('variable_expense', JSON.stringify(ve_values), {patch: true, success: self.recalculate_aw_values});
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
