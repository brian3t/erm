if (window.localStorage.getItem('is_logged_in') == '' || window.localStorage.getItem('is_logged_in') == null) {
    location.href = 'login.html';
}

$(document).ready(function ($) {
    $('#signin').bind('click', function () {

    });
    $('form#login').validator();
});