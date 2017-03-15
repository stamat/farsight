/*
    - FARSIGHT -
    JavaScript viewport framework - enables you cool scrolling animations and much more...

    @version: v1.0.0
    @author: Nikola Stamatovic Stamat <nikola@otilito.com>
*/

//TODO: terminate farsight function, unbind all the events
//TODO: different farsight functions for scroll related animations, like opacity
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
    this.yp = 0; //percentage visible
    this.element = $(elem);
    this.bottom = null;
    this.right = null;
    this.viewport = viewport;
    this.callback = null;
    this.once = false;

    this.animation = null;
    this.duration = null;
    this.delay = null;
    this.infinite = false;

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

        var lockx = false;
        var locky = false;

        if (!this.viewport.honly) {
            this.bottom = this.y + this.height;
            if (this.viewport.bottom < this.y) {
                this.yp = 0;
                locky = true;
            } else if (this.viewport.bottom >= this.bottom) {
                this.yp = 1;
                locky = false;
            } else {
                locky = false;
                this.yp = (this.viewport.bottom-this.y) / this.height;
            }
        }

        if (!this.viewport.vonly) {
            this.right = this.x + this.width;

            if (this.viewport.right < this.x) {
                this.xp = 0;
                lockx = true;
            } else if (this.viewport.right >= this.right) {
                this.xp = 1;
                lockx = false;
            } else {
                lockx = false;
                this.xp = (this.viewport.right-this.x) / this.width;
            }
        }
        
        if (!lockx && !locky) {
            this.callback(this);

            if (this.once) {
                this.callback = null;
            }
        }
    }

    var self = this;
    var __init__ = function() {
        if (this.duration) {
            this.element.css('-vendor-animation-duration', this.duration);
        }

        if (this.delay) {
            this.element.css('-vendor-animation-delay', this.delay);
        }

        if (this.infinite) {
            this.element.css('-vendor-animation-iteration-count', 'infinite');
        }

        self.update();
        var name = typeof elem === 'string' ? elem : undefined;
        self.viewport.bind(name, function() {
            self.update();
        });
    }
    __init__();
}

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
                        o[a.field] = window[attr];
                    } else {
                        o[a.field] = attr;
                    }
                }
            }

            self.elements.push(new farsight.ActiveElement($elem, self.viewport_instance, o));
        }
    }
    __init__();
}
