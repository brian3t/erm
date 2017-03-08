app.models.Settlement = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'settlement',
        // relations: [{
        //     type: Backbone.HasOne,
        //     key: 'organizer',
        //     relatedModel: app.models.Company,
        //     reverseRelation: {
        //         key: 'settlement',
        //         includeInJSON: 'id'
        //     }
        // }],
        localStorage: false,
        settlement_id: null,

        defaults: {
            // organizer: {name: null}
        }
        // setOrganizer: function (organizer) {
        //     this.organizer = organizer;
        //     this.set('company_id', organizer.get('id'));
        // }
    }
);

app.collections.Settlement = Backbone.Collection.extend({
    model: app.models.Settlement,
    url: config.restUrl + 'settlement',
    initialize: function (options) {
    }
});