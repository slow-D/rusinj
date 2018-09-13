app.on('init', () => {
    let _scroll = scrollTop();
    let _locked = false;
    $(window).scroll(() => {
        let newScroll = scrollTop();
        if (!_locked && Math.abs(newScroll - _scroll) >= 5) {
            app.emit('scroll', {
                top: newScroll,
                delta: newScroll - _scroll
            });
            _scroll = newScroll;
        }
    });
    app.on('scrollLock', () => {
        _locked = true;
    });
    app.on('scrollUnlock', () => {
        _locked = false;
    });
});