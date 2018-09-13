app.on('init', () => {
    $('table').each((i, el) => {
        let $this = $(el);
        $this.wrap('<div class="table"></div>');
        $this.tableHover({
            colClass: 'table__active',
            rowClass: 'table__active',
            cellClass : 'table__hover'
        });
        $this.find('th').hover(ev => {
            ev.stopImmediatePropagation();
        });
    });
});