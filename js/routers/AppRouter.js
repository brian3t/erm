app.routers.AppRouter = Backbone.Router.extend({

    routes: {
        "": "home",
        "drugs/:id": "drugDetails",
        "dashboard": "dashboard",
        "account_setting": "account_setting",
        "contact": "contact",
        "venues": "venues",
        "companies": "companies",
        "offers": "offers",
        "settlements": "settlements"
        // ,"formulary/:f_id/:drug_id/:state": "formularyDetails"
    },

    initialize: function () {
        var $navbar = $('#navbar');
        app.slider = new PageSlider($('body'));
        app.slider.slidePageSp = (function (_super) {
            return function () {
                var result = _super.apply(this, arguments);
                // console.log("Assign class after sliding");
                var current_view = Backbone.history.getFragment() == '' ? 'home' : Backbone.history.getFragment();
                $('div.page').attr('current_view', current_view);
                element_ready();
                var nav_bar = $('ul.nav.navbar-nav');
                nav_bar.find('li').removeClass('active');
                nav_bar.find('li.menu.' + current_view).addClass('active');
                rebind_html_elements();
                setTimeout(function () {
                    if (_.isEmpty($navbar.html()) && _.isObject(app.navbar_view)) {
                        $('#navbar').hide().html(app.navbar_view.render()).fadeIn('fast');
                    }
                }, 500);
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
            app.contactView.user_list_view.delegateEvents();
            app.contactView.user_list_view.user_form_view.delegateEvents();
        }
        app.slider.slidePage(app.contactView.$el);
        app.contactView.dom_ready();
    },
    venues: function () {
        // Since the home view never changes, we instantiate it and render it only once
        if (!app.venuesView) {
            app.venuesView = new app.views.VenuesView();
            app.venuesView.render();
        } else {
            console.log('reusing venuesView view');
            app.venuesView.delegateEvents(); // delegate events when the view is recycled
            app.venuesView.venue_list_view.delegateEvents();
            app.venuesView.venue_list_view.venue_form_view.delegateEvents();
        }
        app.slider.slidePage(app.venuesView.$el);
        app.venuesView.dom_ready();
    },
    companies: function () {
        // Since the home view never changes, we instantiate it and render it only once
        if (!app.companiesView) {
            app.companiesView = new app.views.CompaniesView();
            app.companiesView.render();
        } else {
            console.log('reusing companiesView view');
            app.companiesView.delegateEvents(); // delegate events when the view is recycled
            app.companiesView.company_list_view.delegateEvents();
            app.companiesView.company_list_view.company_form_view.delegateEvents();
        }
        app.slider.slidePage(app.companiesView.$el);
        app.companiesView.dom_ready();
    },
    offers: function () {
        // Since the home view never changes, we instantiate it and render it only once
        if (!app.offersView) {
            app.offersView = new app.views.OffersView();
            app.offersView.render();
        } else {
            console.log('reusing offersView view');
            app.offersView.delegateEvents(); // delegate events when the view is recycled
            app.offersView.offer_list_view.delegateEvents();
            app.offersView.offer_list_view.offer_form_view.delegateEvents();
        }
        app.slider.slidePage(app.offersView.$el);
        app.offersView.dom_ready();
    },
    settlements: function () {
        // Since the home view never changes, we instantiate it and render it only once
        if (!app.settlementsView) {
            app.settlementsView = new app.views.SettlementsView();
            app.settlementsView.render();
        } else {
            console.log('reusing settlementsView view');
            app.settlementsView.delegateEvents(); // delegate events when the view is recycled
            app.settlementsView.settlement_list_view.delegateEvents();
            app.settlementsView.settlement_list_view.settlement_form_view.delegateEvents();
        }
        app.slider.slidePage(app.settlementsView.$el);
        app.settlementsView.dom_ready();
    }

});