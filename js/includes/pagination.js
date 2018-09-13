function Pagination($this) {
    let locked = false;
    function onChange(pageNumber) {
        let uri = new URI();
        uri.setQuery('page', pageNumber);
        //history.pushState({}, null, uri.href());
        location.href = uri.href();
        return Promise.resolve();
    }
    let onMore = onChange;
    let max = parseInt($this.find('[data-id="max"]').text());
    let $input = $this.find('.pagination__input');
    $input.data('min', 1).data('max', max);
    let input = new Spinner($input);
    function checkLimits(current) {
        if (current >= max) {
            if ($more.length) {
                $more.hide();
            }
            $next.addClass('pagination__arrow_disabled');
            current = max;
        } else {
            if ($more.length) {
                $more.show();
            }
            $next.removeClass('pagination__arrow_disabled');
        }
        if (current <= 1) {
            $prev.addClass('pagination__arrow_disabled');
            current = 1;
        } else {
            $prev.removeClass('pagination__arrow_disabled');
        }
        return current;
    }
    input.on('change', val => {
        if (locked) return;
        locked = true;
        currentValue = val;
        onChange(val).then(() => {
            if (currentValue >= max) {
                if ($more.length) {
                    $more.hide();
                }
                $next.addClass('pagination__arrow_disabled');
            } else {
                if ($more.length) {
                    $more.show();
                }
                $next.removeClass('pagination__arrow_disabled');
            }
            if (currentValue <= 1) {
                $prev.addClass('pagination__arrow_disabled');
            } else {
                $prev.removeClass('pagination__arrow_disabled');
            }
            locked = false;
        });
    });
    let currentValue = input.getValue();
    let $more = $this.find('.pagination__more');
    let $prev = $this.find('.pagination__arrow_prev');
    let $next = $this.find('.pagination__arrow_next');
    checkLimits(currentValue);
    if ($more.length) {
        $more.click(ev => {
            ev.preventDefault();
            if (locked) return;
            locked = true;
            onMore(++currentValue).then(() => {
                input.setValue(currentValue);
                checkLimits(currentValue);
                locked = false;
            });
        });
    }
    $prev.click(() => {
        if (currentValue > 1 && !locked) {
            locked = true;
            input.setValue(--currentValue);
            onChange(currentValue).then(() => {
                checkLimits(currentValue);
                locked = false;
            });
        }
    });
    $next.click(() => {
        if (currentValue < max && !locked) {
            locked = true;
            input.setValue(++currentValue);
            onChange(currentValue).then(() => {
                checkLimits(currentValue)
                locked = false;
            });
        }
    });
    this.setOnChange = function(cb) {
        if (cb && typeof cb === 'function') {
            onChange = cb;
        }
    };
    this.setOnMore = function(cb) {
        if (cb && typeof cb === 'function') {
            onMore = cb;
        }
    };
    this.setCurrent = function(pageNumber) {
        currentValue = checkLimits(parseInt(pageNumber));
        input.setValue(currentValue);
    };
    this.getCurrent = function() {
        return currentValue;
    }
}
app.on('init', () => {
    $('.pagination').each((i, el) => {
        $(el).data('pagination-inst', new Pagination($(el)));
    });
});