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
        this.user_form_view = new app.views.UserView({model: new app.models.User()});
    },
    user_form_view: {},
    render: function () {
        this.$el.empty();
        //get first user in collection
        var first_user = this.collection.first();
        this.$el.html(this.template());
        this.user_form_view.model = first_user;
        if (_.isObject(first_user)) {
            this.$el.append(this.user_form_view.render().el);
        }
        return this;
    }
});

app.views.UserView = Backbone.View.extend({
    tagName: "form",
    model: app.models.User,
    className: "col-md-10 edit account_info",

    initialize: function () {
        if (_.isObject(this.model)) {
            this.model.on("add change", this.render, this);
            this.model.on("destroy", this.close, this);
        }
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});