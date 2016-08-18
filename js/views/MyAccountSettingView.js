app.views.MyAccountSettingView = Backbone.View.extend({
    model: app.cur_user,
    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        return this.$el;
    },

    events: {
        "click .logout": "back"
    },

    back: function (event) {
        // app.router.navigate('#', {trigger: true, replace: true});
    }
});
