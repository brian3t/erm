function getQuestion() {

    $.ajax({
        url: config.commuterUrl + 'RecoverPasswordServlet?userName=' + $("#username").val(),
        type: 'GET',
        success: function (data) {
            $("#question").text(data);
        },
        error: function (data) {

            var text = data.responseText.split("<")[0];
            $("#question").text(text);
        }
    });


}


function resetPassword() {
    var answer = $("#answer").val();
    var new_password = $("#new_password").val();
    if (answer === "" ||  new_password === "") {
        alertDialog("Reset Password", "Password Recovery Answer and New Password are both required");
        return false;
    }
    var success = false;
    var reset_url = config.commuterUrl + 'json?action=recoverpassword&userName=' + $("#username").val() + '&newPassword=' + new_password + '&pwdQuestion=' + $("#question").text() + '&pwdAnswer=' + answer;
    $.ajax({
        url: reset_url,
        type: 'GET',
        success: function (data) {
            if (data.response === "success") {
                alertDialog("Reset Password", "Your password has been changed.  Click Ok to return to the login screen.");
                app.routers.route('home');
                app.routers.home();
            }
            else {
                alertDialog("Reset Password", "We were unable to change your password.  Please verify your Password Recovery Answer");
            }

        }
        ,
        error: function (data) {
            alertDialog("Reset Password", "We were unable to change your password.  Please verify your Password Recovery Answer");
        }

    });


}
