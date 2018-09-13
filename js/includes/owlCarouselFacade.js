function owlCarouselFacade($_this, _options, _scales, $_prev, $_next, _updateOnResize = true) {
    return new Promise(resolve => {
        let _enabled = false;
        if (!_scales) {
            _scales = ['xs','sm','md','lg','xl','ml'];
        }
        function _updateArrows() {
            let $_owlPrev = $_this.find('.owl-prev');
            let $_owlNext = $_this.find('.owl-next');
            if ($_prev && $_next && $_owlPrev.length && $_owlNext.length) {
                $_prev.toggleClass('disabled', $_owlPrev.hasClass('disabled'));
                $_next.toggleClass('disabled', $_owlNext.hasClass('disabled'));
                if ($_prev.hasClass('disabled') && $_next.hasClass('disabled')) {
                    $_prev.hide();
                    $_next.hide();
                } else {
                    $_prev.show();
                    $_next.show();
                }
            }
        }
        function _update() {
            if (isInScales(_scales)) {
                if (!_enabled) {
                    let callbacks = {
                        onInitialized(ev) {
                            $_this.find('.owl-nav').hide();
                            _updateArrows();
                            if (typeof _options.onInitialized === 'function') {
                                _options.onInitialized(ev);
                            }
                            resolve();
                        },
                        onChanged(ev) {
                            app.lazyLoad.update();
                            _updateArrows();
                            if (typeof _options.onChanged === 'function') {
                                _options.onChanged(ev);
                            }
                        },
                        onRefresh(ev) {
                            app.lazyLoad.update();
                            _updateArrows();
                            if (typeof _options.onRefresh === 'function') {
                                _options.onRefresh(ev);
                            }
                        },
                    };
                    $_this.addClass('owl-carousel').owlCarousel($.extend(
                        callbacks,
                        _options,
                        {
                            nav: true
                        }
                    ));
                }
                _enabled = true;
            } else {
                if (_enabled) {
                    $_this.trigger('destroy.owl.carousel').removeClass('owl-carousel');
                }
                if ($_prev && $_next) {
                    $_prev.hide();
                    $_next.hide();
                }
                _enabled = false;
            }
        }
        if ($_prev && $_next) {
            $_prev.click(() => {
                if (_enabled) {
                    $_this.trigger('prev.owl.carousel');
                }
            });
            $_next.click(() => {
                if (_enabled) {
                    $_this.trigger('next.owl.carousel');
                }
            });
        }
        _update();
        if (_updateOnResize) {
            app.on('changeScale', _update);
        }
    });
}