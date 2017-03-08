app.views.VenuesView = Backbone.View.extend({
    venue_list_view: {},
    initialize: function () {
        this.venue_list_view = new app.views.VenueListView();
        this.render();
    },
    render: function () {
        this.$el.html(this.template());
        this.$('#navbar').html(app.navbar_view.render());
        this.$('#venues').html(this.venue_list_view.render());
        this.venue_list_view.after_render();
        this.delegateEvents();
        return this.$el;
    },
    dom_ready: function () {
        is_validator_initializing = true;
        $('form.account_info').validator();
        is_validator_initializing = false;
        this.delegateEvents();
    }
});
