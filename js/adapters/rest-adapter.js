app.adapters.plan = (function () {

    var
        getPlans = function (params) {
            return $.getJSON(config.restUrl + 'plan/get/' + app.utils.restful.assocArrayToRESTString(params), {});
        },
        findById = function (id) {
            var deferred = $.Deferred();
            var plan = null;
            var l = plans.length;
            for (var i = 0; i < l; i++) {
                if (plans[i].id === id.toString()) {
                    plan = plans[i];
                    break;
                }
            }
            deferred.resolve(plan);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = plans.filter(function (element) {
                return element.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },
        findByState = function (state) {
            var deferred = $.Deferred();
            var plans = null;
            plans = getPlans({"state": state});
            deferred.resolve(plans);
            return deferred.promise();
        },
        findByFidState = function (f_id, state) {
            var deferred = $.Deferred();
            var result = null;
            $.when(getPlans({"f_id":f_id, "state": state})).then(
                function (result1) {
                    result = result1;
                    deferred.resolve(result);
                });
            return deferred.promise();
        },
        findByNameState = function (name, state) {
            var deferred = $.Deferred();
            var results = null;
            $.when(getPlans({"name":name, "state": state})).then(
                function (result1) {
                    results = result1;
                    deferred.resolve(results);
                });
            return deferred.promise();
        },

    //plans =
    //    [{"id":"4272","f_id":"26","name":"Aetna 2-Tier Closed","state_code":"CA"},{"id":"4273","f_id":"2257","name":"Aetna 2-Tier Open","state_code":"CA"},{"id":"4274","f_id":"27","name":"Aetna 3-Tier","state_code":"CA"},{"id":"4275","f_id":"28","name":"Aetna 4-Tier","state_code":"CA"},{"id":"4276","f_id":"29","name":"Aetna 5-Tier","state_code":"CA"},{"id":"4277","f_id":"5042","name":"Aetna Dual Copay Open","state_code":"CA"},{"id":"4278","f_id":"2267","name":"Aetna Single-Tier Closed","state_code":"CA"},{"id":"4279","f_id":"2488","name":"AFSCME Council 31","state_code":"CA"},{"id":"4280","f_id":"41","name":"AFTRA","state_code":"CA"},{"id":"4281","f_id":"46","name":"AIDS Drug Assistance Program (CA)","state_code":"CA"},{"id":"4282","f_id":"95","name":"Alameda Alliance","state_code":"CA"},{"id":"4283","f_id":"519","name":"AmWINS Rx","state_code":"CA"},{"id":"4284","f_id":"201","name":"Anthem (BC California)","state_code":"CA"},{"id":"4285","f_id":"5046","name":"Anthem (BC California) 4 Tier","state_code":"CA"},{"id":"4286","f_id":"6218","name":"Anthem Covered California (2015)","state_code":"CA"},{"id":"4287","f_id":"5387","name":"Anthem Covered California Bronze","state_code":"CA"},{"id":"4288","f_id":"5389","name":"Anthem Covered California Gold","state_code":"CA"},{"id":"4289","f_id":"5390","name":"Anthem Covered California Platinum","state_code":"CA"},{"id":"4290","f_id":"5388","name":"Anthem Covered California Silver","state_code":"CA"},{"id":"4291","f_id":"202","name":"Anthem Medi-Cal (BC California)","state_code":"CA"}];

    plans = [];
    // The public API
    return {
        findById: findById,
        findByName: findByName,
        findByState: findByState,
        findByNameState: findByNameState,
        findByFidState: findByFidState
    };

}());

app.adapters.formulary = (function () {

    var
        getFormularys = function (params) {
            return $.getJSON(config.restUrl + 'drugPlanState/get/' + app.utils.restful.assocArrayToRESTString(params), {});
        },
        findById = function (id) {
            var deferred = $.Deferred();
            var formulary = null;
            var l = formularys.length;
            for (var i = 0; i < l; i++) {
                if (formularys[i].id === id.toString()) {
                    formulary = formularys[i];
                    break;
                }
            }
            deferred.resolve(formulary);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = formularys.filter(function (element) {
                return element.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            results = results.slice(0, 20);
            deferred.resolve(results);
            return deferred.promise();
        },
        findByState = function (state) {
            var deferred = $.Deferred();
            var formularys = null;
            formularys = getFormularys({"state": state});
            deferred.resolve(formularys);
            return deferred.promise();
        },
        findByFidDrugIdState = function(f_id, drug_id, state){
            var deferred = $.Deferred();
            var results = null;
            $.when(getFormularys({"f_id": f_id, "drug_id": drug_id, "state": state})).then(
                function(xhrResult){
                    results = xhrResult;
                    deferred.resolve(results);
                }
            );
            return deferred.promise();
        },
    formularys = [{"id":"21112","f_id":"4692","state_code":"NM","drug_name_param":"Crestor","drug_id":"1838","tier_code":"2","additional_info":"ST does not apply to all strengths\/formulations.","restriction_code":"ST"}];
    // The public API
    return {
        findById: findById,
        findByName: findByName,
        findByFidDrugIdState: findByFidDrugIdState
    };

}());