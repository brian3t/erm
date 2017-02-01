app.views.SettlementsView = Backbone.View.extend({
    settlement_list_view: {},
    initialize: function () {
        this.settlement_list_view = new app.views.SettlementListView();
        this.render();
    },
    render: function () {
        this.$el.html(this.template());
        this.$('#navbar').html(app.navbar_view.render());
        this.$('#settlements').html(this.settlement_list_view.render());
        this.settlement_list_view.after_render();
        this.delegateEvents();
        return this.$el;
    },
    dom_ready: function () {
        this.delegateEvents();
    }
});
