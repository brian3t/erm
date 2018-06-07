app.models.MkInternet = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        // urlRoot: config.restUrl + '/profile',
        relations: [
            {
                type: Backbone.HasOne,
                key: 'company_id',
                relatedModel: 'app.models.Company',
            }],

        localStorage: false,
    }
);