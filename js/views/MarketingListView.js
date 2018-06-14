/*
 A list of Marketings. With search box and list of items on the left
 */
app.views.MarketingListView = Backbone.View.extend({
    tagName: 'div',
    className: 'container row panel-body',
    MarketingCollection: {},
    collection: {},
    cur_model_index: 0,//current model that is being selected out of collection
    $action_btns: {},
    $create_btn: {},
    $save_btn: {},
    $reset_btn: {},
    $cancel_btn: {},
    edit_switch: {},
    switchery: {},

    initialize: function () {
        this.MarketingCollection = app.collections.Marketing_collection.extend({
            url: config.restUrl + 'marketing?' + $.param({'user_id': app.cur_user.get('id')})
        });
        // this.MarketingCollection = app.collections.Marketing_collection;
        this.collection = new this.MarketingCollection();
        this.collection.fetch();
        this.marketing_search_list_view = new app.views.MarketingSearchListView({collection: this.collection});
        this.marketing_form_view = new app.views.MarketingView();
        this.listenTo(this.collection, 'update', this.render);
        this.listenTo(capp.event_bus, 'marketing_view_rendered', this.toggle_edit_mode)
    },
    events: {
        "click a.select_item": "select_item",
        "keyup #marketing_search": "filter_item",
        "click button.toggle_create_mode": "toggle_create_item",
        "click button.reset": "reset_form",
        "click button.save": "save_form",
        "click button.delete": "delete_model",
        "change .edit_switch": "toggle_edit_mode"
    },
    toggle_edit_mode: function (e) {
        let $e = this.edit_switch;
        if (typeof e === 'object' && e.hasOwnProperty('currentTarget')) {
            $e = $(e.currentTarget);
        }
        let span_text = $e.parentsUntil('div.row').find('span.toggle_state');
        let is_checked = $e.prop('checked');
        let $form = $($e.parentsUntil('.form_wrapper').parent().find('.edit_form_wrapper form.edit'));
        if (is_checked) {
            $('div.edit_form_wrapper').addClass('in_edit_mode');
            span_text.text('On');
            $($form.find(':input')).removeAttr('disabled');
            this.$el.find('button.delete').show();
            this.$el.find('.for_view_mode').hide();
            this.$el.find('.for_edit_mode').show();
            this.$el.find('table.has_edit_elements').addClass('wauto');
        }
        else {
            $('div.edit_form_wrapper').removeClass('in_edit_mode');
            span_text.text('Off');
            $($form.find(':input')).prop('disabled', true);
            this.$el.find('button.delete').hide();
            this.$el.find('.for_view_mode').show();
            this.$el.find('.for_edit_mode').hide();
            this.$el.find('table').removeClass('wauto');
        }
        this.rebind_underscore_val();
        $('input.date').datepicker({format: 'yyyy-mm-dd', autoclose: true});
    },
    rebind_underscore_val: function () {
        let selects = this.$el.find('select');
        _.each(selects, function (e) {
            $(e).val($(e).attr('val'));//populate selects with underscore printed `value` attr
        }, this);
    },
    toggle_create_item: function () {
        $('.action_buttons.edit_switch_wrapper').toggle();
        $('button.create').toggle();
        $('button.save').toggle();
        $('button.reset').toggle();
        $('button.cancel').toggle();
        this.$el.find('#marketing_form_wrapper').toggle();
        this.$el.find('#create_marketing').toggle();
        this.reset_form();
    },
    save_form: function (e) {
        e.preventDefault();
        let $form = $(this.$el.find('#create_marketing > form'));
        let form_data = flat_array_to_assoc($form.serializeArray());
        let new_marketing = new app.models.Marketing();
        // new_marketing.setOrganizer(app.cur_marketing.get('company'));
        let self = this;
        new_marketing.save(form_data, {
            success: function (new_model) {
                self.toggle_create_item();
                self.collection.add(new_model);
            }, error: function (response) {
                app_alert('There is an error saving this marketing plan. Please contact support for more information');
            }
        });
    },
    reset_form: function () {
        this.$el.find('#create_marketing > form').trigger('reset');
        $('.multi_select').select2('val', null);
    },
    delete_model: function (e) {
        let self = this;
        app_confirm("Are you sure to delete this marketing?", function (response) {
            if (response === true || response === 1) {
                let cur_model = self.collection.at(self.cur_model_index);
                self.collection.remove(cur_model);
                cur_model.destroy();
            }
        });
    },
    filter_item: function (e) {
        this.marketing_search_list_view.text_to_filter = e.currentTarget.value.toLowerCase();
        this.marketing_search_list_view.render();
        this.marketing_search_list_view.after_render();
    },
    select_item: function (e) {
        let $target = $(e.currentTarget);
        this.cur_model_index = $target.data('index');
        this.set_model_to_child_view(this.collection.at(this.cur_model_index), this.marketing_form_view);
        this.marketing_form_view.render();
        this.marketing_form_view.after_render();
        this.toggle_edit_mode();
    },
    marketing_form_view: {},
    marketing_search_list_view: {},
    render: function () {
        this.$el.empty();
        //get first marketing in collection
        let first_marketing = this.collection.first();
        this.$el.html(this.template());
        if (_.isObject(first_marketing)) {
            this.cur_model_index = 0;
            this.set_model_to_child_view(first_marketing, this.marketing_form_view);
            $('#marketing_form_wrapper').html(this.marketing_form_view.render());
            this.marketing_form_view.after_render();
        }
        this.$el.find('#marketing_search_list').html(this.marketing_search_list_view.render());
        this.marketing_search_list_view.after_render();
        this.edit_switch = this.$el.find('.edit_switch');
        this.switchery = new Switchery(this.edit_switch[0]);
        this.after_render();
        this.delegateEvents();
        return this.el;
    },
    after_render: function () {
        this.$action_btns = $('.action_buttons');
        this.$create_btn = this.$action_btns.find('.create');
        this.$save_btn = this.$action_btns.find('.save');
        this.$reset_btn = this.$action_btns.find('.reset');
        this.$cancel_btn = this.$action_btns.find('.cancel');
        this.toggle_edit_mode();
        this.delegateEvents();
    },
    set_model_to_child_view: function (model, child_view) {
        child_view.set_model(model);
        // this.listenTo(model, 'change', this.render);
        //listen to all related child models
        // this.listenTo(model.get('mk_radios'), 'add', this.render);
        // this.listenTo(model.get('mk_radios'), 'change', this.render);
    }
});

app.views.MarketingSearchListView = Backbone.View.extend({
    tagName: "table",
    collection: {},
    className: "table table-responsive item_list",
    initialize: function () {
        this.listenTo(this.collection, 'change reset add remove', this.render);
        this.listenTo(this.collection, 'destroy', this.close)
    },
    text_to_filter: '',
    render: function () {
        let self = this;
        let models = this.collection;
        models = models.filter(function (v) {
            if (this.text_to_filter === '') return true;
            let event_id = v.get('offer').event_id;
            if (_.isEmpty(event_id)) return true;
            return (event_id.toLowerCase().indexOf(self.text_to_filter) !== -1);
        });
        this.$el.html(this.template({collection: models}));
        this.delegateEvents();
        return this.el;
    },
    after_render: function () {
        this.delegateEvents();
    }
});