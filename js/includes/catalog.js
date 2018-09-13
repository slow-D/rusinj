let catalog = (function($) {

    let _uri, _prepare = [], $_this, _pagination, $_pages, $_separatorPrototype, $_currentPageNumber, _scrollOffset = 0;

    function _replace(content) {
        return new Promise(resolve => {
            let $content = $(content);
            let display = $content.css('display');
            $content.hide();
            $_pages.css('min-height', $_pages.outerHeight());
            $_pages.children().velocity('fadeOut', {
                duration: 200,
                complete() {
                    $_pages.html($content);
                    if (_pagination && $_currentPageNumber.length) {
                        $_currentPageNumber.text(_pagination.getCurrent());
                    }
                    $content.velocity('fadeIn', {
                        duration: 200,
                        display: display,
                        complete() {
                            $_pages.css('min-height', '');
                            resolve();
                        }
                    })
                }
            });
        });
    }

    function _addPage(content) {
        return new Promise(resolve => {
            let $separator = $_separatorPrototype.clone();
            $separator.show();
            $separator.find('[data-id="current"]').text(_pagination.getCurrent());
            let $newPage = $('<div style="display:none"></div>');
            $newPage.append($separator);
            $newPage.append(content);
            $_pages.append($newPage);
            $newPage.velocity('slideDown', {
                duration: 400,
                complete: resolve
            });
        });
    }

    function _load(isPage = false, isMore = false, isPoped = false) {
        loader.show();
        let scroll = isPage ? new Promise(resolve => {
            $_this.velocity('scroll', {
                duration: 400,
                offset: _scrollOffset,
                complete: resolve
            });
        }) : Promise.resolve();
        let ajax = new Promise(resolve => {
            $.ajax({
                type: 'get',
                dataType: 'html',
                url: _uri.toString(),
                success: function(resp) {
                    if (isMore) {
                        _addPage(resp).then(() => {
                            resolve();
                        });
                    } else {
                        _replace(resp).then(() => {
                            resolve();
                        });
                    }
                    if (!isPoped) {
                        window.history.pushState(_uri.toString(), document.title, this.url);
                    }
                },
                error: resolve
            });
        });
        return Promise.all([scroll, ajax]).then(() => {
            loader.hide();
        });
    }

    return {

        setPrepare(cb) {
            if (cb && typeof(cb) === 'function') _prepare.push(cb);
            return this;
        },

        reset(params) {
            params.forEach(param => {
                _uri.removeQuery(param);
            });
            return this;
        },

        load(params) {
            if (params) {
                _uri.setQuery(params);
            }
            _load();
            return this;
        },

        init() {
            _uri = new URI();
            $_this = $('#catalog').eq(0);
            $_pages = $_this.find('[data-id="pages"]');
            $_separatorPrototype = $_this.find('[data-id="separator"]');
            $_currentPageNumber = $_this.find('[data-id="current-page-number"]');
            window.history.replaceState(_uri.toString(), '', location.pathname + location.search);
            window.onpopstate = function(ev) {
                if (ev.state) {
                    _uri = new URI(ev.state);
                    if (_pagination) {
                        if (_uri.hasQuery('page')) {
                            _pagination.setCurrent(_uri.search(true).page);
                        } else {
                            _pagination.setCurrent(1);
                        }
                    }
                    _load(false, false, true);
                } else {
                    ev.stopPropagation();
                }
            };
            
            _pagination = $('.pagination').eq(0).data('pagination-inst');
            if (_pagination) {
                _pagination.setOnChange(pageNumber => {
                    _uri.removeQuery('page');
                    if (pageNumber > 1) {
                        _uri.setQuery('page', pageNumber);
                    }
                    return _load(true);
                });
                _pagination.setOnMore(pageNumber => {
                    _uri.removeQuery('page');
                    if (pageNumber > 1) {
                        _uri.setQuery('page', pageNumber);
                    }
                    return _load(false, true);
                });
            }
        },
        
        setScrollOffset(offset) {
            _scrollOffset = parseInt(offset);
        }

    }

})(jQuery);

app.on('init', () => {
    if ($('#catalog').length) {
        catalog.init();
    }
}, 101);