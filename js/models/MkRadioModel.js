app.models.MkRadio = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'mk-radio',
        relations: [
            {
                type: Backbone.HasOne,
                key: 'company_id',
                relatedModel: 'app.models.Company',
            }],

        localStorage: false,
    }
);