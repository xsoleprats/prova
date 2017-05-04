$(document).bind('mobileinit', function(){
    //$.mobile.pushStateEnabled = false;
    $.mobile.ajaxEnabled = false;
    $.mobile.pushStateEnabled = false;
    $.mobile.linkBindingEnabled = false;
    $.mobile.hashListeningEnabled = false;
    $.mobile.changePage.defaults.changeHash = false;
});