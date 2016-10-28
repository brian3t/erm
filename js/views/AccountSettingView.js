app.views.AccountSettingView = Backbone.View.extend({
    model: app.cur_user,
    my_account_setting_view: null,
    my_company_setting_view: null,
    initialize: function () {
        this.my_account_setting_view = new app.views.MyAccountSettingView();
        // this.my_company_setting_view = new app.views.MyCompanySettingView();
        this.render();
    },
    render: function () {
        this.$el.html(this.template(this.model.attributes));
        this.$('#navbar').html(app.navbar_view.render());
        this.$('#my_account_setting').html(this.my_account_setting_view.render().html());
        // this.$('#my_company_setting_view').html(this.my_company_setting_view.render().html());
        this.delegateEvents();
        return this;
    },

    events: {
        "click .logout": "back",
        "blur .edit": "update_ajax",
        "change .multi_select": "update_ajax",
        "click #update_pwd": "update_pwd"
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
    update_pwd: function (e) {
        //verify current pwd
        var cur_pw = app.cur_user.get('password');
        if ($('input[name="password"]').val() !== cur_pw) {
            app_alert("Your current password doesn't match. Please try again");
            return;
        }
        //verify new pwd with repeat pwd
        var new_pwd = $('input[name="new_password"]').val();
        if (new_pwd !== $('input[name="repeat_password"]').val()) {
            app_alert("Your repeat password does not match your new password.");
            return;
        }
        //if they both works send them over
        app.cur_user.save({password: new_pwd});
        $.post(config.restUrl + 'settings/account', {
                "settings-form": {
                    email: app.cur_user.get('email'),
                    username: app.cur_user.get('username'),
                    new_password: new_pwd,
                    current_password: cur_pw
                }
            },
            function (data) {
                var result = false;
                if (!_.isArray(data)) {
                    result = false;
                } else {
                    result = (data[0] == true);
                }

                if (result) {
                    app_alert("Success. Your password has been updated.");
                } else {
                    app_alert("Our server is having issue with your request. Please contact our support team for help. " + data.toString());
                    app.cur_user.save({password: cur_pw});
                }
            })
            .error(function (data) {
                console.info('Our server is having issue with your request. Please contact our support team for help. ' + data.responseText);
                app.cur_user.save({password: cur_pw});
            });
        // , {
        //     patch: true,
        //     success: function () {
        //         app_alert("Your password has been successfully updated");
        //     },
        //     error: function () {
        //         app_alert("Your password can not be changed. Please contact us at support@entertainmentdirectmetrics.com");
        //     }
        // })
    },

    dom_ready: function () {
        $('#profile_image').fileinput({
            dropZoneEnabled: false,
            uploadUrl: config.restUrl + 'profile/image?user_id=' + app.cur_user.get('id'),
            maxFileCount: 1
        });
        this.my_account_setting_view.dom_ready();
    },
    back: function (event) {
        // app.router.navigate('#', {trigger: true, replace: true});
    }
});
