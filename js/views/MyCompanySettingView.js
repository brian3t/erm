app.views.MyCompanySettingView = Backbone.View.extend({
    model: app.cur_user,
    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        return this.$el;
    },
    dom_ready: function () {
        // $('#change_password').validator();
    },

    events: {
        "click .logout": "back"
    },
    back: function (event) {
        // app.router.navigate('#', {trigger: true, replace: true});
    }
});
