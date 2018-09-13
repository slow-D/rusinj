(function($) {
    function init($body) {
        $body.find('.upload-field').each((i, el) => {
            let $this = $(el);
            let $input = $this.find('input[type="file"]');
            let $link = $this.find('a');
            $input.hide();
            $this.siblings('.modal__input-title').hide();
            $link.click(ev => {
                ev.preventDefault();
                $input.click();
            });
            $input.change(ev => {
                let $row = $this.closest('.modal__row');
                let $error = $row.find('.modal__error');
                if (ev.currentTarget.files[0].size <= $input.data('max-size')) {
                    $link.html(ev.currentTarget.files[0].name);
                    $input.data('files', ev.currentTarget.files);
                    $error.remove();
                } else {
                    if (!$error.length) {
                        $error = $('<div class="modal__error"></div>');
                        $row.append($error);
                    }
                    $error.html('Превышен допустимый размер файла');
                }
            });
        });
    }
    modal.on('beforeOpen', $modal => {
        init($modal);
    });
    app.on('ajaxFormSubmit', $form => {
        init($form);
    });
})(jQuery);