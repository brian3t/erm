app.views.AccountSettingView = Backbone.View.extend({
    model: app.cur_user,
    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        this.$('#navbar').html(app.navbar_view.render());
        this.$('#my_account_setting').html((new app.views.MyAccountSettingView()).render().html());
        return this;
    },

    events: {
        "click .logout": "back"
    },

    back: function (event) {
        // app.router.navigate('#', {trigger: true, replace: true});
    }
});
