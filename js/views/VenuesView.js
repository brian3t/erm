app.views.MarketingsView = Backbone.View.extend({
    marketing_list_view: {},
    initialize: function () {
        this.marketing_list_view = new app.views.MarketingListView();
        this.render();
    },
    render: function () {
        this.$el.html(this.template());
        this.$('#navbar').html(app.navbar_view.render());
        this.$('#marketings').html(this.marketing_list_view.render());
        this.marketing_list_view.after_render();
        this.delegateEvents();
        return this.$el;
    },
    dom_ready: function () {
        this.delegateEvents();
    }
});
