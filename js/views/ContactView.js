app.views.ContactView = Backbone.View.extend({
    model: app.user_collection,
    user_list_view: {},
    initialize: function () {
        this.user_list_view = new app.views.UserListView();
        this.render();
    },
    render: function () {
        this.$el.html(this.template());
        this.$('#navbar').html(app.navbar_view.render());
        this.$('#contacts').html(this.user_list_view.render());
        this.delegateEvents();
        return this;
    },

    events: {
        "click .logout": "back",
        "blur .edit": "update_ajax",
        "change .multi_select": "update_ajax",
    },
    update_ajax: function (e) {
        var target = $(e.target);
        if (target.hasClass('file-caption') || target.prop('type') == 'file') {
            return;
        }
        var form = target.parents('form');
        var model = form.data('model');//user
        new_attr = {};
        new_attr[target.prop('name')] = target.val();
        target.before('<span class="glyphicon glyphicon-upload"></span>');
        app[model].save(new_attr, {
            patch: true, success: function () {
                target.prev('span.glyphicon-upload').remove();
                //dont bother if it's multiselect
                if (target.hasClass('multi_select') || target.hasClass('select2-search__field') || target.hasClass('select2-selection--multiple')){
                    return;
                }
                target.before('<span class="glyphicon glyphicon-ok-circle"></span>');
                setTimeout(function () {
                    target.prev('span').fadeOut(1400);
                }, 2000);
            }, error: function () {
                target.prev('span.glyphicon-upload').remove();
            }
        });
    },
    update_ajax_multi: function (e) {

    },

    dom_ready: function () {
    },
    back: function (event) {
        // app.router.navigate('#', {trigger: true, replace: true});
    }
});
