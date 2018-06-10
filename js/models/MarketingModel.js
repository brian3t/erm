app.models.Marketing = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'marketing',
        relations: [{
            type: Backbone.HasOne,
            key: 'offer',
            relatedModel: 'app.models.Offer',
            reverseRelation: {
                key: 'marketing',
                includeInJSON: 'id'
            },
            autoFetch: true
        }, {
            type: Backbone.HasMany,
            key: 'mk_radios',
            relatedModel: 'app.models.MkRadio',
            reverseRelation: {
                key: 'marketing',
                includeInJSON: 'id'
            },
            autoFetch: true
        }, {
            type: Backbone.HasMany,
            key: 'mk_televisions',
            relatedModel: 'app.models.MkTelevision',
            reverseRelation: {
                key: 'marketing',
                includeInJSON: 'id'
            },
            autoFetch: true
        }, {
            type: Backbone.HasMany,
            key: 'mk_internets',
            relatedModel: 'app.models.MkInternet',
            reverseRelation: {
                key: 'marketing',
                includeInJSON: 'id'
            },
            autoFetch: true
        }, {
            type: Backbone.HasMany,
            key: 'mk_prints',
            relatedModel: 'app.models.MkPrint',
            reverseRelation: {
                key: 'marketing',
                includeInJSON: 'id'
            },
            autoFetch: true
        }, {
            type: Backbone.HasMany,
            key: 'mk_productions',
            relatedModel: 'app.models.MkProduction',
            reverseRelation: {
                key: 'marketing',
                includeInJSON: 'id'
            },
            autoFetch: true
        }, {
            type: Backbone.HasMany,
            key: 'mk_miscs',
            relatedModel: 'app.models.MkMisc',
            reverseRelation: {
                key: 'marketing',
                includeInJSON: 'id'
            },
            autoFetch: true
        }
        ],
        localStorage: false,
        defaults: {
            // organizer: {name: null}
        },
        setCreatedby: function (created_by_user) {
            this.createdby = created_by_user;
            this.set('user_id', created_by_user.get('id'));
        },
        _summary: {
            all_gross: 0,
            all_net: 0,
            all_ticket: 0,
            companies: {
                //company_id: {
                //              }
            }
        },
        get_summary: function () {
            return this._summary;
        },
        calculate_summary: function () {
            let all_gross = 0, all_net = 0, all_ticket = 0, companies = {};
            ['mk_internets', 'mk_miscs', 'mk_prints', 'mk_productions', 'mk_radios', 'mk_televisions'].forEach(key => {
                this.get(key).each(e => {
                    let company_id = e.get('company_id').get('id');
                    all_gross += pf2d(e.get('gross'));
                    all_net += pf2d(e.get('net'));
                    all_ticket += pf2d(e.get('promo_tickets'));
                    if (!companies.hasOwnProperty(company_id)) {
                        companies[company_id] = {
                            name: e.get('company_id').get('name'), gross: 0, net: 0, ticket: 0
                        };
                    }
                    companies[company_id].gross += pf2d(e.get('gross'));
                    companies[company_id].net += pf2d(e.get('net'));
                    companies[company_id].ticket += pf2d(e.get('promo_tickets'));
                });
            });

            all_gross = all_gross.toFixed(2);
            all_net = all_net.toFixed(2);
            all_ticket = all_ticket.toFixed(2);
            this._summary = {all_gross: all_gross, all_net: all_net, all_ticket: all_ticket, companies: companies};
            // console.log(`sum: `);
            // console.log(this._summary);
            return this._summary;
        }

    }
);

app.collections.Marketing_collection = Backbone.Collection.extend({
    model: app.models.Marketing,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url: config.restUrl + 'marketing'
});