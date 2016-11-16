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

app.models.Venue_collection = Backbone.Collection.extend({
    model: app.models.Venue,
    initialize: function () {
        this.url = config.restUrl + 'venue?' + $.param({'company_id': app.cur_user.get('company').get('id')});
    }
});