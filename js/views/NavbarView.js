app.views.NavbarView = Backbone.View.extend({
    model: app.cur_user,
    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template(app.cur_user.attributes));
        return this.$el.html();
    },

    events: {
        "click .logout": "back"
    },

    back: function (event) {
        ratchet_popover_dismiss();
        app.router.navigate('#', {trigger: true, replace: true});
    }
});
