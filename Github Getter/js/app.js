(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Input = require('./Input');

var _Input2 = _interopRequireDefault(_Input);

var _Spinner = require('./Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _Modal = require('./Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _List = require('./List');

var _List2 = _interopRequireDefault(_List);

var _GithubRepoListItem = require('./GithubRepoListItem');

var _GithubRepoListItem2 = _interopRequireDefault(_GithubRepoListItem);

var _Cache = require('./Cache');

var _Cache2 = _interopRequireDefault(_Cache);

var _GithubQuery = require('./GithubQuery');

var _GithubQuery2 = _interopRequireDefault(_GithubQuery);

var App = (function () {
  function App() {
    _classCallCheck(this, App);
  }

  _createClass(App, [{
    key: 'start',
    value: function start(rootElement) {
      this.$root = $(rootElement);

      this.spinner = new _Spinner2['default'](this.$root.find('#spinner'));
      this.input = new _Input2['default'](this.$root.find('#search'), this.search.bind(this, 1));
      this.results = new _List2['default'](this.$root.find('#results-container'), _GithubRepoListItem2['default']);
      this.cache = new _Cache2['default'](50);

      this.$next = this.$root.find('#next');
      this.$prev = this.$root.find('#previous');
      this.$next.on('click', this.getNext.bind(this));
      this.$prev.on('click', this.getPrev.bind(this));

      this.currentQuery = undefined;
      this.currentPage = 1;
    }
  }, {
    key: 'getNext',
    value: function getNext() {
      // so we can't spam the button while it's loading...
      this.$next.add(this.$prev).attr('disabled', true);
      this.search(++this.currentPage, this.currentQuery);
    }
  }, {
    key: 'getPrev',
    value: function getPrev() {
      this.$next.add(this.$prev).attr('disabled', true);
      this.search(--this.currentPage, this.currentQuery);
    }
  }, {
    key: 'search',
    value: function search(page, keyword) {
      var _this = this;

      // start our spinner
      this.spinner.spin();

      // update our state
      this.currentQuery = keyword;
      this.currentPage = page;

      // check our cache
      var ghQuery = this.cache.get(keyword);

      // make new query if we don't have it cached
      if (!ghQuery) {
        ghQuery = new _GithubQuery2['default'](keyword);
        this.cache.push(keyword, ghQuery);
      }

      // get page for query
      ghQuery.getPage(page).then(function (list) {
        // update views
        _this.results.set(list);
        _this.results.update();

        if (page < ghQuery.total_pages) {
          _this.hasNext = true;
        } else {
          _this.hasNext = false;
        }

        if (page > 1) {
          _this.hasPrev = true;
        } else {
          _this.hasPrev = false;
        }

        _this.spinner.stop();
      })['catch'](function (error) {
        console.log(error);
        // give error in modal
        _this.$root.append(new _Modal2['default'](error).$el);

        _this.spinner.stop();
      }).then(function () {
        scrollTo(0, 0);
      });
    }
  }, {
    key: 'hasPrev',
    set: function set(value) {
      this.$prev.attr('disabled', !value);
    }
  }, {
    key: 'hasNext',
    set: function set(value) {
      this.$next.attr('disabled', !value);
    }
  }]);

  return App;
})();

exports.App = App;
exports['default'] = new App();

},{"./Cache":2,"./GithubQuery":3,"./GithubRepoListItem":4,"./Input":5,"./List":6,"./Modal":7,"./Spinner":8}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cache = (function () {
  function Cache(max_length) {
    _classCallCheck(this, Cache);

    this.dict = {};

    this.front = null;
    this.end = null;

    this.length = 0;
    this.max_length = max_length;
  }

  _createClass(Cache, [{
    key: "get",
    value: function get(key) {
      var val = this.dict[key];
      if (val) {
        return val.value;
      }
      return undefined;
    }
  }, {
    key: "push",
    value: function push(key, value) {
      var item = new CacheItem(key, value);
      this.dict[key] = item;
      if (this.front) {
        this.front.next = item;
      }
      this.front = item;
      this.length++;

      if (this.length > this.max_length) {
        delete this.dict[this.end.key];
        this.end = this.end.next;
        this.length--;
      }
    }
  }]);

  return Cache;
})();

exports["default"] = Cache;

var CacheItem = function CacheItem(key, value) {
  _classCallCheck(this, CacheItem);

  this.key = key;
  this.value = value;
  this.next = null;
};

module.exports = exports["default"];

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GithubQuery = (function () {
  _createClass(GithubQuery, null, [{
    key: "PAGE_SIZE",
    value: 100,
    enumerable: true
  }]);

  function GithubQuery(keyword) {
    _classCallCheck(this, GithubQuery);

    this.keyword = keyword;
    this.total_pages = undefined;
    this.pages = [];
  }

  _createClass(GithubQuery, [{
    key: "getPage",
    value: function getPage(page_num) {
      var _this = this;

      // reject if we're out of range
      if (this.total_pages && page_num > this.total_pages) {
        return Promise.reject(new RangeError("No page " + page_num + " for query " + this.keyword));
      }

      // return our cached page
      var page = undefined;
      if (page = this.pages[page_num - 1]) {
        return Promise.resolve(page);
      }

      // query page
      return new Promise(function (resolve, reject) {
        // $.getJSON(`https://api.github.com/legacy/repos/search/${query}`)
        $.getJSON("https://api.github.com/search/repositories?per_page=" + GithubQuery.PAGE_SIZE + "&page=" + page_num + "&q=" + _this.keyword).fail(function (error) {
          console.log("failed to get " + _this.keyword + ":" + page_num);
          reject(error);
        }).done(function (data) {
          console.log("got " + _this.keyword + ":" + page_num, data);

          // save our data
          // queries have a maximum of 1000 search results
          _this.total_pages = Math.min(1000 / GithubQuery.PAGE_SIZE, Math.floor(data.total_count / GithubQuery.PAGE_SIZE));
          _this.pages[page_num - 1] = data.items;

          resolve(data.items);
        });
      });
    }
  }]);

  return GithubQuery;
})();

exports["default"] = GithubQuery;
module.exports = exports["default"];

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var GithubRepoListItem = (function () {
  _createClass(GithubRepoListItem, null, [{
    key: 'template',

    // static template = _.template($('#template-GithubRepoListItem').html());
    value: undefined,
    enumerable: true
  }]);

  function GithubRepoListItem(data) {
    _classCallCheck(this, GithubRepoListItem);

    // get rid of (potential) html in the description
    data.description = _.escape(data.description);
    // some repos don't have a language apparently
    data.language = data.language || 'Unknown';
    // reference our data
    this.data = data;

    // construct view
    this.$el = $(GithubRepoListItem.template(data));
    // bind handler
    this.$el.on('click', '.title', this.click.bind(this));
  }

  // because the html that contains our template isn't fully loaded yet (since this script is in the head)
  // wait and get the template when it's available
  // in a real application, this would either be inline (polymer or react)
  // or fetched for us (angular, etc)
  // alternatively, this script could be placed at the end of the html <body>, or we could paste the template inline as a string here

  _createClass(GithubRepoListItem, [{
    key: 'click',
    value: function click() {
      this.$el.toggleClass('minimized');
    }
  }]);

  return GithubRepoListItem;
})();

exports['default'] = GithubRepoListItem;
$(document).on('ready', function () {
  GithubRepoListItem.template = _.template($('#template-GithubRepoListItem').html());
});
module.exports = exports['default'];

},{}],5:[function(require,module,exports){

// our custom Input 'component' to wrap our input element management with
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Input = (function () {
  function Input($element, handler) {
    _classCallCheck(this, Input);

    this.$root = $element;

    this.$text = this.$root.find('input[type="text"]');
    this.$button = this.$root.find('button');

    if (handler !== undefined) {
      this.bind(handler);
    }
  }

  _createClass(Input, [{
    key: '_getVal',
    value: function _getVal() {
      return this.$text.val();
    }

    // bind a handler for this input component
    // chose not to use forms for this for some reason
  }, {
    key: 'bind',
    value: function bind(handler) {
      var _this = this;

      this.$text.on('keypress', function (event) {
        var val = _this._getVal();
        if (event.keyCode === 13 && val.length) {
          handler(val);
        }
      });
      this.$button.on('click', function (event) {
        var val = _this._getVal();
        if (val.length) {
          handler(val);
        }
      });
    }
  }, {
    key: 'unbind',
    value: function unbind() {
      this.$text.off();
      this.$button.off();
    }
  }, {
    key: 'remove',
    value: function remove() {
      this.unbind();
      this.$root.remove();
    }
  }]);

  return Input;
})();

exports['default'] = Input;
module.exports = exports['default'];

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var List = (function () {
  function List($element, itemView) {
    _classCallCheck(this, List);

    this.$root = $element;

    this.items = [];
    this.itemView = itemView;

    this.update();
  }

  _createClass(List, [{
    key: 'set',
    value: function set(newItems) {
      var _this = this;

      this.items = newItems.map(function (item) {
        return new _this.itemView(item);
      });
    }
  }, {
    key: 'update',
    value: function update() {
      this.$root.children().remove();

      if (!this.items.length) {
        return this.$root.append('<div class="list-item">Nothing yet!</div>');
      }

      this.$root.append(this.items.map(function (item) {
        return item.$el;
      }));
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.items.length = 0;
      this.update();
    }
  }]);

  return List;
})();

exports['default'] = List;
module.exports = exports['default'];

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Modal = (function () {
  _createClass(Modal, null, [{
    key: 'template',
    value: undefined,
    enumerable: true
  }]);

  function Modal(data) {
    _classCallCheck(this, Modal);

    this.data = data;
    this.$el = $(Modal.template({
      message: data.message ? data.message : data.responseJSON ? data.responseJSON.message : 'Unknown error'
    }));

    this.$el.on('click', this.click.bind(this));
  }

  // same hack explained in GithubRepoListItem.js

  _createClass(Modal, [{
    key: 'click',
    value: function click() {
      this.$el.remove();
    }
  }]);

  return Modal;
})();

exports['default'] = Modal;
$(document).on('ready', function () {
  Modal.template = _.template($('#template-Modal').html());
});
module.exports = exports['default'];

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Spinner = (function () {
  function Spinner($element) {
    _classCallCheck(this, Spinner);

    this.$root = $element;
  }

  _createClass(Spinner, [{
    key: 'spin',
    value: function spin() {
      this.$root.addClass('spin');
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.$root.removeClass('spin');
    }
  }]);

  return Spinner;
})();

exports['default'] = Spinner;
module.exports = exports['default'];

},{}],9:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppJs = require('./App.js');

