/**
 * Created by tri on 11/19/14.
 */
app.utils.restful = (function (){
    var assocArrayToRESTString = function(arr){
        var result = "";
        for (var k in arr){
            result += k + "/" + arr[k] + "/";
        }
        return result;
    };
    return {assocArrayToRESTString: assocArrayToRESTString}
}());