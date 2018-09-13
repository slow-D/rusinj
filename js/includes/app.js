function Events() {
    let _events = {}, _emitted = [];
    this.on = function (eventNames, fn, priority = 100) {
        if (!$.isArray(eventNames)) {
            eventNames = [eventNames];
        }
        eventNames.forEach(eventName => {
            _events[eventName] = _events[eventName] || [];
            _events[eventName].push({
                fn: fn,
                priority: priority
            });
            if (_emitted[eventName]) {
                fn(_emitted[eventName].data);
            }
        });
    };
    this.emit = function (eventName, data) {
        if (!_emitted[eventName]) {
            _emitted[eventName] = {data: data};
        }
        if (_events[eventName]) {
            _events[eventName].sort((a,b) => {
                return a.priority - b.priority;
            });
            let promises = [];
            _events[eventName].forEach(event => {
                promises.push(Promise.resolve(event.fn(data)));
            });
            return Promise.all(promises);
        }
        return Promise.resolve();
    };
    this.debugEvents = function(key) {
        console.log(key, _events, _emitted);
    }
}

let app = (function($) {
    let _scroll, _scrollLocked;

    function _bindEvents() {
        $('body').on('submit', 'form[data-ajax]', e => {
            e.preventDefault();
            let $this = $(e.currentTarget);
            let values = new FormData(e.currentTarget);
            loader.show();
            $this.find('button, input[type="submit"]').attr('disabled', true).prop('disabled', true);
            $.ajax({
                type: $this.attr('method'),
                dataType: 'html',
                processData: false,
                contentType: false,
                url: $this.attr('action'),
                data: values,
                success: resp => {
                    let $resp = $(resp);
                    if ($resp.is('form[data-ajax]')) {
                        $resp = $resp.filter('form[data-ajax]').eq(0);
                        $this.replaceWith($resp);
                    } else {
                        $resp.find('.modal__container').css('min-height', $this.closest('[data-id="replace-on-submit"]').find('.modal__container').outerHeight());
                        $this.closest('[data-id="replace-on-submit"]').html($resp);
                    }
                    app.emit('ajaxFormSubmit', $resp);
                },
                complete: () => {
                    loader.hide();
                },
            });
        });

        $('body').on('mousewheel', '.fancybox-slide', (ev) => {
            let fancybox = $.fancybox.getInstance();
            if (ev.deltaY > 0) fancybox.next();
            else fancybox.previous();
        });
    }

    const _scales = [
        {name: 'xs', size: 320},
        {name: 'sm', size: 640},
        {name: 'md', size: 960},
        {name: 'lg', size: 1280},
        {name: 'xl', size: 1600},
        {name: 'ml', size: 1920}
    ];

    function _getNewScale() {
        let viewportWidth = getViewportWidth();
        for (let i = 1; i < _scales.length; i++) {
            if (viewportWidth < _scales[i].size) {
                return _scales[i-1];
            }
        }
        return _scales[_scales.length-1];
    }

    return $.extend({
            scales: _scales,
            currentScale: {},
            lazyLoad: {},
            getScaleSize(name) {
                for (let i = 1; i < _scales.length; i++) {
                    if (_scales[i].name === name) {
                        return _scales[i].size;
                    }
                }
            },
            emitInit() {
                this.emit('init', {
                    scale: this.currentScale,
                });
            },
            init() {
                this.lazyLoad = new LazyLoad({
                    class_loading: "lazy-loading",
                    class_loaded: "lazy-loaded",
                    class_error: "lazy-error",
                    class_initial: "lazy-initial",
                    data_src: 'src'
                });
                _bindEvents();
                this.currentScale = _getNewScale();
                $(window).resize(() => {
                    let newScale = _getNewScale();
                    if (newScale !== this.currentScale) {
                        this.currentScale = newScale;
                        this.emit('changeScale', newScale);
                    } else {
                        this.emit('changeViewport');
                    }
                    this.emit('resize', {
                        scale: this.currentScale,
                    });
                });
                let resizeStop = debounce(data => {
                    this.emit('resizeStop', data);
                }, 500);
                this.on('resize', resizeStop);
                svg4everybody();

                if ($('include[src]:empty').length) {
                    let interval = setInterval(() => {
                        if ($('include[src]:empty').lenght) {
                            return false;
                        }
                        clearInterval(interval);
                        this.emitInit();
                    }, 100);
                } else {
                    this.emitInit();
                }

            },
            scrollLock() {
                _scroll = scrollTop();
                this.emit('scrollLock');
                $('.body').css({top: -_scroll});
                $('html').addClass('scroll-locked');
                $('body').css('padding-right', $('body').hasScrollBar() ? getScrollbarWidth() : '');
                $('[data-id="scroll-lock"]').css('right', $('body').hasScrollBar() ? getScrollbarWidth() : '');
                _scrollLocked = true;
            },
            scrollUnlock() {
                if (_scrollLocked) {
                    $('body').css('padding-right', '');
                    $('.body').css({top: ''});
                    $('[data-id="scroll-lock"]').css('right', '');
                    $('html').removeClass('scroll-locked');
                    scrollTop(_scroll);
                    _scrollLocked = false;
                    this.emit('scrollUnlock');
                }
            }
        }, new Events()
    );
})(jQuery);

$(function() {
    app.init();
});