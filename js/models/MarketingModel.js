app.models.Marketing = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'marketing',
        relations: [{
            type: Backbone.HasOne,
            key: 'createdby',
            relatedModel: app.models.User,
            reverseRelation: {
                key: 'marketing',
                includeInJSON: 'id'
            }
        }],
        localStorage: false,
        // profile: {avatar: null},

        defaults: {
            // organizer: {name: null}
        },
        setCreatedby: function (created_by_user) {
            this.createdby = created_by_user;
            this.set('user_id', created_by_user.get('id'));
        }
    }
);

app.collections.Marketing_collection = Backbone.Collection.extend({
    model: app.models.Marketing,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url : config.restUrl + 'marketing'
});