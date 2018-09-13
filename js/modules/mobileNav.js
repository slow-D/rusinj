let mobileNav = (function($) {
    let $_this, $_container, _isOpened = false, _nav, _opened = [];
    let wrapperEl = 'mobile-menu',
        listEl = wrapperEl + '__list',
        subMenuEl = wrapperEl + '__submenu',
        itemEl = wrapperEl + '__item';

    function _handleOne($this, duration = 330) {
        let id = $this.data('id');
        let promise = $.Deferred();
        let promiseSiblings = $.Deferred();
        let promiseSubmenu = $.Deferred();
        if ($this.find('>.' + subMenuEl).length) {
            let $submenu = $this.find('>.' + subMenuEl);
            $submenu.velocity('slideUp', {
                duration: duration,
                complete: () => {
                    $submenu.remove();
                    $this.removeClass(itemEl + '_header');
                    promiseSubmenu.resolve();
                }
            });
            $this.siblings('.' + itemEl).velocity('slideDown', {
                duration: duration,
                complete: () => {
                    promiseSiblings.resolve();
                }
            });
            _opened.pop();
        } else {
            let $submenu = $('<ul class="' + subMenuEl + '" style="display:none"></ul>');
            $submenu.html(_nav.getList(id));
            $this.append($submenu);
            $this.siblings('.' + itemEl).velocity('slideUp', {
                duration: duration,
                complete: () => {
                    promiseSiblings.resolve();
                }
            });
            $submenu.velocity('slideDown', {
                duration: duration,
                complete: () => {
                    promiseSubmenu.resolve();
                },
            });
            $this.addClass(itemEl + '_header');
            _opened.push(id);
            if ($this.data('level') % 2 !== 1) {
                $submenu.addClass(subMenuEl + '_odd');
            }
        }
        $.when(promiseSubmenu, promiseSiblings).done(() => {
            promise.resolve();
        });
        return promise;
    }

    function _handleMany(ids) {
        return _handleOne($_this.find(`[data-id="${ids.shift()}"]`), 100).done(() => {
            if (ids.length) {
                return _handleMany(ids);
            }
        });
    }

    return {
        close() {
            let promise = $.Deferred();
            if (_isOpened) {
                $_container.velocity('fadeOut', {
                    duration: 330,
                    complete: () => {
                        $_this.empty();
                        let lastID = _opened[_opened.length-1];
                        _opened = [];
                        promise.resolve(lastID);
                    }
                });
                _isOpened = false;
                promise.done(() => {
                    app.scrollUnlock();
                });
            } else {
                promise.resolve(_opened[_opened.length-1]);
            }
            promise.then(function() {
                $(document).trigger('mobileNav.closed');
            });
            return promise;
        },
        open(id = 0, loadCurrent = false) {
            if (_isOpened) this.close().done(open);
            else open();
            function open() {
                _nav.load().then(() => {
                    app.scrollLock();
                    $_this.empty();
                    $_this.append(_nav.getList());
                    let parentIDs = _nav.getParents(id);
                    parentIDs.push(id);
                    $_container.velocity('fadeIn', {
                        duration: 330,
                        complete: () => {
                            if (loadCurrent) {
                                let current = _nav.getCurrentParents();
                                if (current.length) {
                                    _handleMany(current);
                                }
                            } else if (parentIDs.length) {
                                _handleMany(parentIDs).done(() => {
                                    let current = _nav.getCurrentParents();
                                    current.shift();
                                    if (current.length) {
                                        _handleMany(current);
                                    }
                                });
                            }
                            $(document).trigger('mobileNav.opened');
                        }
                    });
                    _isOpened = true;
                });
            }
        },
        init() {
            $_this = $('.' + listEl);
            $_container = $('.' + wrapperEl);
            _nav = new Nav(itemEl, '/nav.json', '<svg class="icon icon-arrow-down"><use xlink:href="/assets/build/sprites/global.svg#icon-arrow-down"></use></svg>');
            let $body = $('body');
            $body.on('click', '.' + itemEl + '_parent>.link', ev => {
                ev.preventDefault();
                _nav.load().then(() => {
                    _handleOne($(ev.currentTarget).closest('.' + itemEl));
                });
            });
            $body.on('click', '.' + wrapperEl + '__close', ev => {
                this.close();
            });
            $body.on('click', '.mobile-toolbar__link-nav:not(.link-disabled)', function() {
                if (_isOpened) {
                    mobileNav.close();
                } else {
                    mobileNav.open(0, true);
                }
                $(this).addClass('link-disabled');
            });
            $(document).on('mobileNav.opened mobileNav.closed', function() {
                $('.mobile-toolbar__link-nav').removeClass('link-disabled');
            });
        }
    };

})(jQuery);

app.on('init', mobileNav.init.bind(mobileNav));