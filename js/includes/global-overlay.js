let GlobalOverlay = (function($) {
    let $this;

    return {
        enableClickClose() {
            $this.on('click', function() {
                GlobalOverlay.close();
            });
        },
        disableClickClose() {
            $this.unbind('click');
        },
        open() {
            $(document).trigger('GlobalOverlay.beforeOpen');
            $this.velocity('fadeIn');
            $(document).trigger('GlobalOverlay.open');
        },
        close() {
            $(document).trigger('GlobalOverlay.beforeClose');
            $this.velocity('fadeOut');
            $(document).trigger('GlobalOverlay.close');
        },
        init() {
            $this = $('.global-overlay');
            if (!$this.length) {
                return false;
            }

            this.enableClickClose();

            $(document).trigger('GlobalOverlay.init');
        }
    }
})(jQuery);

app.on('init', GlobalOverlay.init.bind(GlobalOverlay));