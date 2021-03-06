app.views.CompaniesView = Backbone.View.extend({
    company_list_view: {},
    initialize: function () {
        this.company_list_view = new app.views.CompanyListView();
        this.render();
    },
    render: function () {
        this.$el.html(this.template());
        this.$('#navbar').html(app.navbar_view.render());
        this.$('#companies').html(this.company_list_view.render());
        this.company_list_view.after_render();
        this.delegateEvents();
        return this.el;
    },
    dom_ready: function () {
        is_validator_initializing = true;
        $('form.account_info').validator();
        is_validator_initializing = false;
        this.delegateEvents();
    }
});
