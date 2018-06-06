app.models.User = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'user',
        relations: [{
            type: Backbone.HasOne,
            key: 'company',
            relatedModel: app.models.Company,
            reverseRelation: {
                key: 'user',
                includeInJSON: 'id'
            }
        }, {
            type: Backbone.HasOne,
            key: 'profile',
            relatedModel: 'app.models.Profile',
            reverseRelation: {
                key: 'belongs_to',
                relatedModel: 'app.models.User',
                includeInJSON: 'id'
            }
        }, {
            type: Backbone.HasMany,
            key: 'offer',
            relatedModel: 'app.models.Offer',
            reverseRelation: {
                key: 'user',
                relatedModel: 'app.models.User',
                includeInJSON: 'id'
            },
            autoFetch: true
        }, {
            type: Backbone.HasMany,
            key: 'marketing',
            relatedModel: 'app.models.Marketing',
            reverseRelation: {
                key: 'createdby',
                relatedModel: 'app.models.User',
                includeInJSON: 'id'
            },
            autoFetch: true
        }, {
            type: Backbone.HasMany,
            key: 'offer_as_artist',
            relatedModel: 'app.models.Offer',
            reverseRelation: {
                key: 'artist',
                relatedModel: 'app.models.User',
                includeInJSON: false
            }
        }],
        localStorage: false,
        username: null,
        password: null,

        // profile: {avatar: null},

        defaults: {
            // twitter_id: null,
            // company: {name: null},
            // profile: {avatar: null},
            // offer: {event_id: null},
            // marketing: {},
            // offer_as_artist: {}
        },
        get: function (args) {
            if (args === 'fullname') {
                return this.getFullName();
            }
            return Backbone.RelationalModel.prototype.get.call(this, args);
        },
        getFullName: function () {
            return this.get('first_name') + ' ' + this.get('last_name');
        },
        setBelongCompany: function (company) {
            this.company = company;
            this.set('belong_company_id', company.get('id'));
        }
    },
    {
        state: null
    }
);

app.collections.User_collection = Backbone.Collection.extend({
    model: app.models.User,
    url: config.restUrl + 'user',
    comparator: function (a) {
        return a.get('first_name').toLowerCase();
    }    // initialize: function () {
    //     this.url = config.restUrl + 'user?' + $.param({'company_id': app.cur_user.get('company').get('id')});
    // }
});