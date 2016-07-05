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

        events: {
            "click #login_form ": "login"
        },
        login: function () {
            app.router.navigate('/account_setting');
            app.router.account_setting();

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

