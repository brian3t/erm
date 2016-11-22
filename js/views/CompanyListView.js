/*
 A list of Companies. With search box and list of items on the left
 */
app.views.CompanyListView = Backbone.View.extend({
    tagName: 'div',
    className: 'container row panel-body',
    collection: {},
    cur_model_index: 0,//current model that is being selected out of collection
    $action_btns: {},
    $create_btn: {},
    $save_btn: {},
    $reset_btn: {},
    $cancel_btn: {},

    initialize: function () {
        this.collection = app.collections.companies;
        this.collection.fetch();
        this.company_search_list_view = new app.views.CompanySearchListView({collection: this.collection});
        this.company_form_view = new app.views.CompanyView();
        this.listenTo(this.collection, 'update', this.render);
    },
    events: {
        "click a.select_item": "select_item",
        "keyup #company_search": "filter_item",
        "click button.toggle_create_mode": "toggle_create_item",
        "click button.reset": "reset_form",
        "click button.save": "save_form",
        "click button.delete": "delete_model"
    },
    toggle_create_item: function () {
        this.$create_btn.toggle();
        this.$save_btn.toggle();
        this.$reset_btn.toggle();
        this.$cancel_btn.toggle();
        this.$el.find('#company_form_wrapper').toggle();
        this.$el.find('#create_company').toggle();
        this.reset_form();
    },
    save_form: function (e) {
        e.preventDefault();
        var $form = $(this.$el.find('#create_company > form'));
        var form_data = flat_array_to_assoc($form.serializeArray());
        var new_company = new app.models.Company();
        // new_company.setOrganizer(app.cur_company.get('company'));
        var self = this;
        new_company.save(form_data, {
            success: function (new_model) {
                self.toggle_create_item();
                self.collection.add(new_model);
            }, error: function (response) {
                app_alert('There is an error saving this company. Please contact support for more information');
            }
        });
    },
    reset_form: function () {
        this.$el.find('#create_company > form').trigger('reset');
        $('.multi_select').select2('val', null);
    },
    delete_model: function (e) {
        var self = this;
        app_confirm("Are you sure to delete this company?", function (response) {
            if (response == true || response == 1) {
                var cur_model = self.collection.at(self.cur_model_index);
                self.collection.remove(cur_model);
                cur_model.destroy();
            }
        });
    },
    filter_item: function (e) {
        this.company_search_list_view.text_to_filter = e.currentTarget.value.toLowerCase();
        this.company_search_list_view.render();
        this.company_search_list_view.after_render();
    },
    select_item: function (e) {
        var $target = $(e.currentTarget);
        this.cur_model_index = $target.data('index');
        this.company_form_view.model = this.collection.at(this.cur_model_index);
        this.company_form_view.render();
        this.company_form_view.after_render();
    }
    ,
    company_form_view: {},
    company_search_list_view: {},
    render: function () {
        this.$el.empty();
        //get first company in collection
        var first_company = this.collection.first();
        this.$el.html(this.template());
        if (_.isObject(first_company)) {
            this.cur_model_index = 0;
            this.company_form_view.model = first_company;
            $(this.$el.find('#company_form_wrapper')).html(this.company_form_view.render());
            this.company_form_view.after_render();
        }
        this.$el.find('#company_search_list').html(this.company_search_list_view.render());
        this.company_search_list_view.after_render();
        this.delegateEvents();
        return this.el;
    },
    after_render: function () {
        this.$action_btns = $(this.$el.find('.action_buttons'));
        this.$create_btn = this.$action_btns.find('.create');
        this.$save_btn = this.$action_btns.find('.save');
        this.$reset_btn = this.$action_btns.find('.reset');
        this.$cancel_btn = this.$action_btns.find('.cancel');
        this.delegateEvents();
    }
});

app.views.CompanySearchListView = Backbone.View.extend({
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
            var name = v.get('name');
            return (name.toLowerCase().indexOf(self.text_to_filter) != -1);
        });
        this.$el.html(this.template({collection: models}));
        this.delegateEvents();
        return this.el;
    },
    after_render: function () {
        this.delegateEvents();
    }
});
app.views.CompanyView = Backbone.View.extend({
    tagName: "div",
    id: "company_form",
    className: "col-sm-12",
    model: app.models.Company,
    events: {
        "blur .edit": "update_ajax",
        "change .multi_select": "update_ajax",
        "change .edit_switch": "toggle_edit_mode"
    },
    update_ajax: function (e) {
        var target = $(e.target);
        if (e.target.tagName == 'BUTTON' || target.hasClass('file-caption') || target.prop('type') == 'file' || target.prop('readonly') == true) {
            return;
        }
        var is_multi_select = target.hasClass('multi_select') || target.hasClass('select2-search__field') || target.hasClass('select2-selection--multiple');
        var form = target.parents('form');
        var model = form.data('model');//company
        var new_attr = {};
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
                    target.prevAll('span.glyphicon-ok-circle').fadeOut(1400);
                }, 2000);
            }, error: function () {
                target.prevAll('span.glyphicon-upload').remove();
            }
        });
    },
    toggle_edit_mode: function (e) {
        var $e = $(e.currentTarget);
        var span_text = $e.parentsUntil('div.row').find('span.toggle_state');
        var is_checked = $e.prop('checked');
        var $form = $($e.parentsUntil('.form_wrapper').find('form'));
        $form.find('button.delete').toggle();
        if (is_checked) {
            span_text.text('on');
            $($form.find(':input')).removeAttr('disabled');
        }
        else {
            span_text.text('off');
            $($form.find(':input')).prop('disabled', true);
        }
    },
    initialize: function () {
        this.delegateEvents();
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        var selects = this.$el.find('select');
        _.each(selects, function (e) {
            $(e).val(this.model.get($(e).prop('name')));
        }, this);
        return this.el;
    },
    after_render: function () {
        var $edit_switch = this.$el.find('.edit_switch');
        $($edit_switch).bootstrapToggle();
        $(this.$el.find('.multi_select')).select2();
        $(this.$el.find('form[data-toggle="validator"]')).validator();
        this.delegateEvents();
    }

});
