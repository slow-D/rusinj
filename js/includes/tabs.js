function Tabs($switchers, $contents, activeClass) {
    Events.call(this);
    let $activeTab;

    if (!$switchers.filter('.'+activeClass).length) {
        $switchers.eq(0).addClass(activeClass);
    }
    this.toggle = function(tab) {
        $switchers.each((i, el) => {
            $(el).removeClass(activeClass);
        });
        let $switcher = $switchers.filter('[href="' + tab + '"]');
        $switcher.addClass(activeClass);
        let $content = $contents.filter('[data-id="' + tab + '"]');
        $activeTab = $content;
        $contents.hide();
        $content.show();
        this.emit('afterToggle', $content.data('id'));
    };
    this.toggle($switchers.filter('.'+activeClass).attr('href'));
    this.getActiveTab = function() {
        return $activeTab;
    };
    this.getActive = function() {
        return $activeTab.data('id');
    };
    this.refresh = function() {
        this.toggle(this.getActive());
    };
    $switchers.click(ev => {
        ev.preventDefault();
        this.toggle($(ev.currentTarget).attr('href'));
    });
}