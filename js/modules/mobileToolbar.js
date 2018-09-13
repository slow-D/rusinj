var mobileToolbar = (function($) {
    let $this, $burger, $search, $parea, $cart, delta = 0;;
    return {
        show() {
            if (!$this.data('is-visible')) {
                $this.data('is-visible', true);
                $this.stop(true, false).fadeIn(250);
            }
        },
        hide() {
            if ($this.data('is-visible')) {
                $this.data('is-visible', false);
                $this.stop(true, false).fadeOut(250);
            }
        },
        autoShow() {
            let result = false;
            if ($(window).scrollTop() < $(window).height()) {
                mobileToolbar.show();
                result = true;
            }
            return result;
        },
        init() {
            $this = $('#mobile-toolbar');

            $this.data('is-visible', true);
            if (!mobileToolbar.autoShow()) {
                mobileToolbar.hide();
            }

            app.on('scroll', function(data) {
                if (!isInScales(['xs'])) {
                    return;
                }

                if (mobileToolbar.autoShow()) {
                    return true;
                }
                if (data.delta <= 0) {
                    delta += Math.abs(data.delta);
                    if (delta > 200) {
                        mobileToolbar.show();
                    }
                } else {
                    delta = 0;
                    mobileToolbar.hide();
                }
            });

            app.on('changeScale', function() {
                $this.removeAttr('style');
            });

            $('body').on('click', '.mobile-toolbar__link:not(.active)', function() {
                 $('.mobile-toolbar__link.active').trigger('click');
            });

            $(document).on('mobileNav.opened', function() {
                $('.mobile-toolbar__link-nav').addClass('active');
            });
            $(document).on('mobileNav.closed', function() {
                $('.mobile-toolbar__link-nav').removeClass('active');
            });

            let searchPopover = $('[data-popover="search-popover-1"]').data('popover-inst');
            if (searchPopover) {
                searchPopover.on('open', function() {
                    $('.mobile-toolbar__link-search').addClass('active');
                });
                searchPopover.on('close', function() {
                    $('.mobile-toolbar__link-search').removeClass('active');
                });
            }

            let contactsPopover = $('[data-popover="contacts-popover-2"]').data('popover-inst');
            if (contactsPopover) {
                contactsPopover.on('open', function() {
                    $('.mobile-toolbar__link-contacts').addClass('active');
                });
                contactsPopover.on('close', function() {
                    $('.mobile-toolbar__link-contacts').removeClass('active');
                });
            }

            $(document).on('ViewedList.open', function() {
                $('.mobile-toolbar__link-viewed').addClass('active');
            });
            $(document).on('ViewedList.close', function() {
                $('.mobile-toolbar__link-viewed').removeClass('active');
            });
        }
    }
})(jQuery);

app.on('init', mobileToolbar.init.bind(mobileToolbar), 102);