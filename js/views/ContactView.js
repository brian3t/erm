app.views.ContactView = Backbone.View.extend({
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
        return this.el;
    },
    dom_ready: function () {
        this.delegateEvents();
    }
});
