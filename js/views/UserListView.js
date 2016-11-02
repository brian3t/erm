/*
 A list of users. With search box and list of items on the left
 */
app.views.UserListView = Backbone.View.extend({
    tagName: 'div',
    className: 'user_list_view',
    collection: {},
    initialize: function () {
        var self = this;
        this.collection = new app.models.User_collection();
        this.collection.fetch();
        this.user_search_list_view = new app.views.UserSearchListView({collection: this.collection});
        this.user_form_view = new app.views.UserView();
        this.listenTo(this.collection, 'update', this.render);
    },
    user_form_view: {},
    user_search_list_view: {},
    render: function () {
        this.$el.empty();
        //get first user in collection
        var first_user = this.collection.first();
        this.$el.html(this.template());
        if (_.isObject(first_user)) {
            this.user_form_view.model = first_user;
            this.user_form_view.bind_event();
            this.$('#user_form').html(this.user_form_view.render().el);
        }
        //todob dont use global id in selector
        $('#user_search_list').html(this.user_search_list_view.render());
        return this.$el.html();
    }
});

app.views.UserSearchListView = Backbone.View.extend({
    tagName: "div",
    collection: {},
    className: "table-responsive",

    initialize: function () {
        this.listenTo(this.collection, 'change reset add remove', this.render)
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
    className: "col-md-10 edit account_info",

    initialize: function () {
    },
    bind_event: function () {
        this.model.on("add change", this.render, this);
        this.model.on("destroy", this.close, this);
    },

    render: function () {
        //todob dont use global selector
        $('#user_form').html(this.template(this.model.attributes));
        return this.$el.html();
    }
});