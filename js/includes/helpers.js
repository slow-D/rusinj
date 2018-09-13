function getImageSize(src) {
    let newImg = new Image();
    return new Promise(resolve => {
        newImg.onload = function () {
            resolve({width: newImg.width, height: newImg.height});
        };
        newImg.src = src;
    });
}

function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        let context = this, args = arguments;
        let later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function isInScales(scaleNames) {
    return $.inArray(app.currentScale.name, scaleNames) !== -1;
}

let CallbackRegistry = {}; // реестр
function JSONP(url, callbackName) {
    return new Promise((resolve, reject) => {
        let scriptOk = false;
        if (!callbackName) {
            callbackName = 'cb' + String(Math.random()).slice(-6);
        }
        url += ~url.indexOf('?') ? '&' : '?';
        url += 'callback=CallbackRegistry.' + callbackName;
        CallbackRegistry[callbackName] = function(data) {
            scriptOk = true;
            delete CallbackRegistry[callbackName];
            resolve(data);
        };
        function checkCallback() {
            if (scriptOk) return;
            delete CallbackRegistry[callbackName];
            reject();
        }
        let script = document.createElement('script');
        script.onreadystatechange = function() {
            if (this.readyState === 'complete' || this.readyState === 'loaded') {
                this.onreadystatechange = null;
                setTimeout(checkCallback, 0);
            }
        };
        script.onload = script.onerror = checkCallback;
        script.src = url;
        document.body.appendChild(script);
    });
}

function isAboveScale(scaleName) {
    let target = app.scales.find(scale => {
        return scale.name === scaleName;
    });
    if (!target) return;
    return app.currentScale.size >= target.size;
}

function getViewportWidth() {
    let width;
    if (window.innerWidth) {
        width = window.innerWidth;
    } else if (document.documentElement && document.documentElement.clientWidth) {
        width = document.documentElement.clientWidth;
    } else {
        throw 'Can not detect viewport width.';
    }
    return width;
}

function getScrollbarWidth() {
    let div1, div2;
    if (document.readyState === 'loading') {
        return null;
    }
    div1 = document.createElement('div');
    div2 = document.createElement('div');
    div1.style.width = div2.style.width = div1.style.height = div2.style.height = '100px';
    div1.style.overflow = 'scroll';
    div2.style.overflow = 'hidden';
    document.body.appendChild(div1);
    document.body.appendChild(div2);
    let scrollbarWidth = Math.abs(div1.scrollHeight - div2.scrollHeight);
    document.body.removeChild(div1);
    document.body.removeChild(div2);
    return scrollbarWidth;
}

function scrollTop(scroll = null, smooth = false) {
    if (scroll !== null) {
        if (smooth) {
            $('body').animate({scrollTop: scroll}, smooth);
            $('html').animate({scrollTop: scroll}, smooth);
        } else {
            document.body.scrollTop = scroll;
            document.documentElement.scrollTop = scroll;
        }
    } else {
        return document.body.scrollTop || document.documentElement.scrollTop;
    }
}

