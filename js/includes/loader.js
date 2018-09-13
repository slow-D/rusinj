let loader = (function($) {
    let $_this;
    let _promise = new Promise(resolve => {resolve()});
    let _token = 0;
    let timer;

    return {
        init() {
            $_this = $('#loading');
            $_this = $('<div class="loading" id="loading"></div>');
            $('body').append($_this);
            this.hide();
        },
        showWhile(promise) {
            let i = ++_token;
            this.show();
            _promise = Promise.all([promise, _promise]).then(() => {
                this.hide(i);
            })
        },
        show: function() {
            clearTimeout(timer);
            timer = setTimeout(() => {
                $_this.show();
            }, 1000);
        },
        hide: function(token = _token) {
            if (token === _token) {
                clearTimeout(timer);
                $_this.hide();
            }
        },
    }
})(jQuery);

app.on('init', loader.init.bind(loader));