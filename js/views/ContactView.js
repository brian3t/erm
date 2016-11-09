app.views.ContactView = Backbone.View.extend({
    model: app.user_collection,
    user_list_view: {},
    initialize: function () {
        this.user_list_view = new app.views.UserListView();
        this.render();
    },
    render: function () {
        this.$el.html(this.template());
        this.$('#navbar').html(app.navbar_view.render());
        this.$('#contacts').html(this.user_list_view.render());
        this.user_list_view.after_render();
        this.delegateEvents();
        return this.$el.html();
    },

    events: {
        "click .logout": "back"
    },

    dom_ready: function () {
        this.delegateEvents();
    },
    back: function (event) {
        // app.router.navigate('#', {trigger: true, replace: true});
    }
});
