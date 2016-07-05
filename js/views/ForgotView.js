app.views.ForgotView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template());
       return this;
    },

    events: {
        "click .logout": "back"
    },

    back: function(event) {
        window.history.back();
        return false;
    }
});
