var farsight = farsight || {};

farsight.parallax = function(ae) {
    ae.element.css('transform', 'translate3d(0px, '+(ae.viewport.y/6)+'px, 0px)');
};

farsight.opacity = function(ae) {
    var o = ae.yp;
    if (o < 0) {
        o = 0
    }
    ae.element.css('opacity', o);
};

farsight.up = function(ae) {

    var o = ae.yp;
    if (o < 0) {
        o = 0
    }
    var m = ae.data.position || 20;
    if (ae.vdirection > 0) {
        ae.element.css({'transform': 'translate3d(0px, '+(m-m*o)+'px, 0px)'});
    } else {
        ae.element.css({'transform': 'translate3d(0px, '+(-1*(m-m*o))+'px, 0px)'});
    }
};

farsight.fade_in = function(ae) {
    var o = ae.yp;
    if (o < 0) {
        o = 0
    }

    ae.element.css('opacity', o);
};


farsight.percentage = function(ae) {
    if (ae.vdirection < 0) {
        return;
    }

    var o = ae.yp;
    if (o < 0) {
        o = 0
    }
    var p = o*100;
    ae.target.css('width', p+'%');
};

farsight.opacity = function(ae) {
    var o = ae.yp;
    if (o < 0) {
        o = 0
    }
    ae.element.css('opacity', o);
};

farsight.fade_in_up = function(ae) {
    var o = ae.yp;
    if (o < 0) {
        o = 0
    }
    var m = ae.data;
    ae.element.css({'opacity':  o, 'transform': 'translate3d(0px, '+(m-m*o)+'px, 0px)'});
};

farsight.rotate = function(ae) {
    var o = ae.yp;
    if (o < 0) {
        o = 0
    }
    var m = ae.data.rotate;
    ae.element.css({'transform': 'rotate('+(m-m*o)+'deg)'});
};

farsight.scale = function(ae) {
    var o = ae.yp;
    if (o < 0) {
        o = 0
    }
    ae.element.css({'transform': 'scale('+(o)+')'});
};

//follow element consists of a container and content following the viewport which is the fs-target elem
farsight.follow = function(ae) {
    var post = ae.data.top.offset();
    var posb = ae.data.bottom.offset();

    var b = posb.top - ae.height;

    if (ae.viewport.y > post.top && ae.viewport.y < b) {
        ae.element.css({'position': 'fixed', 'top': '0px'});
    } else if (ae.viewport.y >= b) {
        ae.element.css({'position': 'absolute'}).offset({top: b});
    } else {
        ae.element.css({'position': 'static'});
    }
};

farsight.test = function(ae) {
    console.log(ae.yp);
}

farsight._pre = {};

farsight._pre.opacity = function(ae) {
    var attrs = {'fs-opacity': 'number'};
    var pattrs = farsight._utils.parseAttrs(ae.element, attrs);
    farsight._utils.extend(ae.data, pattrs);
    ae.element.css('opacity', ae.data.opacity);
};

farsight._pre.rotate = function(ae) {
    var attrs = {'fs-rotate': 'number'};
    var pattrs = farsight._utils.parseAttrs(ae.element, attrs);
    farsight._utils.extend(ae.data, pattrs);
    ae.element.css({'transform': 'rotate('+ae.data.rotate+'deg)'});
};

farsight._pre.up = function(ae) {
    var attrs = {'fs-position': 'number'};
    var pattrs = farsight._utils.parseAttrs(ae.element, attrs);
    farsight._utils.extend(ae.data, pattrs);
    ae.element.css({'transform': 'translate3d(0px, '+ae.data.position+'px, 0px'});
};

farsight._pre.fade_in_up = function(ae) {
    ae.element.css({'opacity':  0, 'transform': 'translate3d(0px, '+ae.data+'px, 0px)'});
};

farsight._pre.scale = function(ae) {
    var o = 0;


    ae.element.css({'transform': 'scale('+o+')'});
};

farsight._pre.follow = function(ae) {
    var attrs = {'fs-top': 'selector', 'fs-bottom': 'selector'};
    var pattrs = farsight._utils.parseAttrs(ae.element, attrs);
    farsight._utils.extend(ae.data, pattrs);
};
