let modal = (function($) {
    let $container, $content;
    return $.extend({
        opened: false,
        open(content) {
            $content = $(content);
            this.emit('beforeOpen', $content);
            $container.html($content);
            app.scrollLock();
            $container.velocity('fadeIn');
            this.emit('open', $content);
            this.opened = true;
        },
        close() {
            if (this.opened) {
                $container.velocity('fadeOut', {
                    complete() {
                        $container.empty();
                        this.opened = false;
                        app.scrollUnlock();
                    }
                });
            }
        },
        init() {
            $container = $('<div class="overlay overlay_modal" data-id="replace-on-submit"></div>');
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
        }
    }, new Events())
})(jQuery);

app.on('init', () => {
    modal.init();
    $('body').on('click', 'a[data-ajax]', e => {
        e.preventDefault();
        let $this = $(e.currentTarget);
        loader.show();
        $.ajax({
            type: $this.attr('method'),
            dataType: 'html',
            url: $this.attr('href'),
            data: $this.data('post') ? executeFunctionByName($this.data('post'), window) : {},
            success: resp => {
                modal.open(resp);
            },
            complete() {
                loader.hide();
            }
        });
    });
});