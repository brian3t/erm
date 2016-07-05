app.views.SignupView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template());
        return this;
    },

    events: {
        "click #signup_submit": "signup",
        "click #goback" : "back"
    },
    signup: function () {
        app_alert("This function is not available for now. Please sign up at https://tdm.commuterconnections.org/mwcog/CCRegistration.jsp", this.back);
    },
    back: function(event) {
        window.history.back();
        return false;
    }



}, {
   localvar: false

});