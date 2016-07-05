app.models.Offer = Backbone.Model.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'offer',
        localStorage: false,

        cuser_id: null,
        request_cuser: null,
        status: 'pending',
        created_at: null,
        updated_at: null
    }
)
;
app.models.OfferCollection = Backbone.Collection.extend({
    model: app.models.Offer,
    url: config.restUrl + 'offer',
    refresh: 2000
});
_.extend(app.models.OfferCollection.prototype, BackbonePolling);