var _AppJs2 = _interopRequireDefault(_AppJs);

window.App = _AppJs2['default'];

$(document).ready(function () {
  console.dir(_AppJs2['default']);
  _AppJs2['default'].start(document.body);
});

},{"./App.js":1}]},{},[9])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy90L3JlcG9zaXRvcmllcy9mcm9udGVuZC1kZXYtZXhlcmNpc2VzL0dpdGh1YiBHZXR0ZXIvanMvQXBwL0FwcC5qcyIsIkM6L1VzZXJzL3QvcmVwb3NpdG9yaWVzL2Zyb250ZW5kLWRldi1leGVyY2lzZXMvR2l0aHViIEdldHRlci9qcy9BcHAvQ2FjaGUuanMiLCJDOi9Vc2Vycy90L3JlcG9zaXRvcmllcy9mcm9udGVuZC1kZXYtZXhlcmNpc2VzL0dpdGh1YiBHZXR0ZXIvanMvQXBwL0dpdGh1YlF1ZXJ5LmpzIiwiQzovVXNlcnMvdC9yZXBvc2l0b3JpZXMvZnJvbnRlbmQtZGV2LWV4ZXJjaXNlcy9HaXRodWIgR2V0dGVyL2pzL0FwcC9HaXRodWJSZXBvTGlzdEl0ZW0uanMiLCJDOi9Vc2Vycy90L3JlcG9zaXRvcmllcy9mcm9udGVuZC1kZXYtZXhlcmNpc2VzL0dpdGh1YiBHZXR0ZXIvanMvQXBwL0lucHV0LmpzIiwiQzovVXNlcnMvdC9yZXBvc2l0b3JpZXMvZnJvbnRlbmQtZGV2LWV4ZXJjaXNlcy9HaXRodWIgR2V0dGVyL2pzL0FwcC9MaXN0LmpzIiwiQzovVXNlcnMvdC9yZXBvc2l0b3JpZXMvZnJvbnRlbmQtZGV2LWV4ZXJjaXNlcy9HaXRodWIgR2V0dGVyL2pzL0FwcC9Nb2RhbC5qcyIsIkM6L1VzZXJzL3QvcmVwb3NpdG9yaWVzL2Zyb250ZW5kLWRldi1leGVyY2lzZXMvR2l0aHViIEdldHRlci9qcy9BcHAvU3Bpbm5lci5qcyIsIkM6L1VzZXJzL3QvcmVwb3NpdG9yaWVzL2Zyb250ZW5kLWRldi1leGVyY2lzZXMvR2l0aHViIEdldHRlci9qcy9BcHAvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7cUJDQWtCLFNBQVM7Ozs7dUJBQ1AsV0FBVzs7OztxQkFFYixTQUFTOzs7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USxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFNO0FBQzVCLE9BQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0NBQzFELENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7SUNyQmtCLE9BQU87QUFDZixXQURRLE9BQU8sQ0FDZCxRQUFRLEVBQUU7MEJBREgsT0FBTzs7QUFFeEIsUUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7R0FDdkI7O2VBSGtCLE9BQU87O1dBSXRCLGdCQUFHO0FBQ0wsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDN0I7OztXQUNHLGdCQUFHO0FBQ0wsVUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDaEM7OztTQVRrQixPQUFPOzs7cUJBQVAsT0FBTzs7Ozs7Ozs7cUJDRFosVUFBVTs7OztBQUUxQixNQUFNLENBQUMsR0FBRyxxQkFBTSxDQUFDOztBQUVqQixDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQU07QUFDdEIsU0FBTyxDQUFDLEdBQUcsb0JBQUssQ0FBQztBQUNqQixxQkFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzFCLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgSW5wdXQgZnJvbSAnLi9JbnB1dCc7XHJcbmltcG9ydCBTcGlubmVyIGZyb20gJy4vU3Bpbm5lcic7XHJcblxyXG5pbXBvcnQgTW9kYWwgZnJvbSAnLi9Nb2RhbCc7XHJcbmltcG9ydCBMaXN0IGZyb20gJy4vTGlzdCc7XHJcbmltcG9ydCBHaXRodWJSZXBvTGlzdEl0ZW0gZnJvbSAnLi9HaXRodWJSZXBvTGlzdEl0ZW0nO1xyXG5cclxuaW1wb3J0IENhY2hlIGZyb20gJy4vQ2FjaGUnO1xyXG5pbXBvcnQgR2l0aHViUXVlcnkgZnJvbSAnLi9HaXRodWJRdWVyeSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQXBwIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICBzdGFydChyb290RWxlbWVudCkge1xyXG4gICAgdGhpcy4kcm9vdCA9ICQocm9vdEVsZW1lbnQpO1xyXG5cclxuICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKHRoaXMuJHJvb3QuZmluZCgnI3NwaW5uZXInKSk7XHJcbiAgICB0aGlzLmlucHV0ID0gbmV3IElucHV0KHRoaXMuJHJvb3QuZmluZCgnI3NlYXJjaCcpLCB0aGlzLnNlYXJjaC5iaW5kKHRoaXMsIDEpKTtcclxuICAgIHRoaXMucmVzdWx0cyA9IG5ldyBMaXN0KHRoaXMuJHJvb3QuZmluZCgnI3Jlc3VsdHMtY29udGFpbmVyJyksIEdpdGh1YlJlcG9MaXN0SXRlbSk7XHJcbiAgICB0aGlzLmNhY2hlID0gbmV3IENhY2hlKDUwKTtcclxuXHJcbiAgICB0aGlzLiRuZXh0ID0gdGhpcy4kcm9vdC5maW5kKCcjbmV4dCcpO1xyXG4gICAgdGhpcy4kcHJldiA9IHRoaXMuJHJvb3QuZmluZCgnI3ByZXZpb3VzJyk7XHJcbiAgICB0aGlzLiRuZXh0Lm9uKCdjbGljaycsIHRoaXMuZ2V0TmV4dC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuJHByZXYub24oJ2NsaWNrJywgdGhpcy5nZXRQcmV2LmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuY3VycmVudFF1ZXJ5ID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IDE7XHJcbiAgfVxyXG5cclxuXHJcbiAgc2V0IGhhc1ByZXYodmFsdWUpIHtcclxuICAgIHRoaXMuJHByZXYuYXR0cignZGlzYWJsZWQnLCAhdmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgc2V0IGhhc05leHQodmFsdWUpIHtcclxuICAgIHRoaXMuJG5leHQuYXR0cignZGlzYWJsZWQnLCAhdmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgZ2V0TmV4dCgpIHtcclxuICAgIC8vIHNvIHdlIGNhbid0IHNwYW0gdGhlIGJ1dHRvbiB3aGlsZSBpdCdzIGxvYWRpbmcuLi5cclxuICAgIHRoaXMuJG5leHQuYWRkKHRoaXMuJHByZXYpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XHJcbiAgICB0aGlzLnNlYXJjaCgrK3RoaXMuY3VycmVudFBhZ2UsIHRoaXMuY3VycmVudFF1ZXJ5KTtcclxuICB9XHJcbiAgZ2V0UHJldigpIHtcclxuICAgIHRoaXMuJG5leHQuYWRkKHRoaXMuJHByZXYpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XHJcbiAgICB0aGlzLnNlYXJjaCgtLXRoaXMuY3VycmVudFBhZ2UsIHRoaXMuY3VycmVudFF1ZXJ5KTtcclxuICB9XHJcblxyXG4gIHNlYXJjaChwYWdlLCBrZXl3b3JkKSB7XHJcbiAgICAvLyBzdGFydCBvdXIgc3Bpbm5lclxyXG4gICAgdGhpcy5zcGlubmVyLnNwaW4oKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgb3VyIHN0YXRlXHJcbiAgICB0aGlzLmN1cnJlbnRRdWVyeSA9IGtleXdvcmQ7XHJcbiAgICB0aGlzLmN1cnJlbnRQYWdlID0gcGFnZTtcclxuXHJcbiAgICAvLyBjaGVjayBvdXIgY2FjaGVcclxuICAgIGxldCBnaFF1ZXJ5ID0gdGhpcy5jYWNoZS5nZXQoa2V5d29yZCk7XHJcblxyXG4gICAgLy8gbWFrZSBuZXcgcXVlcnkgaWYgd2UgZG9uJ3QgaGF2ZSBpdCBjYWNoZWRcclxuICAgIGlmICghZ2hRdWVyeSkge1xyXG4gICAgICBnaFF1ZXJ5ID0gbmV3IEdpdGh1YlF1ZXJ5KGtleXdvcmQpO1xyXG4gICAgICB0aGlzLmNhY2hlLnB1c2goa2V5d29yZCwgZ2hRdWVyeSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIGdldCBwYWdlIGZvciBxdWVyeVxyXG4gICAgZ2hRdWVyeS5nZXRQYWdlKHBhZ2UpXHJcbiAgICAgIC50aGVuKChsaXN0KSA9PiB7XHJcbiAgICAgICAgLy8gdXBkYXRlIHZpZXdzXHJcbiAgICAgICAgdGhpcy5yZXN1bHRzLnNldChsaXN0KTtcclxuICAgICAgICB0aGlzLnJlc3VsdHMudXBkYXRlKCk7XHJcblxyXG4gICAgICAgIGlmIChwYWdlIDwgZ2hRdWVyeS50b3RhbF9wYWdlcykge1xyXG4gICAgICAgICAgdGhpcy5oYXNOZXh0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmhhc05leHQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwYWdlID4gMSkge1xyXG4gICAgICAgICAgdGhpcy5oYXNQcmV2ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmhhc1ByZXYgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc3Bpbm5lci5zdG9wKCk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgLy8gZ2l2ZSBlcnJvciBpbiBtb2RhbFxyXG4gICAgICAgIHRoaXMuJHJvb3QuYXBwZW5kKG5ldyBNb2RhbChlcnJvcikuJGVsKTtcclxuXHJcbiAgICAgICAgdGhpcy5zcGlubmVyLnN0b3AoKTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHNjcm9sbFRvKDAsIDApO1xyXG4gICAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IG5ldyBBcHA7XHJcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIENhY2hlIHtcclxuICBjb25zdHJ1Y3RvcihtYXhfbGVuZ3RoKSB7XHJcbiAgICB0aGlzLmRpY3QgPSB7fTtcclxuXHJcbiAgICB0aGlzLmZyb250ID0gbnVsbDtcclxuICAgIHRoaXMuZW5kID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLm1heF9sZW5ndGggPSBtYXhfbGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgZ2V0KGtleSkge1xyXG4gICAgY29uc3QgdmFsID0gdGhpcy5kaWN0W2tleV07XHJcbiAgICBpZiAodmFsKSB7XHJcbiAgICAgIHJldHVybiB2YWwudmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgcHVzaChrZXksIHZhbHVlKSB7XHJcbiAgICBjb25zdCBpdGVtID0gbmV3IENhY2hlSXRlbShrZXksIHZhbHVlKTtcclxuICAgIHRoaXMuZGljdFtrZXldID0gaXRlbTtcclxuICAgIGlmICh0aGlzLmZyb250KSB7XHJcbiAgICAgIHRoaXMuZnJvbnQubmV4dCA9IGl0ZW07XHJcbiAgICB9XHJcbiAgICB0aGlzLmZyb250ID0gaXRlbTtcclxuICAgIHRoaXMubGVuZ3RoKys7XHJcblxyXG4gICAgaWYgKHRoaXMubGVuZ3RoID4gdGhpcy5tYXhfbGVuZ3RoKSB7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLmRpY3RbdGhpcy5lbmQua2V5XTtcclxuICAgICAgdGhpcy5lbmQgPSB0aGlzLmVuZC5uZXh0O1xyXG4gICAgICB0aGlzLmxlbmd0aC0tO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgQ2FjaGVJdGVtIHtcclxuICBjb25zdHJ1Y3RvcihrZXksIHZhbHVlKSB7XHJcbiAgICB0aGlzLmtleSA9IGtleTtcclxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuICAgIHRoaXMubmV4dCA9IG51bGw7XHJcbiAgfVxyXG59XHJcbiIsIlxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHaXRodWJRdWVyeSB7XHJcblxyXG4gIHN0YXRpYyBQQUdFX1NJWkUgPSAxMDA7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGtleXdvcmQpIHtcclxuICAgIHRoaXMua2V5d29yZCA9IGtleXdvcmQ7XHJcbiAgICB0aGlzLnRvdGFsX3BhZ2VzID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5wYWdlcyA9IFtdO1xyXG4gIH1cclxuXHJcbiAgZ2V0UGFnZShwYWdlX251bSkge1xyXG4gICAgLy8gcmVqZWN0IGlmIHdlJ3JlIG91dCBvZiByYW5nZVxyXG4gICAgaWYgKHRoaXMudG90YWxfcGFnZXMgJiYgcGFnZV9udW0gPiB0aGlzLnRvdGFsX3BhZ2VzKSB7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgUmFuZ2VFcnJvcihgTm8gcGFnZSAke3BhZ2VfbnVtfSBmb3IgcXVlcnkgJHt0aGlzLmtleXdvcmR9YCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJldHVybiBvdXIgY2FjaGVkIHBhZ2VcclxuICAgIGxldCBwYWdlO1xyXG4gICAgaWYgKHBhZ2UgPSB0aGlzLnBhZ2VzW3BhZ2VfbnVtIC0gMV0pIHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBxdWVyeSBwYWdlXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAvLyAkLmdldEpTT04oYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vbGVnYWN5L3JlcG9zL3NlYXJjaC8ke3F1ZXJ5fWApXHJcbiAgICAgICQuZ2V0SlNPTihgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9zZWFyY2gvcmVwb3NpdG9yaWVzP3Blcl9wYWdlPSR7R2l0aHViUXVlcnkuUEFHRV9TSVpFfSZwYWdlPSR7cGFnZV9udW19JnE9JHt0aGlzLmtleXdvcmR9YClcclxuICAgICAgICAuZmFpbCgoZXJyb3IpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGBmYWlsZWQgdG8gZ2V0ICR7dGhpcy5rZXl3b3JkfToke3BhZ2VfbnVtfWApO1xyXG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5kb25lKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZ290ICR7dGhpcy5rZXl3b3JkfToke3BhZ2VfbnVtfWAsIGRhdGEpO1xyXG5cclxuICAgICAgICAgIC8vIHNhdmUgb3VyIGRhdGFcclxuICAgICAgICAgIC8vIHF1ZXJpZXMgaGF2ZSBhIG1heGltdW0gb2YgMTAwMCBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgdGhpcy50b3RhbF9wYWdlcyA9IE1hdGgubWluKDEwMDAgLyBHaXRodWJRdWVyeS5QQUdFX1NJWkUsIE1hdGguZmxvb3IoZGF0YS50b3RhbF9jb3VudCAvIEdpdGh1YlF1ZXJ5LlBBR0VfU0laRSkpO1xyXG4gICAgICAgICAgdGhpcy5wYWdlc1twYWdlX251bSAtIDFdID0gZGF0YS5pdGVtcztcclxuXHJcbiAgICAgICAgICByZXNvbHZlKGRhdGEuaXRlbXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiIsIlxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHaXRodWJSZXBvTGlzdEl0ZW0ge1xyXG5cclxuICAvLyBzdGF0aWMgdGVtcGxhdGUgPSBfLnRlbXBsYXRlKCQoJyN0ZW1wbGF0ZS1HaXRodWJSZXBvTGlzdEl0ZW0nKS5odG1sKCkpO1xyXG4gIHN0YXRpYyB0ZW1wbGF0ZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgY29uc3RydWN0b3IoZGF0YSkge1xyXG5cclxuICAgIC8vIGdldCByaWQgb2YgKHBvdGVudGlhbCkgaHRtbCBpbiB0aGUgZGVzY3JpcHRpb25cclxuICAgIGRhdGEuZGVzY3JpcHRpb24gPSBfLmVzY2FwZShkYXRhLmRlc2NyaXB0aW9uKTtcclxuICAgIC8vIHNvbWUgcmVwb3MgZG9uJ3QgaGF2ZSBhIGxhbmd1YWdlIGFwcGFyZW50bHlcclxuICAgIGRhdGEubGFuZ3VhZ2UgPSBkYXRhLmxhbmd1YWdlIHx8ICdVbmtub3duJztcclxuICAgIC8vIHJlZmVyZW5jZSBvdXIgZGF0YVxyXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcclxuXHJcbiAgICAvLyBjb25zdHJ1Y3Qgdmlld1xyXG4gICAgdGhpcy4kZWwgPSAkKEdpdGh1YlJlcG9MaXN0SXRlbS50ZW1wbGF0ZShkYXRhKSk7XHJcbiAgICAvLyBiaW5kIGhhbmRsZXJcclxuICAgIHRoaXMuJGVsLm9uKCdjbGljaycsICcudGl0bGUnLCB0aGlzLmNsaWNrLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgY2xpY2soKSB7XHJcbiAgICB0aGlzLiRlbC50b2dnbGVDbGFzcygnbWluaW1pemVkJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBiZWNhdXNlIHRoZSBodG1sIHRoYXQgY29udGFpbnMgb3VyIHRlbXBsYXRlIGlzbid0IGZ1bGx5IGxvYWRlZCB5ZXQgKHNpbmNlIHRoaXMgc2NyaXB0IGlzIGluIHRoZSBoZWFkKVxyXG4vLyB3YWl0IGFuZCBnZXQgdGhlIHRlbXBsYXRlIHdoZW4gaXQncyBhdmFpbGFibGVcclxuLy8gaW4gYSByZWFsIGFwcGxpY2F0aW9uLCB0aGlzIHdvdWxkIGVpdGhlciBiZSBpbmxpbmUgKHBvbHltZXIgb3IgcmVhY3QpXHJcbi8vIG9yIGZldGNoZWQgZm9yIHVzIChhbmd1bGFyLCBldGMpXHJcbi8vIGFsdGVybmF0aXZlbHksIHRoaXMgc2NyaXB0IGNvdWxkIGJlIHBsYWNlZCBhdCB0aGUgZW5kIG9mIHRoZSBodG1sIDxib2R5Piwgb3Igd2UgY291bGQgcGFzdGUgdGhlIHRlbXBsYXRlIGlubGluZSBhcyBhIHN0cmluZyBoZXJlXHJcbiQoZG9jdW1lbnQpLm9uKCdyZWFkeScsICgpID0+IHtcclxuICBHaXRodWJSZXBvTGlzdEl0ZW0udGVtcGxhdGUgPSBfLnRlbXBsYXRlKCQoJyN0ZW1wbGF0ZS1HaXRodWJSZXBvTGlzdEl0ZW0nKS5odG1sKCkpO1xyXG59KTtcclxuIiwiXHJcbi8vIG91ciBjdXN0b20gSW5wdXQgJ2NvbXBvbmVudCcgdG8gd3JhcCBvdXIgaW5wdXQgZWxlbWVudCBtYW5hZ2VtZW50IHdpdGhcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5wdXQge1xyXG5cclxuICBjb25zdHJ1Y3RvcigkZWxlbWVudCwgaGFuZGxlcikge1xyXG5cclxuICAgIHRoaXMuJHJvb3QgPSAkZWxlbWVudDtcclxuXHJcbiAgICB0aGlzLiR0ZXh0ID0gdGhpcy4kcm9vdC5maW5kKCdpbnB1dFt0eXBlPVwidGV4dFwiXScpO1xyXG4gICAgdGhpcy4kYnV0dG9uID0gdGhpcy4kcm9vdC5maW5kKCdidXR0b24nKTtcclxuXHJcbiAgICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRoaXMuYmluZChoYW5kbGVyKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9nZXRWYWwoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4kdGV4dC52YWwoKTtcclxuICB9XHJcblxyXG4gIC8vIGJpbmQgYSBoYW5kbGVyIGZvciB0aGlzIGlucHV0IGNvbXBvbmVudFxyXG4gIC8vIGNob3NlIG5vdCB0byB1c2UgZm9ybXMgZm9yIHRoaXMgZm9yIHNvbWUgcmVhc29uXHJcbiAgYmluZChoYW5kbGVyKSB7XHJcbiAgICB0aGlzLiR0ZXh0Lm9uKCdrZXlwcmVzcycsIChldmVudCkgPT4ge1xyXG4gICAgICBjb25zdCB2YWwgPSB0aGlzLl9nZXRWYWwoKTtcclxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzICYmIHZhbC5sZW5ndGgpIHtcclxuICAgICAgICBoYW5kbGVyKHZhbCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy4kYnV0dG9uLm9uKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgICBjb25zdCB2YWwgPSB0aGlzLl9nZXRWYWwoKTtcclxuICAgICAgaWYgKHZhbC5sZW5ndGgpIHtcclxuICAgICAgICBoYW5kbGVyKHZhbCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kKCkge1xyXG4gICAgdGhpcy4kdGV4dC5vZmYoKTtcclxuICAgIHRoaXMuJGJ1dHRvbi5vZmYoKTtcclxuICB9XHJcblxyXG4gIHJlbW92ZSgpIHtcclxuICAgIHRoaXMudW5iaW5kKCk7XHJcbiAgICB0aGlzLiRyb290LnJlbW92ZSgpO1xyXG4gIH1cclxufVxyXG4iLCJcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGlzdCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCRlbGVtZW50LCBpdGVtVmlldykge1xyXG4gICAgdGhpcy4kcm9vdCA9ICRlbGVtZW50O1xyXG5cclxuICAgIHRoaXMuaXRlbXMgPSBbXTtcclxuICAgIHRoaXMuaXRlbVZpZXcgPSBpdGVtVmlldztcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgc2V0KG5ld0l0ZW1zKSB7XHJcbiAgICB0aGlzLml0ZW1zID0gbmV3SXRlbXMubWFwKChpdGVtKSA9PiBuZXcgdGhpcy5pdGVtVmlldyhpdGVtKSk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICB0aGlzLiRyb290LmNoaWxkcmVuKCkucmVtb3ZlKCk7XHJcblxyXG4gICAgaWYgKCF0aGlzLml0ZW1zLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gdGhpcy4kcm9vdC5hcHBlbmQoJzxkaXYgY2xhc3M9XCJsaXN0LWl0ZW1cIj5Ob3RoaW5nIHlldCE8L2Rpdj4nKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiRyb290LmFwcGVuZCh0aGlzLml0ZW1zLm1hcCgoaXRlbSkgPT4gaXRlbS4kZWwpKTtcclxuICB9XHJcblxyXG4gIGNsZWFyKCkge1xyXG4gICAgdGhpcy5pdGVtcy5sZW5ndGggPSAwO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuICB9XHJcbn1cclxuIiwiXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGFsIHtcclxuXHJcbiAgc3RhdGljIHRlbXBsYXRlID0gdW5kZWZpbmVkO1xyXG5cclxuICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgdGhpcy4kZWwgPSAkKE1vZGFsLnRlbXBsYXRlKHtcclxuICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlID8gZGF0YS5tZXNzYWdlIDogZGF0YS5yZXNwb25zZUpTT04gPyBkYXRhLnJlc3BvbnNlSlNPTi5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIHRoaXMuJGVsLm9uKCdjbGljaycsIHRoaXMuY2xpY2suYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBjbGljaygpIHtcclxuICAgIHRoaXMuJGVsLnJlbW92ZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gc2FtZSBoYWNrIGV4cGxhaW5lZCBpbiBHaXRodWJSZXBvTGlzdEl0ZW0uanNcclxuJChkb2N1bWVudCkub24oJ3JlYWR5JywgKCkgPT4ge1xyXG4gIE1vZGFsLnRlbXBsYXRlID0gXy50ZW1wbGF0ZSgkKCcjdGVtcGxhdGUtTW9kYWwnKS5odG1sKCkpO1xyXG59KTtcclxuIiwiXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwaW5uZXIge1xyXG4gIGNvbnN0cnVjdG9yKCRlbGVtZW50KSB7XHJcbiAgICB0aGlzLiRyb290ID0gJGVsZW1lbnQ7XHJcbiAgfVxyXG4gIHNwaW4oKSB7XHJcbiAgICB0aGlzLiRyb290LmFkZENsYXNzKCdzcGluJyk7XHJcbiAgfVxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLiRyb290LnJlbW92ZUNsYXNzKCdzcGluJyk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBBcHAgZnJvbSAnLi9BcHAuanMnO1xyXG5cclxud2luZG93LkFwcCA9IEFwcDtcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcclxuICBjb25zb2xlLmRpcihBcHApO1xyXG4gIEFwcC5zdGFydChkb2N1bWVudC5ib2R5KTtcclxufSk7XHJcbiJdfQ==
