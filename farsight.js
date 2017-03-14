function Viewport(o) {
    var self = this;

    this.width = null;
    this.height = null;
    this.x = null;
    this.y = null;
    this.bottom = null;
    this.right = null;
    this.callbacks = {};
    this.xp = 0; //percentage x
    this.yp = 0; //percentage y
    this.xd = 0; //delta x
    this.yd = 0; //delta y
    this.xo = 0; //old x
    this.yo = 0; //old y

    this.viewport = window;
    this.default_viewport = true;
    this.pane = {};
    this.pane.elem = $('body');
    this.pane.width = 0;
    this.pane.height = 0;

    //extend with options, nonrecursive extend
    for (var k in o) {
        if (this.hasOwnProperty(k)) {
            this[k] = o[k];

            if (k === 'viewport' && !o[k].hasOwnProperty('innerWidth')) {
                this.default_viewport = false;
            }
        }
    }


    this.link = function(name, callback) {
        this.callbacks[name] = callback;
    };

    this.unlink = function(name) {
        delete this.callbacks[name];
    };

    this.calculate = function() {

        if (this.default_viewport) {
            this.width = this.viewport.innerWidth;
            this.height = this.viewport.innerHeight;

            this.xo = this.x === null ? this.viewport.scrollX : this.x;
            this.yo = this.y === null ? this.viewport.scrollY : this.y;

            this.y = this.viewport.scrollY;
            this.x = this.viewport.scrollX;
        } else {
            this.width = this.viewport.width();
            this.height = this.viewport.height();

            this.xo = this.x === null ? this.viewport.scrollLeft() : this.x;
            this.yo = this.y === null ? this.viewport.scrollTop() : this.y;

            this.y = this.viewport.scrollTop();
            this.x = this.viewport.scrollLeft();
        }

        this.xd = this.x - this.xo;
        this.yd = this.y - this.yo;
        this.bottom = this.y + this.height;
        this.right = this.x + this.width;

        this.pane.width = this.pane.elem.width();
        this.pane.height = this.pane.elem.height();

        var suby = this.pane.height - this.height;
        if (suby <= 0) {
            this.yp = 0;
        } else {
            this.yp = this.y * 100 / suby;
        }

        var subx = this.pane.width - this.width;

        if (subx <= 0) {
            this.xp = 0;
        } else {
            this.xp = this.x * 100 / subx;
        }
    };

    this.onscroll = function() {
        self.calculate();

        for (var key in this.callbacks) {
            this.callbacks[key](this);
        }
    };

    var __init__ = function() {

        window.onresize = function() {
            self.calculate();
        };


        if (self.default_viewport) {
            self.viewport.onscroll = function() {
                self.onscroll();
            };
        } else {
            self.calculate();
            self.viewport.scroll(function() {
                self.onscroll();
            });
        }
    }
    __init__();
}

function ActiveElement(elem, viewport, callback) {
    this.width = null;
    this.height = null;
    this.x = null;
    this.y = null;
    this.yp = 0; //percentage visible
    this.element = $(elem);
    this.bottom = null;
    this.right = null;
    this.viewport = viewport;
    this.callback = callback;

    this.update = function() {
        this.width = this.element.outerWidth();
        this.height = this.element.outerHeight();
        var off = this.element.offset();
        this.y = off.top;
        this.x = off.left;
        this.bottom = this.y + this.height;

        if (this.viewport.bottom < this.y) {
            this.yp = 0;
        } else if (this.viewport.bottom >= this.bottom) {
            this.yp = 1;
        } else {
            this.yp = (this.viewport.bottom-this.y) / this.height;
        }

        if (this.callback) {
            this.callback(this);
        }

    }

    var self = this;
    var __init__ = function() {
        self.update();
        self.viewport.link(elem, function() {
            self.update();
        });
    }
    __init__();
}

function ActiveElements() {
    this.elements = [];

    this.gather = function() {
        var $fs = $('.farsight');
        for (var i = 0; i < $fs.length; i++) {
            $e = $($fs[i]);
        }
    };

    var __init__ = function() {
        var self = this;
        window.onresize = function() {

        }
        var $fs = $('.farsight');
    }
    __init__();

}

$(document).ready(function() {
    //var vp = new Viewport({viewport: $('#viewport'), pane:{elem:$('#pane')}});
    var vp = new Viewport();
    var $percentage = $('.percentage');

    vp.link('percentage', function(vp){
        $percentage.css('width', vp.yp + '%');
    });
    new ActiveElement('.s1.farsight', vp, function(ae){
        ae.element.css('opacity', ae.yp)
        ae.element.css('transform', 'translate('+(100-ae.yp*100)+'px, 0px)');
    });
});
