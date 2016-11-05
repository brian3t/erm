/*
 A list of users. With search box and list of items on the left
 */
app.views.UserListView = Backbone.View.extend({
    tagName: 'div',
    className: 'user_list_view',
    collection: {},
    cur_model_index: 0,//current model that is being selected out of collection
    initialize: function () {
        var self = this;
        this.collection = new app.models.User_collection();
        this.collection.fetch();
        this.user_search_list_view = new app.views.UserSearchListView({collection: this.collection});
        this.user_form_view = new app.views.UserView();
        this.listenTo(this.collection, 'update', this.render);
        this.delegateEvents();
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
            this.user_form_view.delegateEvents();
        }
        //todob dont use global id in selector
        $('#user_search_list').html(this.user_search_list_view.render());
        this.user_search_list_view.delegateEvents();
        return this.$el.html();

    }
});

app.views.UserSearchListView = Backbone.View.extend({
    tagName: "div",
    collection: {},
    className: "table-responsive",

    initialize: function () {
        this.listenTo(this.collection, 'change reset add remove', this.render);
        this.listenTo(this.collection, 'destroy', this.close)
    },

    render: function () {
        this.$el.html(this.template({collection: this.collection.models}));
        return this.$el.html();
    },
    close: function () {

    }
});
app.views.UserView = Backbone.View.extend({
    tagName: "div",
    id: "user_form",
    model: app.models.User,
    // className: "col-md-10 edit account_info",
    events: {
        "blur .edit": "update_ajax",
        "change .multi_select": "update_ajax",
        "blur input[name='first_name']": "fired",
        "change .edit_switch": "toggle_edit_mode"
    },
    fired: function (e) {
        console.log("Event fired");
        console.info(e);
    },
    update_ajax: function (e) {
        var target = $(e.target);
        if (target.hasClass('file-caption') || target.prop('type') == 'file') {
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
                if (target.hasClass('multi_select') || target.hasClass('select2-search__field') || target.hasClass('select2-selection--multiple')){
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

    },
    initialize: function () {
        this.delegateEvents();
    },
    // bind_event: function () {
    //     this.model.on("add change", this.render, this);
    //     this.model.on("destroy", this.close, this);
    // },

    render: function () {
        //todob dont use global selector
        this.$el.html(this.template(this.model.attributes));
        return this.$el;
    }
});