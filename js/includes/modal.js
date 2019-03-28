let modal = (function($) {
    let $container, $content, $innerContainer;
    let modifier;

    return $.extend({
        opened: false,
        setModifier(localModifier) {
            modifier = localModifier;
        },
        open(content, title = '') {
            $content = $(content);
            if (modifier) {
                $container.find('.modal').addClass(modifier);
            }
            this.emit('beforeOpen', $content);
            $innerContainer.html($content);
            app.scrollLock();
            $container.stop(true, false).fadeIn(300);
            this.emit('open', $content);
            this.opened = true;
        },
        close() {
            if (this.opened) {
                $container.stop(true, false).fadeOut(300, () => {
                    $innerContainer.empty();
                    this.opened = false;
                    if (modifier) {
                        $container.find('.modal').removeClass(modifier);
                        modifier = '';
                    }
                    app.scrollUnlock();
                });
            }
        },
        init() {
            $container = $('<div class="overlay overlay_modal">' +
                '<div class="modal">' +
                '<div class="modal__close"></div>' +
                '<div class="modal__container" data-id="replace-on-submit"></div>' +
                '</div>' +
                '</div>');
            $innerContainer = $container.find('.modal__container');

            $('body').append($container);
            $('body').on('click', '.modal', ev => {
                ev.stopImmediatePropagation();
            });
            $('body').on('click', '.overlay_modal', () => {
                if (this.opened) {
                    this.close();
                }
            });
            $('body').on('click', '.modal__close', () => {
                this.close();
            });
            $('body').keydown((e) => {
                if (e.keyCode === 27) {
                    this.close();
                }
            });
        }
    }, new Events());
})(jQuery);

app.on('init', () => {
    modal.init();

    $('body').on('click', 'a[data-ajax]', e => {
        e.preventDefault();
        let $this = $(e.currentTarget);
        modal.setModifier($this.data('modal-modifier'));
        loader.show();
        $.ajax({
            type: $this.attr('method'),
            dataType: 'html',
            url: $this.attr('href'),
            data: $this.data('post') ? $this.data('post') : {},
            success: resp => {
                modal.open(resp);
            },
            complete() {
                loader.hide();
            }
        });
    });

    $('body').on('click', '[data-modal-inline]', function(e) {
        e.preventDefault();
        let $content = $($(this).data('modal-inline'));
        if (!$content.length) {
            return false;
        }
        modal.setModifier($(this).data('modal-modifier'));
        modal.open($content[0].outerHTML, $(this).data('title'));
    });
});