app.views.NavbarView = Backbone.View.extend({
    model: app.cur_user,
    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template(app.cur_user.attributes));
        this.delegateEvents();
        this.$el.find('#back-to-top').click(function() {      // When arrow is clicked
            $('body,html').animate({
                scrollTop : 0                       // Scroll to top of body
            }, 500);
        });
        return this.$el;
    },

    events: {
        "click .logout": "back"
    },

    back: function (event) {
        ratchet_popover_dismiss();
        document.cookie = "loginstring=";
        app.router.navigate('#', {trigger: true, replace: true});
    }
});
