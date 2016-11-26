$(function(){
    $('a.nav').click(function(){
        $('.ui.sidebar').sidebar('toggle');
    });
    $('.message .close').on('click', function() {
        $(this).closest('.message').transition('fade');
    });
    $('.writeTweet').click(function(){
        $('.ui.modal').modal('show');
    });

});
