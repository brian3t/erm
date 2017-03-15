app.models.Venue = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'venue',
        relations: [{
            type: Backbone.HasOne,
            key: 'organizer',
            relatedModel: app.models.Company,
            reverseRelation: {
                key: 'venue',
                includeInJSON: 'id'
            }
        }],
        localStorage: false,
        name: null,
        venuetype: null,

        // profile: {avatar: null},

        defaults: {
            organizer: {name: null}
        },
        setOrganizer: function (organizer) {
            this.organizer = organizer;
            this.set('company_id', organizer.get('id'));
        }
    }
);

app.collections.Venue_collection = Backbone.Collection.extend({
    model: app.models.Venue,
    comparator: 'name',
    url : config.restUrl + 'venue',
    initialize: function (options) {
    }
});