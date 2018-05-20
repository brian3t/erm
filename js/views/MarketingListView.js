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
        let $e = $(e.currentTarget);
        let span_text = $e.parentsUntil('div.row').find('span.toggle_state');
        let is_checked = $e.prop('checked');
        let $form = $($e.parentsUntil('.form_wrapper').parent().find('.edit_form_wrapper form.edit'));
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
        this.marketing_form_view.model = this.collection.at(this.cur_model_index);
        this.marketing_form_view.render();
        this.marketing_form_view.after_render();
    }
    ,
    marketing_form_view: {},
    marketing_search_list_view: {},
    render: function () {
        this.$el.empty();
        //get first marketing in collection
        let first_marketing = this.collection.first();
        this.$el.html(this.template());
        if (_.isObject(first_marketing)) {
            this.cur_model_index = 0;
            this.marketing_form_view.model = first_marketing;
            $('#marketing_form_wrapper').html(this.marketing_form_view.render());
            this.marketing_form_view.after_render();
        }
        this.$el.find('#marketing_search_list').html(this.marketing_search_list_view.render());
        this.marketing_search_list_view.after_render();
        let edit_switch = this.$el.find('.edit_switch');
        this.switchery = new Switchery(edit_switch[0]);
        this.delegateEvents();
        return this.el;
    },
    after_render: function () {
        this.$action_btns = $('.action_buttons');
        this.$create_btn = this.$action_btns.find('.create');
        this.$save_btn = this.$action_btns.find('.save');
        this.$reset_btn = this.$action_btns.find('.reset');
        this.$cancel_btn = this.$action_btns.find('.cancel');
        this.delegateEvents();
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
app.views.MarketingView = Backbone.View.extend({
    tagName: "div",
    id: "marketing_form",
    className: "col-sm-12",
    model: app.models.Marketing ,
    events: {
        "blur .edit": "update_ajax",
        "change .multi_select": "update_ajax"
    },
    update_ajax: function (e) {
        if (is_validator_initializing){
            return;
        }

        let target = $(e.target);
        if (e.target.tagName === 'BUTTON' || target.hasClass('file-caption') || target.prop('type') === 'file' || target.prop('readonly') === true) {
            return;
        }
        let is_multi_select = target.hasClass('multi_select') || target.hasClass('select2-search__field') || target.hasClass('select2-selection--multiple');
        let form = target.parents('form');
        let model = form.data('model');//marketing plan
        let new_attr = {};
        new_attr[target.prop('name')] = target.val();
        if (!is_multi_select) {
            target.before('<span class="glyphicon glyphicon-upload"></span>');
        }
        this.model.save(new_attr, {
            patch: true, success: function () {
                target.prevAll('span.glyphicon-upload').remove();
                if (is_multi_select) {
                    return;
                }
                target.before('<span class="glyphicon glyphicon-ok-circle"></span>');
                setTimeout(function () {
                    target.prevAll('span.glyphicon-ok-circle').fadeOut(1400).remove();
                }, 2000);
            }, error: function () {
                target.prevAll('span.glyphicon-upload').remove();
            }
        });
    },
    initialize: function () {
        this.delegateEvents();
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        let selects = this.$el.find('select');
        _.each(selects, function (e) {
            $(e).val(this.model.get($(e).prop('name')));//todob dont remember what this does
        }, this);
        return this.$el;
    },
    after_render: function () {
        let $edit_switch = $('.edit_switch');
        // $edit_switch.bootstrapToggle();
        $('.multi_select').select2();
        this.delegateEvents();
    }

});