function executeFunctionByName(functionName, context /*, args */) {
    let args = Array.prototype.slice.call(arguments, 2);
    let namespaces = functionName.split(".");
    let func = namespaces.pop();
    for(let i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}

function addslashes(str) {
    str=str.replace(/\\/g,'\\\\');
    str=str.replace(/\'/g,'\\\'');
    str=str.replace(/\"/g,'\\"');
    str=str.replace(/\0/g,'\\0');
    return str;
}

function getKeyCode(event) {
    if (event.which == null) { // IE
        return event.keyCode;
    }
    if (event.which != 0 && event.charCode != 0) { // все кроме IE
        return event.which;
    }
}

function encodeQueryData(data) {
    let ret = [];
    for (let i = 0; i < data.length; i++) {
        ret.push(encodeURIComponent(data[i].name) + '=' + encodeURIComponent(data[i].value));
    }
    return ret.join('&');
}

function plural(quantity, f0, f1, f2) {
    let text = f0;
    quantity = quantity || 0;
    if (quantity%10==1 && quantity%100!=11) {
        text = f1;
    } else if (quantity%10>=2 && quantity%10<=4 && (quantity%100<10 || quantity%100>=20)) {
        text = f2;
    }
    return text;
}

function getInterval(point, breakpoints, strict = true) {
    for (let i = 0; i < breakpoints.length; i++) {
        if (point < breakpoints[i] || !strict && point === breakpoints[i]) {
            return i
        }
    }
    return breakpoints.length;
}

function getContrastYIQ(hexcolor){
    let r = parseInt(hexcolor.substr(0,2),16);
    let g = parseInt(hexcolor.substr(2,2),16);
    let b = parseInt(hexcolor.substr(4,2),16);
    let yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}

(function($){
    $.fn.clicktouch = function(cb) {
        if (Modernizr.touchevents) {
            this.on('touchstart', cb);
        } else {
            this.on('click', cb);
        }
    };

    $.fn.columnizeCustom = function(itemClass, colClass, threshold, colNum, columnizedClass='columnized', wrapSingle = false) {
        this.each((i, el) => {
            let $items = $(el).find(`.${itemClass}`);
            if ($items.length > threshold) {
                let cols = [];
                let colSize;
                if (colNum) {
                    colSize = Math.ceil($items.length / colNum);
                } else {
                    colSize = threshold;
                    colNum = Math.ceil($items.length / colSize);
                }
                for (let i = 0; i < colNum; i++) {
                    cols[i] = $([]);
                }
                $items.each((i, el) => {
                    let colI = Math.floor(i / colSize);
                    cols[colI] = cols[colI].add(el);
                });
                cols.forEach(col => {
                    col.wrapAll(`<div class="${colClass}" />`);
                });
                $(el).addClass(columnizedClass);
            } else if (wrapSingle) {
                $items.wrapAll(`<div class="${colClass}" />`);
                $(el).addClass(columnizedClass);
            }
        });
        return this;
    };

    $.fn.handleTableMore = function($btn) {
        let $this = this;
        let $table = $this.find('table');
        let $row = $table.find('tr[threshold]');
        let collapsed = $row.length ? true : false;
        $btn.click(() => {
            if (collapsed) {
                $this.animate({height: $this.get(0).scrollHeight}, 500, () => {
                    $this.css('height', '');
                });
                $btn.hide();
                collapsed = false;
            }
        });
        function update() {
            if (collapsed) {
                let height = $row.offsetTop() + 1;
                $this.height(height);
                $this.after($btn);
            }
        }
        update();
        $(window).on('resize', update);
    };

    $.fn.reduce = function(fnReduce, initialValue) {
        let values = this,
            previousValue = initialValue;

        values.each(function(index, currentValue) {
            previousValue = fnReduce.call(currentValue, previousValue, currentValue, index, values);
        });

        return previousValue;
    };

    $.fn.offsetLeft = function () {
        return this.get(0).offsetLeft;
    };
    $.fn.offsetRight = function () {
        return this.parent().innerWidth() - this.get(0).offsetLeft - this.outerWidth();
    };
    $.fn.offsetTop = function () {
        return this.get(0).offsetTop;
    };

    $.fn.scrollRight = function() {
        let el = this.get(0);
        return el.scrollWidth - this.scrollLeft() - this.innerWidth();
    };
    $.fn.scrollBottom = function() {
        let el = this.get(0);
        return el.scrollHeight - this.scrollTop() - this.innerHeight();
    };

    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    };

    $.fn.serializeObject = function () {
        let result = {};
        let extend = function (i, element) {
            if (element.name.search(/\[.*]$/) !== -1) {
                let name = element.name.replace(/\[.*]$/, '');
                if ($.isArray(result[name])) {
                    result[name].push(element.value);
                } else {
                    result[name] = [element.value];
                }
            } else {
                result[element.name] = element.value;
            }
        };
        $.each(this.serializeArray(), extend);
        return result;
    };

})(jQuery);