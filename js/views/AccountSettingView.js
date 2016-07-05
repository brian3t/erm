app.views.AccountSettingView = Backbone.View.extend({
    model: app.cuser,
    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        return this;

    },

    events: {
        "click .logout": "back"
    },

    back: function (event) {
        // app.router.navigate('#', {trigger: true, replace: true});
    }
});
