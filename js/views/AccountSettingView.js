app.views.AccountSettingView = Backbone.View.extend({
    model: app.cur_user,
    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        this.$('#navbar').html(app.navbar_view.render());
        this.$('#my_account_setting').html((new app.views.MyAccountSettingView()).render().html());
        this.delegateEvents();
        return this;
    },

    events: {
        "click .logout": "back",
        "blur .edit": "update_ajax"
    },
    update_ajax: function (e) {
        var target = $(e.target);
        if (target.hasClass('file-caption') || target.prop('type') == 'file'){
            return;
        }
        var form = target.parents('form');
        var model = form.data('model');//user
        new_attr = {};
        new_attr[target.prop('name')] = target.val();
        target.before('<span class="glyphicon glyphicon-upload"></span>');
        app[model].save(new_attr, {patch:true, success: function () {
            target.prev('span.glyphicon-upload').remove();
            target.before('<span class="glyphicon glyphicon-ok-circle"></span>');
            setTimeout(function(){
                target.prev('span').fadeOut(1400);
            }, 2000);
        }, error: function () {
            target.prev('span.glyphicon-upload').remove();
        }});
    },

    dom_ready: function () {
        $('#profile_image').fileinput({dropZoneEnabled: false,
            uploadUrl:config.restUrl+ 'profile/image?user_id=' +app.cur_user.get('id')});
    },
    back: function (event) {
        // app.router.navigate('#', {trigger: true, replace: true});
    }
});
