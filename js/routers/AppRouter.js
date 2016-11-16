app.routers.AppRouter = Backbone.Router.extend({

    routes: {
        "": "home",
        "drugs/:id": "drugDetails",
        "dashboard": "dashboard",
        "account_setting": "account_setting",
        "contact": "contact",
        // ,"formulary/:f_id/:drug_id/:state": "formularyDetails"
    },

    initialize: function () {
        app.slider = new PageSlider($('body'));
        app.slider.slidePageSp = (function (_super) {
            return function () {
                var result = _super.apply(this, arguments);
                // console.log("Assign class after sliding");
                var current_view = Backbone.history.getFragment() == '' ? 'home' : Backbone.history.getFragment();
                $('div.page').attr('current_view', current_view);
                element_ready();
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
        app.homeView.dom_ready();

    },


    dashboard: function () {
        // Since the home view never changes, we instantiate it and render it only once
        if (!app.dashboardView) {
            app.dashboardView = new app.views.DashboardView();
            app.dashboardView.render();
        } else {
            console.log('reusing dashboard view');
            app.dashboardView.delegateEvents(); // delegate events when the view is recycled
        }
        app.slider.slidePage(app.dashboardView.$el);

    },
    account_setting: function () {
        // Since the home view never changes, we instantiate it and render it only once
        if (!app.accountSettingView) {
            app.accountSettingView = new app.views.AccountSettingView();
            app.accountSettingView.render();
        } else {
            console.log('reusing accountsetting view');
            app.accountSettingView.delegateEvents(); // delegate events when the view is recycled
        }
        app.slider.slidePage(app.accountSettingView.$el);
        app.accountSettingView.dom_ready();
    },

    contact: function () {
        // Since the home view never changes, we instantiate it and render it only once
        if (!app.contactView) {
            app.contactView = new app.views.ContactView();
            app.contactView.render();
        } else {
            console.log('reusing contactView view');
            app.contactView.delegateEvents(); // delegate events when the view is recycled
        }
        app.slider.slidePage(app.contactView.$el);
        app.contactView.dom_ready();
    },
    venue: function () {
        // Since the home view never changes, we instantiate it and render it only once
        if (!app.venueView) {
            app.venueView = new app.views.venueView();
            app.venueView.render();
        } else {
            console.log('reusing venueView view');
            app.venueView.delegateEvents(); // delegate events when the view is recycled
        }
        app.slider.slidePage(app.venueView.$el);
        app.venueView.dom_ready();
    }

});