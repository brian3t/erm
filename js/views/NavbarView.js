app.views.NavbarView = Backbone.View.extend({
    model: app.cur_user,
    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template(app.cur_user.attributes));
        this.delegateEvents();
        this.set_active();
        return this.$el;
    },

    events: {
        "click .logout": "back"
    },

    back: function (event) {
        ratchet_popover_dismiss();
        document.cookie = "loginstring=";
        app.router.navigate('#', {trigger: true, replace: true});
    },
    set_active: function (menu) {
        if (typeof menu == "undefined" || !menu) {
            if (!_.isObject(Backbone) || !_.isObject(Backbone.history) || !Backbone.history.hasOwnProperty('fragment')){
                return this;
            }
            menu = Backbone.history.getFragment();
        }
        this.$('li.menu').removeClass('active');
        if (!_.isEmpty(menu)) {
            this.$('li.menu.' + menu).addClass('active');
        }
        return this;
    }
});
