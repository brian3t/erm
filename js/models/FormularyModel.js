app.models.Formulary = Backbone.Model.extend({

    initialize: function () {
    },

    sync: function (method, model, options) {
        if (method === "read") {
            app.adapters.formulary.findByFidDrugIdState(this.get('f_id'), this.get('drug_id'), this.get('state')).done(function (data) {
                options.success(data);
            });
        }
    },
    defaults:{
        plan_name:"",
        plan_url:"#"
    }

});

app.models.FormularyCollection = Backbone.Collection.extend({

    model: app.models.Formulary,

    sync: function (method, model, options) {
        if (method === "read") {

            app.adapters.formulary.findByFidDrugIdState(options.data.f_id, options.data.drug_id, options.data.state).done(function (data) {
                options.success(data);
            });
            //app.adapters.formulary.findByStateName(options.data.state, options.data.name).done(function (data) {
            //    options.success(data);
            //});
        }
    }

});
