app.views.OffersView = Backbone.View.extend({
    offer_list_view: {},
    initialize: function () {
        this.offer_list_view = new app.views.OfferListView();
        this.render();
    },
    render: function () {
        this.$el.html(this.template());
        this.$('#navbar').html(app.navbar_view.render());
        this.$('#offers').html(this.offer_list_view.render());
        this.offer_list_view.after_render();
        this.delegateEvents();
        return this.el;
    },
    dom_ready: function () {
        this.delegateEvents();
        this.offer_list_view.offer_form_view.$el.find('input[name$="_flat_rate"]').trigger('change');
        is_validator_initializing = true;
        $('form.account_info').validator();
        is_validator_initializing = false;
        $('input.money').autoNumeric('init', {aSign:'$'});
    }
});
