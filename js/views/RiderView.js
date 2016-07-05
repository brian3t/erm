app.views.RiderView = Backbone.View.extend({
    initialize: function () {
        // this.listenTo(this.model, 'change', this.render);
        // this.render();
    },
    render: function () {
        this.model = app.cur_rider;
        this.$el.html(this.template(this.model.attributes));
        return this.$el.html();
    }
});