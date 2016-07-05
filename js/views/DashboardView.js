app.views.DashboardView = Backbone.View.extend({
    model: app.cuser,
    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template($.extend({}, this.model.attributes, {commuter_data: this.model.commuter_data})));
        return this;
    },

    events: {
        "click .logout": "back"
    },

    back: function (event) {
        ratchet_popover_dismiss();
        app.router.navigate('#', {trigger: true, replace: true});
    }
});
