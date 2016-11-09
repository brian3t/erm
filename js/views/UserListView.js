/*
 A list of users. With search box and list of items on the left
 */
app.views.UserListView = Backbone.View.extend({
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
        var self = this;
        this.collection = new app.models.User_collection();
        this.collection.fetch();
        this.user_search_list_view = new app.views.UserSearchListView({collection: this.collection});
        this.user_form_view = new app.views.UserView();
        this.listenTo(this.collection, 'update', this.render);
    },
    events: {
        "click a.select_item": "select_item",
        "keyup #user_search": "filter_item",
        "click button.toggle_create_mode": "toggle_create_item",
        "click button.reset": "reset_form",
        "click button.save": "save_form"
    },
    toggle_create_item: function () {
        this.$create_btn.toggle();
        this.$save_btn.toggle();
        this.$reset_btn.toggle();
        this.$cancel_btn.toggle();
        this.$el.find('#user_form_wrapper').toggle();
        this.$el.find('#create_user').toggle();
        $('form[data-toggle="validator"]').validator();
    },
    save_form: function () {
        var form_data = flat_array_to_assoc(this.$el.find('#create_user > form').serializeArray());
        var new_user = new app.models.User();
        var company = app.cur_user.get('company');
        form_data['company_id'] = company.get('id');
        new_user.save(form_data, {success: function (new_model) {
            new_user.set('company', company);
            console.info(new_model);
        }, error: function (response) {
            console.info(response);
        }});
    },
    reset_form: function () {
        this.$el.find('#create_user > form').trigger('reset');
        $('.multi_select').select2('val', null);
    },
    filter_item: function (e) {
        this.user_search_list_view.text_to_filter = e.currentTarget.value.toLowerCase();
        this.user_search_list_view.render();
        this.user_search_list_view.after_render();
    },
    select_item: function (e) {
        var $target = $(e.currentTarget);
        this.user_form_view.model = this.collection.at($target.data('index'));
        this.user_form_view.render();
        this.user_form_view.after_render();
    },
    user_form_view: {},
    user_search_list_view: {},
    render: function () {
        this.$el.empty();
        //get first user in collection
        var first_user = this.collection.first();
        this.$el.html(this.template());
        if (_.isObject(first_user)) {
            this.cur_model_index = 0;
            this.user_form_view.model = first_user;
            $('#user_form_wrapper').html(this.user_form_view.render());
            this.user_form_view.after_render();
        }
        //todob dont use global id in selector
        $('#user_search_list').html(this.user_search_list_view.render());
        this.user_search_list_view.after_render();
        this.delegateEvents();
        this.$action_btns = $('.action_buttons');
        this.$create_btn = this.$action_btns.find('.create');
        this.$save_btn = this.$action_btns.find('.save');
        this.$reset_btn = this.$action_btns.find('.reset');
        this.$cancel_btn = this.$action_btns.find('.cancel');
        return this.el;
    },
    after_render: function () {
        this.delegateEvents();
    }
});

app.views.UserSearchListView = Backbone.View.extend({
    tagName: "table",
    collection: {},
    className: "table-responsive item_list",
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
            var full_name = v.getFullName();
            return (full_name.toLowerCase().indexOf(self.text_to_filter) != -1);
        });
        this.$el.html(this.template({collection: models}));
        return this.el;
    },
    after_render: function () {
        this.delegateEvents();
    },
    close: function () {

    }
});
app.views.UserView = Backbone.View.extend({
    tagName: "div",
    id: "user_form",
    className: "col-sm-12",
    model: app.models.User,
    // className: "col-md-10 edit account_info",
    events: {
        "blur .edit": "update_ajax",
        "change .multi_select": "update_ajax",
        "change .edit_switch": "toggle_edit_mode"
    },
    fired: function (e) {
        console.log("Event fired");
        console.info(e);
    },
    update_ajax: function (e) {
        var target = $(e.target);
        if (target.hasClass('file-caption') || target.prop('type') == 'file' || target.prop('readonly') == true) {
            return;
        }
        var form = target.parents('form');
        var model = form.data('model');//user
        new_attr = {};
        new_attr[target.prop('name')] = target.val();
        target.before('<span class="glyphicon glyphicon-upload"></span>');
        this.model.save(new_attr, {
            patch: true, success: function () {
                target.prev('span.glyphicon-upload').remove();
                //dont bother if it's multiselect
                if (target.hasClass('multi_select') || target.hasClass('select2-search__field') || target.hasClass('select2-selection--multiple')) {
                    return;
                }
                target.before('<span class="glyphicon glyphicon-ok-circle"></span>');
                setTimeout(function () {
                    target.prev('span').fadeOut(1400);
                }, 2000);
            }, error: function () {
                target.prev('span.glyphicon-upload').remove();
            }
        });
    },
    update_ajax_multi: function (e) {

    },
    toggle_edit_mode: function (e) {
        var $e = $(e.currentTarget);
        var span_text = $e.parentsUntil('div.row').find('span.toggle_state');
        var is_checked = $e.prop('checked');
        var $form = $($e.parentsUntil('.form_wrapper').find('form'));
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
    // bind_event: function () {
    //     this.model.on("add change", this.render, this);
    //     this.model.on("destroy", this.close, this);
    // },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        return this.$el;
    },
    after_render: function () {
        var $edit_switch = $('.edit_switch');
        $edit_switch.bootstrapToggle();
        $('.multi_select').select2();
        this.delegateEvents();
    }

});
