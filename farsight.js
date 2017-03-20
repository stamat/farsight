/*
    - FARSIGHT -
    JavaScript viewport framework - enables you cool scrolling animations and much more...

    @version: v1.0.0
    @author: Nikola Stamatovic Stamat <nikola@otilito.com>
*/

//TODO: terminate farsight function, unbind all the events
//TODO: change the custom function system to merge CSS transform into one - make a separate custom CSS function

//TODO: Percentage of dissapearance when passing through the left or top border of the viewport if enabled
//TODO: Think about cases where both vertical and horizontal scrolling is enabled

var farsight = farsight || {};

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

    var scrollTimer = null;

    this.onscroll = function(force) {
        this.calculate();

        for (var key in this.callbacks) {
            this.callbacks[key](this, force);
        }
    };

    farsight._utils.extend(this, o, false, false);

    var __init__ = function() {
        //if the viewport is not window
        if (!self.viewport.hasOwnProperty('innerWidth')) {
            self.default_viewport = false;
        }

        window.onresize = function() {
            self.calculate();
        };

        var scrollfn = function() {
            self.onscroll();

            //scroll end fix
            if (scrollTimer) {
              clearTimeout(scrollTimer);
            }
            scrollTimer = setTimeout(function(){
                self.onscroll(true);
            }, 100);
        };

        if (self.default_viewport) {
            self.onscroll();
            self.viewport.onscroll = scrollfn;
        } else {
            self.calculate();
            self.viewport.scroll(scrollfn);
        }
    }
    __init__();
}

farsight.ActiveElement = function ActiveElement(elem, viewport, o, auto_init) {
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
    this.multiple_callbacks = false;
    this.once = false;
    this.vdirection = 1;
    this.hdirection = 1;

    this.oldy = 0; //start position y
    this.oldx = 0; //start position x

    this.animation = null;
    this.duration = null;
    this.delay = null;
    this.count = false;

    this.disappear = false; //https://youtu.be/nYSDC3cHoZs

    this.target = null; //can be used in scroll callbacks, represents a target DOM element cache
    this.data = {};

    this.auto_init = auto_init === undefined;

    var autoincrement = 0;

    this.bind = function(name, callback) {
        if (!this.multiple_callbacks && this.callback !== null) {
            this.callback = {'0': this.callback};
        }
        if (!name) {
            name = 'fn' + autoincrement;
        }
        this.multiple_callbacks =  true;
        this.callback = this.callback || {};
        this.callback[name] = callback;
        autoincrement++;
    };

    this.unbind = function(name) {
        delete this.callback[name];
    };

    this.update = function(force) {
        if (!this.callback) {
            return;
        }

        this.width = this.element.outerWidth();
        this.height = this.element.outerHeight();
        var off = {};
        if (this.viewport.default_viewport) {
            off = this.element.offset();
            this.y = off.top;
            this.x = off.left;
        } else {
            off = this.element.position();
            this.y = this.viewport.y + off.top;
            this.x = this.viewport.x + off.left;
        }

        if (!this.viewport.honly) {
            this.bottom = this.y + this.height;
            if (this.viewport.bottom < this.y) {
                this.yp = 0;
                this.vdirection = 1;
            } else if (this.disappear && this.viewport.y < this.bottom && this.viewport.y > this.y) {
                this.yp = 1 - (this.viewport.y - this.y) / this.height;
                this.vdirection = -1;
            } else if (this.disappear && this.viewport.y > this.bottom) {
                this.yp = 0;
                this.vdirection = -1;
            } else if (this.viewport.bottom >= this.bottom) {
                this.yp = 1;
                this.vdirection = 1;
            } else {
                this.yp = (this.viewport.bottom-this.y) / this.height;
                this.vdirection = 1;
            }
        }

        if (!this.viewport.vonly) {
            this.right = this.x + this.width;

            if (this.viewport.right < this.x) {
                this.xp = 0;
                this.hdirection = 1;
            } else if (this.disappear && this.viewport.x < this.right && this.viewport.x > this.x) {
                this.xp = 1 - (this.viewport.x - this.x) / this.width;
                this.hdirection = -1;
            } else if (this.disappear && this.viewport.x > this.right) {
                this.xp = 0;
                this.hdirection = -1;
            } else if (this.viewport.right >= this.right) {
                this.xp = 1;
                this.hdirection = 1;
            } else {
                this.xp = (this.viewport.right-this.x) / this.width;
                this.hdirection = 1;
            }
        }

        if ((force && !this.once) || (this.xp > 0 && this.xp <= 1 && this.yp > 0 && this.yp <= 1)) {
            if (this.multiple_callbacks) {
                for (var k in this.callback) {
                    this.callback[k](this);
                }
            } else {
                this.callback(this);
            }

            if (this.once) {
                this.callback = null;
            }
        }
    }

    farsight._utils.extend(this, o, false, false);

    var self = this;
    var __init__ = function() {

        if (o.hasOwnProperty('callback')) {
            self.multiple_callbacks = typeof self.callback !== 'function';
        }

        if (o.hasOwnProperty('animation')) {
            self.once = true;
            self.disappear = true;
            self.callback = function() {
                self.element.addClass('animated '+ self.animation);
            };
            self.multiple_callbacks = false;
        }

        if (self.duration) {
            self.element.css('animation-duration', self.duration);
        }

        if (self.delay) {
            self.element.css('animation-delay', self.delay);
        }

        if (self.count) {
            self.element.css('animation-iteration-count', self.count);
        }
        if (self.auto_init) {
            self.update();
        }

        var name = typeof elem === 'string' ? elem : undefined;
        self.viewport.bind(name, function(viewport, force) {
            self.update(force);
        });
    }
    __init__();
}

