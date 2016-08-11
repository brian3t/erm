app.views.HomeView = Backbone.View.extend({

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.$username = this.$el.find('input#username');
            this.$password = this.$el.find('input#password');
            return this;
        },
        dom_ready: function () {
            $('#login-form').validator();
        },
        events: {
            "click #signin ": "login"
        },
        login: function () {
            var homeview_class = app.views.HomeView;
            //disable the button so we can't resubmit while we wait
            $("#submitButton", this).attr("disabled", "disabled");

            $.post(config.restUrl + 'user/login', $('#login-form').serialize(), function (resp) {
                if (resp.status == 'ok') {
                    app.user_profile.set(resp.profile);
                    app.router.navigate('/account_setting', {trigger: true});
                    app.router.account_setting();
                }
            }, 'json');

        }


    },
    {
        username: '',
        password: '',
        $username: '',
        $password: '',
        hashedPassword: '',
        hashed: true,
        remember: true

    }
)
;

app.cuser = new app.models.Cuser;
if (IS_DEBUG) {
    window.localStorage.removeItem('cuser');
}
app.local_store_cuser = {};

//testing backbone localstorage
// var Model = Backbone.Model.extend({
//     urlRoot: '/tpl/fixtures.json',
//     localStorage: true
// });
// var model = new Model({});
// model.fetch({
//     success: function (model, response, options) {
//         console.log(Backbone.LocalStorage._getData('/tpl/fixtures.json'));
//     }
// });

