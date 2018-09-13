function Nav(_itemClass, _url, _iconHtml) {
    let _config = {};
    let _topLevelIDList;
    let self = this;

    function _prepare(source, level = 0, parent = null) {
        return source.map((el, i) => {
            _config[el.id] = $.extend({}, el);
            _config[el.id].level = level;
            if (parent) {
                _config[el.id].parents = [parent.id];
                if (parent.parents && $.isArray(parent.parents)) {
                    _config[el.id].parents = _config[el.id].parents.concat(parent.parents);
                }
            }
            if (el.children && $.isArray(el.children) && el.children.length) {
                _config[el.id]['children'] = _prepare(el.children, level+1, _config[el.id]);
            } else {
                delete _config[el.id]['children'];
            }
            return el.id;
        });
    }

    function _buildJQuery(el) {
        let $item = $(`<li class="${_itemClass} ${_itemClass}_${el.id}" data-id="${el.id}" data-level="${el.level}"></li>`);
        if (el.span) {
            $item.html(`<span class="link" onclick><span>${el.title}</span></span>`);
        } else {
            $item.html(`<a class="link" href="${el.link}"><span>${el.title}</span></a>`);
        }
        if (el.mod) {
            $item.addClass(_itemClass+'_'+el.mod);
        }
        if (el.active) {
            $item.addClass(_itemClass+'_active');
        }
        if (el.children) {
            $item.addClass(_itemClass+'_parent');
            $item.find('.link').append(self.iconHtml);
        }
        return $item;
    }

    this.url = _url;
    this.iconHtml = _iconHtml;
    this.getList = function(id) {
        let IDlist;
        if (id) {
            let parent = _config[id];
            IDlist = parent.children;
        } else {
            IDlist = _topLevelIDList;
        }
        if (!IDlist) return false;
        let $list = $([]);
        IDlist.forEach(idx => {
            $list = $list.add(_buildJQuery(_config[idx]));
        });
        return $list;
    };

    this.getParents = function(id) {
        if (!id) return [];
        let item = _config[id];
        let parents = [];
        if (item && item.parents) {
            parents = item.parents.slice(0);
        }
        parents.reverse();
        return parents;
    };

    this.hasChildren = function(id) {
        if (!id) return false;
        let item = _config[id];
        return item && item.children && item.children.length;
    };

    this.getCurrentParents = function() {
        let result = [];
        $.each(_config, (i, el) => {
            if (el.current) {
                result = this.getParents(el.id);
            }
        });
        return result;
    };

    this.load = function(showLoading = true) {
        if (typeof _topLevelIDList !== 'undefined') {
            return Promise.resolve();
        } else {
            if (showLoading) loader.show();
            return navLoader.load(this.url).then(_treeConfig => {
                _topLevelIDList = _prepare(_treeConfig);
                if (showLoading) loader.hide();
            }, () => {
                if (showLoading) loader.hide();
            });
        }
    };

    this.debug = function() {
        console.log(_config);
    };
}

let navLoader = (function($) {
    let _loaded;
    let _loading;
    return {
        load(url) {
            if (typeof _loading === 'undefined') {
                _loading = new Promise((resolve, reject) => {
                    if (typeof _loaded !== 'undefined') {
                        resolve(_loaded);
                    } else {
                        if (!url) {
                            url = 'nav.json';
                        }
                        let uri = new URI(url);
                        if (parseInt(window.currentPageID)) {
                            uri.setQuery('pageID', parseInt(window.currentPageID));
                        }
                        $.ajax(uri.toString(), {
                            dataType: 'json',
                            success(resp) {
                                _loaded = resp;
                                resolve(_loaded);
                            },
                            error: reject
                        })
                    }
                });
            }
            return _loading;
        }
    };
})(jQuery);