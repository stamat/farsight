$(document).ready(function() {
    //var fs = new Farsight({vonly: true, viewport: $('#viewport'), pane:{elem:$('#pane')}});

    var fs = new Farsight({vonly: false});

    var $percentage = $('.percentage');
    fs.getViewport().bind('percentage', function(vp){
        $percentage.css('width', vp.yp + '%');
    });
});
