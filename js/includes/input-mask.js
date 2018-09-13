let InputMask = (function($) {
    return {
        init() {
            $('input[data-mask]').each(function() {
                let maskInstance;
                let pattern = $(this).data('mask');
                if (typeof this[pattern] == 'function') {
                    maskInstance = new IMask(this, this[pattern]);
                } else {
                    maskInstance = new IMask(this, {
                        mask: pattern
                    });
                }
                $(this).data('mask-instance', maskInstance);
            });
        }
    }
})(jQuery);

app.on('init', InputMask.init.bind(InputMask));