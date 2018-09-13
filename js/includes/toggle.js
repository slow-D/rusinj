function Toggle($title, $content) {
    Events.call(this);
    let _this = this;
    let opened = false;
    $content.hide();
    function open() {
        _this.emit('opening', $content);
        $content.addClass('no-touch');
        $title.addClass('opened');
        $content.velocity('slideDown', {
            duration: 400,
            complete() {
                opened = true;
                $content.removeClass('no-touch');
                _this.emit('open', $content);
            }
        });
    }
    function close() {
        if (opened) {
            _this.emit('closing', $title);
            $content.velocity('slideUp', {
                duration: 400,
                complete() {
                    opened = false;
                    $content.hide();
                    $title.removeClass('opened');
                    _this.emit('close', $title);
                }
            });
        }
    }
    $title.clicktouch(() => {
        if (!opened) {
            open();
        } else {
            close();
        }
    });
    this.close = close;
    this.open = open;
}

function initToggles($body) {
    $body.find('[data-id="toggle"]').each((i, el) => {
        console.log(el);
        let $content = $(el);
        let id = $content.data('name');
        let $el = $body.find(`[data-toggle="${id}"]`);
        if ($content.length && $el.length) {
            let toggle = new Toggle($el, $content);
            $content.data('toggle-inst', toggle);
            $el.data('toggle-inst', toggle);
        }
    });
}

app.on('init', () => {
    initToggles($('body'));
    $('body').on('touchstart submit', '.no-touch', ev => {
        ev.stopImmediatePropagation();
        ev.preventDefault();
    });
});