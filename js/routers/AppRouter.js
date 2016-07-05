app.routers.AppRouter = Backbone.Router.extend({

    routes: {
        "": "home",
        "drugs/:id": "drugDetails",
        "dashboard": "dashboard",
        "view_riders": "view_riders",
        "request_ride": "request_ride"
        // ,"formulary/:f_id/:drug_id/:state": "formularyDetails"
    },

    initialize: function () {
        app.slider = new PageSlider($('body'));
        app.slider.slidePageSp = (function (_super) {
            return function () {
                var result = _super.apply(this, arguments);
                console.log("Assign class after sliding");
                var current_view = Backbone.history.getFragment() == '' ? 'home' : Backbone.history.getFragment();
                $('div.page').attr('current_view', current_view);
                return result;
            }
        })(app.slider.slidePage);
        app.slider.slidePage = app.slider.slidePageSp;
    },
    set_class_page: function () {
        var current_view = Backbone.history.getFragment() == '' ? 'home' : Backbone.history.getFragment();
        $('div.page').attr('current_view', current_view);
    },

    home: function () {
        // Since the home view never changes, we instantiate it and render it only once
        if (!app.homeView) {
        app.homeView = new app.views.HomeView();
        app.homeView.render();
        } else {
            console.log('reusing home view');
            app.homeView.delegateEvents(); // delegate events when the view is recycled
        }
        app.slider.slidePage(app.homeView.$el);

    },


    account_setting: function () {
        // Since the home view never changes, we instantiate it and render it only once
        if (!app.accountSettingView) {
            app.accountSettingView= new app.views.AccountSettingView();
            app.accountSettingView.render();
        } else {
            console.log('reusing home view');
            app.accountSettingView.delegateEvents(); // delegate events when the view is recycled
        }
        app.slider.slidePage(app.accountSettingView.$el);

    }

});