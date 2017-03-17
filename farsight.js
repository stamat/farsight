/*
    - FARSIGHT -
    JavaScript viewport framework - enables you cool scrolling animations and much more...

    @version: v1.0.0
    @author: Nikola Stamatovic Stamat <nikola@otilito.com>
*/

//TODO: terminate farsight function, unbind all the events
//TODO: different farsight functions for scroll related animations, like opacity
//TODO: integrate floatit into this framework https://jsfiddle.net/stamat/tmjn44p9/
//TODO: Case when active element is above the viewport and not visible prevent some calculations to improve performance
//TODO: Think about cases where both vertical and horizontal scrolling is enabled

var farsight = {};

farsight.Viewport = function Viewport(o) {
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

    this.vonly = false; //vertical only - saves calculation time
    this.honly = false; //horizontal only - saves calculation time

    this.viewport = window;
    this.default_viewport = true;
    this.pane = {};
    this.pane.elem = $('body');
    this.pane.width = 0;
    this.pane.height = 0;

    var autoincrement = 0; //autoincrement for callback naming

    //extend with options, nonrecursive extend
    for (var k in o) {
        if (this.hasOwnProperty(k)) {
            this[k] = o[k];

            if (k === 'viewport' && !o[k].hasOwnProperty('innerWidth')) {
                this.default_viewport = false;
            }
        }
    }


    this.bind = function(name, callback) {
        if (!name) {
            name = 'fn' + autoincrement;
        }
        this.callbacks[name] = callback;
        autoincrement++;
    };

    this.unbind = function(name) {
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

        if (!this.honly) {
            this.yd = this.y - this.yo;
            this.bottom = this.y + this.height;
            this.pane.height = this.pane.elem.height();

            var suby = this.pane.height - this.height;
            if (suby <= 0) {
                this.yp = 0;
            } else {
                this.yp = this.y * 100 / suby;
            }
        }

        if (!this.vonly) {
            this.xd = this.x - this.xo;
            this.right = this.x + this.width;
            this.pane.width = this.pane.elem.width();

            var subx = this.pane.width - this.width;

            if (subx <= 0) {
                this.xp = 0;
            } else {
                this.xp = this.x * 100 / subx;
            }
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
            self.onscroll();
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

farsight.ActiveElement = function ActiveElement(elem, viewport, o) {
    this.width = null;
    this.height = null;
    this.x = null;
    this.y = null;
    this.xp = 0; //percentage visible
    this.yp = 0; //percentage visible
    this.element = $(elem);
    this.bottom = null;
    this.right = null;
    this.viewport = viewport;
    this.callback = null;
    this.once = false;

    this.oldy = 0; //start position y
    this.oldx = 0; //start position x

    this.animation = null;
    this.duration = null;
    this.delay = null;
    this.infinite = false;

    this.target = null; //can be used in scroll callbacks, represents a target DOM element cache
    this.data = null;

    //extend with options, nonrecursive extend
    for (var k in o) {
        if (this.hasOwnProperty(k)) {
            this[k] = o[k];

            if (k === 'animation') {
                this.once = true;
                this.callback = function() {
                    this.element.addClass('animated '+ this.animation);
                };
            }
        }
    }

    this.update = function() {
        if (!this.callback) {
            return;
        }

        this.width = this.element.outerWidth();
        this.height = this.element.outerHeight();
        var off = {};
        if (this.viewport.default_viewport) {
            off = this.element.offset();
        } else {
            off = this.element.position();
        }
        this.y = off.top;
        this.x = off.left;

        if (!this.viewport.honly) {
            this.bottom = this.y + this.height;
            if (this.viewport.bottom < this.y) {
                this.yp = 0;
            } else if (this.viewport.y > this.bottom) {
                this.yp = -1;
            } else if (this.viewport.bottom >= this.bottom) {
                this.yp = 1;
            } else {
                this.yp = (this.viewport.bottom-this.y) / this.height;
            }
        }

        if (!this.viewport.vonly) {
            this.right = this.x + this.width;

            if (this.viewport.right < this.x) {
                this.xp = 0;
            } else if (this.viewport.x > this.right) {
                this.xp = -1;
            } else if (this.viewport.right >= this.right) {
                this.xp = 1;
            } else {
                this.xp = (this.viewport.right-this.x) / this.width;
            }
        }

        if (this.xp > 0 && this.xp <= 1 && this.yp > 0 && this.yp <= 1) {
            this.callback(this);

            if (this.once) {
                this.callback = null;
            }
        }
    }

    var self = this;
    var __init__ = function() {
        if (this.duration) {
            this.element.css('animation-duration', this.duration);
        }

        if (this.delay) {
            this.element.css('animation-delay', this.delay);
        }

        if (this.infinite) {
            this.element.css('animation-iteration-count', 'infinite');
        }

        self.update();
        var name = typeof elem === 'string' ? elem : undefined;
        self.viewport.bind(name, function() {
            self.update();
        });
    }
    __init__();
}

//utils from stamat/ivartech
farsight.utils = {};
farsight.utils.getPropertyByNamespace = function(str, root, del) {
    if(!del) del = '.';
	var parts = typeof str === 'string' ? str.split(del) : str;
	var current = !root ? window : root;
	for (var i = 0; i < parts.length; i++) {
		if (current.hasOwnProperty(parts[i])) {
			current = current[parts[i]];
		} else {
			return;
		}
	}
	return current;
};


farsight.parallax = function(ae) {
    ae.element.css('transform', 'translate3d(0px, '+(ae.viewport.y/6)+'px, 0px)');
};

farsight.percentage = function(ae) {
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
    var m = ae.data;
    ae.element.css({'transform': 'rotate('+(m-m*o)+'deg)'});
};

farsight.scale = function(ae) {
    var o = ae.yp;
    if (o < 0) {
        o = 0
    }
    var m = ae.data;
    ae.element.css({'transform': 'scale('+(o)+')'});
};

//follow element consists of a container and content following the viewport which is the fs-target elem
farsight.follow = function(ae) {
    //if (ae.viewport.y > ae.oldy) {

    //}
};

farsight.pre = {};

farsight.pre.opacity = function(ae) {
    ae.element.css('opacity', 0);
};

farsight.pre.rotate = function(ae) {
    ae.element.css({'transform': 'rotate('+ae.data+'deg)'});
};

farsight.pre.fade_in_up = function(ae) {
    ae.element.css({'opacity':  0, 'transform': 'translate3d(0px, '+ae.data+'px, 0px)'});
};

farsight.pre.scale = function(ae) {
    var o = !ae.data ? 0 : ae.data;

    ae.element.css({'transform': 'scale('+o+')'});
};

function Farsight(o) {
    this.elements = [];
    this.selector = '.fs';
    this.viewport = window;
    this.pane = $('body');
    this.vonly = false;
    this.honly = false;
    this.viewport_instance = null;

    this.getViewport = function() {
        return this.viewport_instance;
    };

    var attrs = {
        'fs-animation': {
            'field': 'animation',
            'value': 'string'
        },
        'fs-function': {
            'field': 'callback',
            'value': 'function'
        },
        'fs-duration': {
            'field': 'duration',
            'value': 'string'
        },
        'fs-delay': {
            'field': 'delay',
            'value': 'string'
        },
        'fs-infinite': {
            'field': 'infinite',
            'value': 'boolean'
        },
        'fs-target': {
            'field': 'target',
            'value': 'element'
        },
        'fs-data-number': {
            'field': 'data',
            'value': 'number'
        },
        'fs-data-string': {
            'field': 'data',
            'value': 'string'
        },
        'fs-data': {
            'field': 'data',
            'value': 'json'
        }
    };

    //extend with options, nonrecursive extend
    for (var k in o) {
        if (this.hasOwnProperty(k)) {
            this[k] = o[k];
        }
    }

    var self = this;
    var __init__ = function() {
        self.viewport_instance = new farsight.Viewport({vonly: self.vonly, honly: self.honly, viewport: self.viewport, pane: {elem: self.pane}});
        var has_custom = null; //if the element has an attribute "fn-function" used for prepare functions

        var $elems = $(self.selector);
        for (var i = 0; i < $elems.length; i++) {
            var $elem = $($elems[i]);
            var o = {};

            for (var k in attrs) {
                var attr = $elem.attr(k);

                if (attr || attr === '') {
                    var a = attrs[k];

                    if (a.value === 'boolean') {
                        o[a.field] = attr === '' || attr === 'true';
                    } else if (a.value === 'function') {
                        o[a.field] = farsight.utils.getPropertyByNamespace(attr);
                    } else if (a.value === 'number') {
                        o[a.field] = parseFloat(attr);
                    } else if (a.value === 'json') {
                        o[a.field] = JSON.parse(attr);
                    } else if (a.value === 'element') {
                            o[a.field] = $(attr);
                    } else {
                        o[a.field] = attr;
                    }

                    if (k === 'fs-function') {
                        has_custom = attr;
                    }
                }
            }

            var ae = new farsight.ActiveElement($elem, self.viewport_instance, o);
            self.elements.push(ae);

            if (has_custom) {
                var pts = has_custom.split('.');
                pts.splice(1, 0, 'pre');
                var pre_fn = farsight.utils.getPropertyByNamespace(pts);
                if (pre_fn) {
                    pre_fn(ae);
                }
            }
        }
    }
    __init__();
}
