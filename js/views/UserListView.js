/*
 A list of users. With search box and list of items on the left
 */
app.views.UserListView = Backbone.View.extend({
    tagName: 'div',
    className: 'container row panel-body',
    UserCollection: {},
    collection: {},
    cur_model_index: 0,//current model that is being selected out of collection
    $action_btns: {},
    $create_btn: {},
    $save_btn: {},
    $reset_btn: {},
    $cancel_btn: {},
    switchery: {},

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
    initialize: function (options) {
        this.UserCollection = app.collections.User_collection.extend({
            url : config.restUrl + 'user?' + $.param({'company_id': app.cur_user.get('company').get('id')})
        });
        this.collection = new this.UserCollection();
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
        "click button.save": "save_form",
        "click button.delete": "delete_model",
        "change .edit_switch": "toggle_edit_mode"
    },
    toggle_create_item: function () {
        $('.action_buttons.edit_switch_wrapper').toggle();
        $('button.create').toggle();
        $('button.save').toggle();
        $('button.reset').toggle();
        $('button.cancel').toggle();
        this.$el.find('#user_form_wrapper').toggle();
        this.$el.find('#create_user').toggle();
        this.reset_form();
    },
    save_form: function (e) {
        e.preventDefault();
        var $form = $(this.$el.find('#create_user > form'));
        var form_data = flat_array_to_assoc($form.serializeArray());
        var new_user = new app.models.User();
        new_user.setCompany(app.cur_user.get('company'));
        new_user.set('username', 'contact_' + form_data['first_name'].replace(' ', '') + (new Date).toISOString() + Math.random().toString().substr(1, 3));
        form_data['email'] = 'contact_' + form_data['first_name'].replace(' ', '') + '@' + (new Date).getTime() + '.' + Math.random().toString().substr(1, 3);
        var self = this;
        new_user.save(form_data, {
            success: function (new_model) {
                self.toggle_create_item();
                self.collection.add(new_model);
            }, error: function (response) {
                app_alert('There is an error saving this contact. Please contact support for more information');
            }
        });
    },
    reset_form: function () {
        this.$el.find('#create_user > form').trigger('reset');
        $('.multi_select').select2('val', null);
    },
    delete_model: function (e) {
        var self = this;
        app_confirm("Are you sure to delete this contact?", function (response) {
            if (response == true || response == 1) {
                var cur_model = self.collection.at(self.cur_model_index);
                self.collection.remove(cur_model);
                cur_model.destroy();
            }
        });
    },
    filter_item: function (e) {
        this.user_search_list_view.text_to_filter = e.currentTarget.value.toLowerCase();
        this.user_search_list_view.render();
        this.user_search_list_view.after_render();
    },
    select_item: function (e) {
        var $target = $(e.currentTarget);
        this.cur_model_index = $target.data('index');
        this.user_form_view.model = this.collection.at(this.cur_model_index);
        this.user_form_view.render();
        this.user_form_view.after_render();
    }
    ,
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
        this.$el.find('#user_search_list').html(this.user_search_list_view.render());
        this.user_search_list_view.after_render();
        var edit_switch = this.$el.find('.edit_switch');
        this.switchery = new Switchery(edit_switch[0]);
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
            var full_name = v.getFullName();
            return (full_name.toLowerCase().indexOf(self.text_to_filter) != -1);
        });
        this.$el.html(this.template({collection: models}));
        this.delegateEvents();
        return this.el;
    },
    after_render: function () {
        this.delegateEvents();
    }
});
app.views.UserView = Backbone.View.extend({
    tagName: "div",
    id: "user_form",
    className: "col-sm-12",
    model: app.models.User,
    events: {
        "blur .edit": "update_ajax",
        "change .multi_select": "update_ajax"
    },
    update_ajax: function (e) {
        if (is_validator_initializing){
            return;
        }
        var target = $(e.target);
        if (e.target.tagName == 'BUTTON' || target.hasClass('file-caption') || target.prop('type') == 'file' || target.prop('readonly') == true) {
            return;
        }
        var is_multi_select = target.hasClass('multi_select') || target.hasClass('select2-search__field') || target.hasClass('select2-selection--multiple');
        var form = target.parents('form');
        var model = form.data('model');//user
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
        var union = this.$el.find(':input[name="union_memberships"]').select2();
        union.val(this.model.get('union_memberships')).trigger('change');
        return this.$el;
    },
    after_render: function () {
        var $edit_switch = $('.edit_switch');
        // $edit_switch.bootstrapToggle();
        $('.multi_select').select2();
        this.delegateEvents();
    }

});