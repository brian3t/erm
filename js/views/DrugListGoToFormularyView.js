/*
A list of drug items, with anchor pointing to formularyView , e.g. /#formulary/2118/863/CA
This is to avoid anchor href hijacking. Maybe in the future goratchet is replaced with some better framework;
or even do away with anchor

Therefore, this view expects model to have f_id and state_code
 */
app.views.DrugListGoToFormularyView = Backbone.View.extend({

    tagName:'ul',

    className:'table-view',

    initialize:function () {
        var self = this;
        this.model.on("reset", this.render, this);
        this.model.on("add", function (drug) {
            self.$el.append(new app.views.DrugListGoToFormularyItemView({model:drug}).render().el);
        });
    },

    render:function () {
        this.$el.empty();
        _.each(this.model.models, function (drug) {
            this.$el.append(new app.views.DrugListGoToFormularyItemView({model:drug}).render().el);
        }, this);
        return this;
    }
});

app.views.DrugListGoToFormularyItemView = Backbone.View.extend({

    tagName:"li",

    className: "table-view-cell",

    initialize:function () {
        this.model.on("change", this.render, this);
        this.model.on("destroy", this.close, this);
    },

    render:function () {
        this.$el.html(this.template($.extend(this.model.attributes,{f_id: this.model.collection.model.f_id, state_code: this.model.collection.model.state_code})));
        return this;
    }
});