//utils from stamat/ivartech
farsight._utils = {};
farsight._utils.getPropertyByNamespace = function(str, root, del) {
    del = del || '.';
	var parts = typeof str === 'string' ? str.split(del) : str;
	var current = root || window;
	for (var i = 0; i < parts.length; i++) {
		if (current.hasOwnProperty(parts[i])) {
			current = current[parts[i]];
		} else {
			return;
		}
	}
	return current;
};

farsight._utils.namespace = function(str, root, del) {
    del = del || '.';
	var parts = typeof str === 'string' ? str.split(del) : str;
	var current = root || window;
	for(var i = 0; i < parts.length; i++) {
		if (!current.hasOwnProperty(parts[i])) {
			current[parts[i]] = {};
        }
		current = current[parts[i]];
	};
	return current;
};

//deep extend
//if_not_exists can be undefined, true, false, if it's false it will only extend the object if it has the property of the extender, if it's true it extends only if the property doesn't exist or it's null
farsight._utils.extend = function(o1, o2, deep, if_not_exists) {
	for (var i in o2) {
        var state = true;
        if (if_not_exists !== undefined ) {
            if (if_not_exists === false) {
                state = o1.hasOwnProperty(i);
            } else {
                state = !(o1[i] !== undefined && o1[i] !== null && if_not_exists);
            }
        }

        if (deep && typeof o1[i] === 'object' && typeof o2[i] === 'object') {
            farsight._utils.extend(o1[i], o2[i], if_not_exists);
        }

		if (state) {
			o1[i] = o2[i];
		}
	}
	return o1;
};

// attrs should be an object with names and desired format
farsight._utils.parseAttrs = function(elem, attrs) {
    var res = {};
    var $elem = $(elem);

    var parsers = {};
    parsers['boolean'] = function(v) {
        return v === '' || v === 'true';
    };

    parsers['string'] = function(v) {
        return v;
    };

    parsers['function'] = function(v) {
        var fns = v.split(/,\s?/g);
        if (fns.length === 1) {
            return farsight._utils.getPropertyByNamespace(fns[0]);
        }
        var r = {};
        for (var i = 0; i < fns.length; i++) {
            r[fns[i]] = farsight._utils.getPropertyByNamespace(fns[i]);
        }

        return r;
    };

    parsers['number'] = function(v) {
        return parseFloat(v);
    };

    parsers['selector'] = function(v) {
        return $(v);
    };

    parsers['json'] = function(v) {
        return JSON.parse(v);
    };

    for (var k in attrs) {
        var attr = $elem.attr(k);

        if (attr || attr === '') {
            var nk = k.replace(/^fs\-/ig, '');
            nk = nk.replace(/\-/g, '_');
            res[nk] = parsers[attrs[k]](attr);
        }
    }

    return res;
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
        'fs-animation': 'string',
        'fs-callback': 'function',
        'fs-duration': 'string',
        'fs-delay': 'string',
        'fs-count': 'string',
        'fs-target': 'selector',
        'fs-disappear': 'boolean'
    };

    farsight._utils.extend(this, o, false, false);

    var self = this;
    var __init__ = function() {

        self.viewport_instance = new farsight.Viewport({vonly: self.vonly, honly: self.honly, viewport: self.viewport, pane: {elem: self.pane}});

        var $elems = $(self.selector);
        for (var i = 0; i < $elems.length; i++) {
            var $elem = $($elems[i]);
            var o = farsight._utils.parseAttrs($elem, attrs);

            var ae = new farsight.ActiveElement($elem, self.viewport_instance, o, false);
            self.elements.push(ae);

            function executePreFn(fpath, ae) {
                var pts = fpath.split('.');
                pts.splice(pts.length-1, 0, '_pre');

                var pre_fn = farsight._utils.getPropertyByNamespace(pts);
                if (pre_fn) {
                    pre_fn(ae);
                }
            }

            if (o && o.hasOwnProperty('callback')) {
                if (typeof o['callback'] === 'function') {
                    executePreFn(ae.element.attr('fs-callback'), ae);
                } else {
                    for (var k  in o['callback']) {
                        executePreFn(k, ae);
                    }
                }
            }
            ae.update();
        }
    }
    __init__();
}
