/*
 A list of Settlements. With search box and list of items on the left
 */
app.views.SettlementListView = Backbone.View.extend({
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
        this.collection = app.collections.settlements;
        this.collection.fetch();
        this.settlement_search_list_view = new app.views.SettlementSearchListView({collection: this.collection});
        this.settlement_form_view = new app.views.SettlementView();
        this.listenTo(this.collection, 'update', this.render);
    },
    events: {
        "click a.select_item": "select_item",
        "keyup #settlement_search": "filter_item",
        "click button.toggle_create_mode": "toggle_create_item",
        "click button.reset": "reset_form",
        "click button.save": "save_form",
        "click button.delete": "delete_model",
        "change .edit_switch": "toggle_edit_mode"
    },
    toggle_edit_mode: function (e) {
        var $e = $(e.currentTarget);
        var span_text = $e.parentsUntil('div.row').find('span.toggle_state');
        var is_checked = $e.prop('checked');
        var $form = $($e.parentsUntil('.form_wrapper').parent().find('.edit_form_wrapper form.edit'));
        if (is_checked) {
            $('.action_buttons .create').hide();
            span_text.text('on');
            $($form.find(':input')).removeAttr('disabled');
            this.$el.find('button.delete').show();
        }
        else {
            $('.action_buttons .create').show();
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

        this.$el.find('#settlement_form_wrapper').toggle();
        this.$el.find('#create_settlement').toggle();
        this.reset_form();
    },
    save_form: function (e) {
        e.preventDefault();
        var $form = $(this.$el.find('#create_settlement > form'));
        var form_data = flat_array_to_assoc($form.serializeArray());
        var new_settlement = new app.models.Settlement();
        // new_settlement.setOrganizer(app.cur_settlement.get('settlement'));
        var self = this;
        new_settlement.save(form_data, {
            success: function (new_model) {
                self.toggle_create_item();
                self.collection.add(new_model);
                $.notify('Settlement successfully saved.', {type: 'success'});
            }, error: function (response) {
                app_alert('There is an error saving this settlement. Please contact support for more information');
            }
        });
    },
    reset_form: function () {
        this.$el.find('#create_settlement > form').trigger('reset');
        $('.multi_select').select2('val', null);
    },
    delete_model: function (e) {
        var self = this;
        app_confirm("Are you sure to delete this settlement?", function (response) {
            if (response == true || response == 1) {
                var cur_model = self.collection.at(self.cur_model_index);
                // self.collection.remove(cur_model);
                cur_model.destroy();
                $.notify('Settlement deleted.', {type: 'info'})
            }
        });
    },
    filter_item: function (e) {
        this.settlement_search_list_view.text_to_filter = e.currentTarget.value.toLowerCase();
        this.settlement_search_list_view.render();
        this.settlement_search_list_view.after_render();
    },
    select_item: function (e) {
        var $target = $(e.currentTarget);
        this.cur_model_index = $target.data('index');
        this.settlement_form_view.model = this.collection.at(this.cur_model_index);
        this.settlement_form_view.render();
        this.settlement_form_view.after_render();
    }
    ,
    settlement_form_view: {},
    settlement_search_list_view: {},
    render: function () {
        this.$el.empty();
        //get first settlement in collection
        var first_settlement = this.collection.first();
        this.$el.html(this.template());
        if (_.isObject(first_settlement)) {
            this.cur_model_index = 0;
            this.settlement_form_view.model = first_settlement;
            $(this.$el.find('#settlement_form_wrapper')).html(this.settlement_form_view.render());
            this.settlement_form_view.after_render();
        }
        this.$el.find('#settlement_search_list').html(this.settlement_search_list_view.render());
        this.settlement_search_list_view.after_render();
        var edit_switch = this.$el.find('.edit_switch');
        this.switchery = new Switchery(edit_switch[0]);
        edit_switch.trigger('change');
        this.after_render();
        return this.el;
    },
    after_render: function () {
        this.$action_btns = $(this.$el.find('.action_buttons'));
        this.$create_btn = this.$action_btns.find('.create');
        this.$save_btn = this.$action_btns.find('.save');
        this.$reset_btn = this.$action_btns.find('.reset');
        this.$cancel_btn = this.$action_btns.find('.cancel');
        this.settlement_form_view.after_render();
        this.delegateEvents();
    }
});

app.views.SettlementSearchListView = Backbone.View.extend({
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
app.views.SettlementView = Backbone.BBFormView.extend({
    tagName: "div",
    id: "settlement_form",
    className: "col-sm-12",
    model: app.models.Settlement,
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
        var edit_switch = $('.edit_switch');
        edit_switch.trigger('change');
        $('input.money').autoNumeric('init', {aSign: '$'});
        return this.$el;
    },
    after_render: function () {
        $(this.$el.find('.multi_select')).select2();
        $(this.$el.find('form[data-toggle="validator"]')).validator();
        $('input.money').autoNumeric('init', {aSign: '$'});
        $('form[data-toggle="validator"]').validator();
        this.delegateEvents();
    }
});
