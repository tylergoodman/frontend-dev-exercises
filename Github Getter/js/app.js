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

      // initialize components
      this.spinner = new _Spinner2['default'](this.$root.find('#spinner'));
      this.input = new _Input2['default'](this.$root.find('#search'), this.search.bind(this, 1));
      this.results = new _List2['default'](this.$root.find('#results-container'), _GithubRepoListItem2['default']);
      this.cache = new _Cache2['default'](50);

      // some elements for pagination
      this.$next = this.$root.find('#next');
      this.$prev = this.$root.find('#previous');
      this.$next.on('click', this.getNext.bind(this));
      this.$prev.on('click', this.getPrev.bind(this));

      // our state
      this.currentQuery = undefined;
      this.currentPage = 1;
    }

    // some fun with es6 setters to handle the pagination ui changes
  }, {
    key: 'getNext',

    // handlers for our previous/next buttons
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

    // handler for our search input
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
// singly-linked list to manage our cache
// almost not worth making in lieu of using an array to
// keep track of old items
// maybe completely not worth it?
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
// class to manage paginated queries
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

      // bind to text element
      this.$text.on('keypress', function (event) {
        var val = _this._getVal();
        if (event.keyCode === 13 && val.length) {
          handler(val);
        }
      });
      // bind to button
      this.$button.on('click', function (event) {
        var val = _this._getVal();
        if (val.length) {
          handler(val);
        }
      });
    }

    // some cleanup functions that we never use
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
// generic list class
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
// quick and dirty modals
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
// wrapper for our terminal-like spinner
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy90L3JlcG9zaXRvcmllcy9mcm9udGVuZC1kZXYtZXhlcmNpc2VzL0dpdGh1YiBHZXR0ZXIvanMvQXBwL0FwcC5qcyIsIkM6L1VzZXJzL3QvcmVwb3NpdG9yaWVzL2Zyb250ZW5kLWRldi1leGVyY2lzZXMvR2l0aHViIEdldHRlci9qcy9BcHAvQ2FjaGUuanMiLCJDOi9Vc2Vycy90L3JlcG9zaXRvcmllcy9mcm9udGVuZC1kZXYtZXhlcmNpc2VzL0dpdGh1YiBHZXR0ZXIvanMvQXBwL0dpdGh1YlF1ZXJ5LmpzIiwiQzovVXNlcnMvdC9yZXBvc2l0b3JpZXMvZnJvbnRlbmQtZGV2LWV4ZXJjaXNlcy9HaXRodWIgR2V0dGVyL2pzL0FwcC9HaXRodWJSZXBvTGlzdEl0ZW0uanMiLCJDOi9Vc2Vycy90L3JlcG9zaXRvcmllcy9mcm9udGVuZC1kZXYtZXhlcmNpc2VzL0dpdGh1YiBHZXR0ZXIvanMvQXBwL0lucHV0LmpzIiwiQzovVXNlcnMvdC9yZXBvc2l0b3JpZXMvZnJvbnRlbmQtZGV2LWV4ZXJjaXNlcy9HaXRodWIgR2V0dGVyL2pzL0FwcC9MaXN0LmpzIiwiQzovVXNlcnMvdC9yZXBvc2l0b3JpZXMvZnJvbnRlbmQtZGV2LWV4ZXJjaXNlcy9HaXRodWIgR2V0dGVyL2pzL0FwcC9Nb2RhbC5qcyIsIkM6L1VzZXJzL3QvcmVwb3NpdG9yaWVzL2Zyb250ZW5kLWRldi1leGVyY2lzZXMvR2l0aHViIEdldHRlci9qcy9BcHAvU3Bpbm5lci5qcyIsIkM6L1VzZXJzL3QvcmVwb3NpdG9yaWVzL2Zyb250ZW5kLWRldi1leGVyY2lzZXMvR2l0aHViIEdldHRlci9qcy9BcHAvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7cUJDQWtCLFNBQVM7Ozs7dUJBQ1AsV0FBVzs7OztxQkFFYixTQUFTOzs7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QUFtQjFCLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQU07QUFDNUIsT0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Q0FDMUQsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7SUNyQmtCLE9BQU87QUFDZixXQURRLE9BQU8sQ0FDZCxRQUFRLEVBQUU7MEJBREgsT0FBTzs7QUFFeEIsUUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7R0FDdkI7O2VBSGtCLE9BQU87O1dBSXRCLGdCQUFHO0FBQ0wsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDN0I7OztXQUNHLGdCQUFHO0FBQ0wsVUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDaEM7OztTQVRrQixPQUFPOzs7cUJBQVAsT0FBTzs7Ozs7Ozs7cUJDRFosVUFBVTs7OztBQUUxQixNQUFNLENBQUMsR0FBRyxxQkFBTSxDQUFDOztBQUVqQixDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQU07QUFDdEIsU0FBTyxDQUFDLEdBQUcsb0JBQUssQ0FBQztBQUNqQixxQkFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzFCLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgSW5wdXQgZnJvbSAnLi9JbnB1dCc7XHJcbmltcG9ydCBTcGlubmVyIGZyb20gJy4vU3Bpbm5lcic7XHJcblxyXG5pbXBvcnQgTW9kYWwgZnJvbSAnLi9Nb2RhbCc7XHJcbmltcG9ydCBMaXN0IGZyb20gJy4vTGlzdCc7XHJcbmltcG9ydCBHaXRodWJSZXBvTGlzdEl0ZW0gZnJvbSAnLi9HaXRodWJSZXBvTGlzdEl0ZW0nO1xyXG5cclxuaW1wb3J0IENhY2hlIGZyb20gJy4vQ2FjaGUnO1xyXG5pbXBvcnQgR2l0aHViUXVlcnkgZnJvbSAnLi9HaXRodWJRdWVyeSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQXBwIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICBzdGFydChyb290RWxlbWVudCkge1xyXG4gICAgdGhpcy4kcm9vdCA9ICQocm9vdEVsZW1lbnQpO1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgY29tcG9uZW50c1xyXG4gICAgdGhpcy5zcGlubmVyID0gbmV3IFNwaW5uZXIodGhpcy4kcm9vdC5maW5kKCcjc3Bpbm5lcicpKTtcclxuICAgIHRoaXMuaW5wdXQgPSBuZXcgSW5wdXQodGhpcy4kcm9vdC5maW5kKCcjc2VhcmNoJyksIHRoaXMuc2VhcmNoLmJpbmQodGhpcywgMSkpO1xyXG4gICAgdGhpcy5yZXN1bHRzID0gbmV3IExpc3QodGhpcy4kcm9vdC5maW5kKCcjcmVzdWx0cy1jb250YWluZXInKSwgR2l0aHViUmVwb0xpc3RJdGVtKTtcclxuICAgIHRoaXMuY2FjaGUgPSBuZXcgQ2FjaGUoNTApO1xyXG5cclxuICAgIC8vIHNvbWUgZWxlbWVudHMgZm9yIHBhZ2luYXRpb25cclxuICAgIHRoaXMuJG5leHQgPSB0aGlzLiRyb290LmZpbmQoJyNuZXh0Jyk7XHJcbiAgICB0aGlzLiRwcmV2ID0gdGhpcy4kcm9vdC5maW5kKCcjcHJldmlvdXMnKTtcclxuICAgIHRoaXMuJG5leHQub24oJ2NsaWNrJywgdGhpcy5nZXROZXh0LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy4kcHJldi5vbignY2xpY2snLCB0aGlzLmdldFByZXYuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gb3VyIHN0YXRlXHJcbiAgICB0aGlzLmN1cnJlbnRRdWVyeSA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gIH1cclxuXHJcbiAgLy8gc29tZSBmdW4gd2l0aCBlczYgc2V0dGVycyB0byBoYW5kbGUgdGhlIHBhZ2luYXRpb24gdWkgY2hhbmdlc1xyXG4gIHNldCBoYXNQcmV2KHZhbHVlKSB7XHJcbiAgICB0aGlzLiRwcmV2LmF0dHIoJ2Rpc2FibGVkJywgIXZhbHVlKTtcclxuICB9XHJcblxyXG4gIHNldCBoYXNOZXh0KHZhbHVlKSB7XHJcbiAgICB0aGlzLiRuZXh0LmF0dHIoJ2Rpc2FibGVkJywgIXZhbHVlKTtcclxuICB9XHJcblxyXG4gIC8vIGhhbmRsZXJzIGZvciBvdXIgcHJldmlvdXMvbmV4dCBidXR0b25zXHJcbiAgZ2V0TmV4dCgpIHtcclxuICAgIC8vIHNvIHdlIGNhbid0IHNwYW0gdGhlIGJ1dHRvbiB3aGlsZSBpdCdzIGxvYWRpbmcuLi5cclxuICAgIHRoaXMuJG5leHQuYWRkKHRoaXMuJHByZXYpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XHJcbiAgICB0aGlzLnNlYXJjaCgrK3RoaXMuY3VycmVudFBhZ2UsIHRoaXMuY3VycmVudFF1ZXJ5KTtcclxuICB9XHJcbiAgZ2V0UHJldigpIHtcclxuICAgIHRoaXMuJG5leHQuYWRkKHRoaXMuJHByZXYpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XHJcbiAgICB0aGlzLnNlYXJjaCgtLXRoaXMuY3VycmVudFBhZ2UsIHRoaXMuY3VycmVudFF1ZXJ5KTtcclxuICB9XHJcblxyXG4gIC8vIGhhbmRsZXIgZm9yIG91ciBzZWFyY2ggaW5wdXRcclxuICBzZWFyY2gocGFnZSwga2V5d29yZCkge1xyXG4gICAgLy8gc3RhcnQgb3VyIHNwaW5uZXJcclxuICAgIHRoaXMuc3Bpbm5lci5zcGluKCk7XHJcblxyXG4gICAgLy8gdXBkYXRlIG91ciBzdGF0ZVxyXG4gICAgdGhpcy5jdXJyZW50UXVlcnkgPSBrZXl3b3JkO1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhZ2U7XHJcblxyXG4gICAgLy8gY2hlY2sgb3VyIGNhY2hlXHJcbiAgICBsZXQgZ2hRdWVyeSA9IHRoaXMuY2FjaGUuZ2V0KGtleXdvcmQpO1xyXG5cclxuICAgIC8vIG1ha2UgbmV3IHF1ZXJ5IGlmIHdlIGRvbid0IGhhdmUgaXQgY2FjaGVkXHJcbiAgICBpZiAoIWdoUXVlcnkpIHtcclxuICAgICAgZ2hRdWVyeSA9IG5ldyBHaXRodWJRdWVyeShrZXl3b3JkKTtcclxuICAgICAgdGhpcy5jYWNoZS5wdXNoKGtleXdvcmQsIGdoUXVlcnkpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBnZXQgcGFnZSBmb3IgcXVlcnlcclxuICAgIGdoUXVlcnkuZ2V0UGFnZShwYWdlKVxyXG4gICAgICAudGhlbigobGlzdCkgPT4ge1xyXG4gICAgICAgIC8vIHVwZGF0ZSB2aWV3c1xyXG4gICAgICAgIHRoaXMucmVzdWx0cy5zZXQobGlzdCk7XHJcbiAgICAgICAgdGhpcy5yZXN1bHRzLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICBpZiAocGFnZSA8IGdoUXVlcnkudG90YWxfcGFnZXMpIHtcclxuICAgICAgICAgIHRoaXMuaGFzTmV4dCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5oYXNOZXh0ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGFnZSA+IDEpIHtcclxuICAgICAgICAgIHRoaXMuaGFzUHJldiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5oYXNQcmV2ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgIC8vIGdpdmUgZXJyb3IgaW4gbW9kYWxcclxuICAgICAgICB0aGlzLiRyb290LmFwcGVuZChuZXcgTW9kYWwoZXJyb3IpLiRlbCk7XHJcblxyXG4gICAgICAgIHRoaXMuc3Bpbm5lci5zdG9wKCk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICBzY3JvbGxUbygwLCAwKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBuZXcgQXBwO1xyXG4iLCIvLyBzaW5nbHktbGlua2VkIGxpc3QgdG8gbWFuYWdlIG91ciBjYWNoZVxyXG4vLyBhbG1vc3Qgbm90IHdvcnRoIG1ha2luZyBpbiBsaWV1IG9mIHVzaW5nIGFuIGFycmF5IHRvXHJcbi8vIGtlZXAgdHJhY2sgb2Ygb2xkIGl0ZW1zXHJcbi8vIG1heWJlIGNvbXBsZXRlbHkgbm90IHdvcnRoIGl0P1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYWNoZSB7XHJcbiAgY29uc3RydWN0b3IobWF4X2xlbmd0aCkge1xyXG4gICAgdGhpcy5kaWN0ID0ge307XHJcblxyXG4gICAgdGhpcy5mcm9udCA9IG51bGw7XHJcbiAgICB0aGlzLmVuZCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5sZW5ndGggPSAwO1xyXG4gICAgdGhpcy5tYXhfbGVuZ3RoID0gbWF4X2xlbmd0aDtcclxuICB9XHJcblxyXG4gIGdldChrZXkpIHtcclxuICAgIGNvbnN0IHZhbCA9IHRoaXMuZGljdFtrZXldO1xyXG4gICAgaWYgKHZhbCkge1xyXG4gICAgICByZXR1cm4gdmFsLnZhbHVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICB9XHJcblxyXG4gIHB1c2goa2V5LCB2YWx1ZSkge1xyXG4gICAgY29uc3QgaXRlbSA9IG5ldyBDYWNoZUl0ZW0oa2V5LCB2YWx1ZSk7XHJcbiAgICB0aGlzLmRpY3Rba2V5XSA9IGl0ZW07XHJcbiAgICBpZiAodGhpcy5mcm9udCkge1xyXG4gICAgICB0aGlzLmZyb250Lm5leHQgPSBpdGVtO1xyXG4gICAgfVxyXG4gICAgdGhpcy5mcm9udCA9IGl0ZW07XHJcbiAgICB0aGlzLmxlbmd0aCsrO1xyXG5cclxuICAgIGlmICh0aGlzLmxlbmd0aCA+IHRoaXMubWF4X2xlbmd0aCkge1xyXG4gICAgICBkZWxldGUgdGhpcy5kaWN0W3RoaXMuZW5kLmtleV07XHJcbiAgICAgIHRoaXMuZW5kID0gdGhpcy5lbmQubmV4dDtcclxuICAgICAgdGhpcy5sZW5ndGgtLTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIENhY2hlSXRlbSB7XHJcbiAgY29uc3RydWN0b3Ioa2V5LCB2YWx1ZSkge1xyXG4gICAgdGhpcy5rZXkgPSBrZXk7XHJcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbiAgICB0aGlzLm5leHQgPSBudWxsO1xyXG4gIH1cclxufVxyXG4iLCIvLyBjbGFzcyB0byBtYW5hZ2UgcGFnaW5hdGVkIHF1ZXJpZXNcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2l0aHViUXVlcnkge1xyXG5cclxuICBzdGF0aWMgUEFHRV9TSVpFID0gMTAwO1xyXG5cclxuICBjb25zdHJ1Y3RvcihrZXl3b3JkKSB7XHJcbiAgICB0aGlzLmtleXdvcmQgPSBrZXl3b3JkO1xyXG4gICAgdGhpcy50b3RhbF9wYWdlcyA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMucGFnZXMgPSBbXTtcclxuICB9XHJcblxyXG4gIGdldFBhZ2UocGFnZV9udW0pIHtcclxuICAgIC8vIHJlamVjdCBpZiB3ZSdyZSBvdXQgb2YgcmFuZ2VcclxuICAgIGlmICh0aGlzLnRvdGFsX3BhZ2VzICYmIHBhZ2VfbnVtID4gdGhpcy50b3RhbF9wYWdlcykge1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFJhbmdlRXJyb3IoYE5vIHBhZ2UgJHtwYWdlX251bX0gZm9yIHF1ZXJ5ICR7dGhpcy5rZXl3b3JkfWApKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZXR1cm4gb3VyIGNhY2hlZCBwYWdlXHJcbiAgICBsZXQgcGFnZTtcclxuICAgIGlmIChwYWdlID0gdGhpcy5wYWdlc1twYWdlX251bSAtIDFdKSB7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocGFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcXVlcnkgcGFnZVxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgLy8gJC5nZXRKU09OKGBodHRwczovL2FwaS5naXRodWIuY29tL2xlZ2FjeS9yZXBvcy9zZWFyY2gvJHtxdWVyeX1gKVxyXG4gICAgICAkLmdldEpTT04oYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vc2VhcmNoL3JlcG9zaXRvcmllcz9wZXJfcGFnZT0ke0dpdGh1YlF1ZXJ5LlBBR0VfU0laRX0mcGFnZT0ke3BhZ2VfbnVtfSZxPSR7dGhpcy5rZXl3b3JkfWApXHJcbiAgICAgICAgLmZhaWwoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZmFpbGVkIHRvIGdldCAke3RoaXMua2V5d29yZH06JHtwYWdlX251bX1gKTtcclxuICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZG9uZSgoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coYGdvdCAke3RoaXMua2V5d29yZH06JHtwYWdlX251bX1gLCBkYXRhKTtcclxuXHJcbiAgICAgICAgICAvLyBzYXZlIG91ciBkYXRhXHJcbiAgICAgICAgICAvLyBxdWVyaWVzIGhhdmUgYSBtYXhpbXVtIG9mIDEwMDAgc2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgIHRoaXMudG90YWxfcGFnZXMgPSBNYXRoLm1pbigxMDAwIC8gR2l0aHViUXVlcnkuUEFHRV9TSVpFLCBNYXRoLmZsb29yKGRhdGEudG90YWxfY291bnQgLyBHaXRodWJRdWVyeS5QQUdFX1NJWkUpKTtcclxuICAgICAgICAgIHRoaXMucGFnZXNbcGFnZV9udW0gLSAxXSA9IGRhdGEuaXRlbXM7XHJcblxyXG4gICAgICAgICAgcmVzb2x2ZShkYXRhLml0ZW1zKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iLCJcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2l0aHViUmVwb0xpc3RJdGVtIHtcclxuXHJcbiAgLy8gc3RhdGljIHRlbXBsYXRlID0gXy50ZW1wbGF0ZSgkKCcjdGVtcGxhdGUtR2l0aHViUmVwb0xpc3RJdGVtJykuaHRtbCgpKTtcclxuICBzdGF0aWMgdGVtcGxhdGUgPSB1bmRlZmluZWQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuXHJcbiAgICAvLyBnZXQgcmlkIG9mIChwb3RlbnRpYWwpIGh0bWwgaW4gdGhlIGRlc2NyaXB0aW9uXHJcbiAgICBkYXRhLmRlc2NyaXB0aW9uID0gXy5lc2NhcGUoZGF0YS5kZXNjcmlwdGlvbik7XHJcbiAgICAvLyBzb21lIHJlcG9zIGRvbid0IGhhdmUgYSBsYW5ndWFnZSBhcHBhcmVudGx5XHJcbiAgICBkYXRhLmxhbmd1YWdlID0gZGF0YS5sYW5ndWFnZSB8fCAnVW5rbm93bic7XHJcbiAgICAvLyByZWZlcmVuY2Ugb3VyIGRhdGFcclxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcblxyXG4gICAgLy8gY29uc3RydWN0IHZpZXdcclxuICAgIHRoaXMuJGVsID0gJChHaXRodWJSZXBvTGlzdEl0ZW0udGVtcGxhdGUoZGF0YSkpO1xyXG4gICAgLy8gYmluZCBoYW5kbGVyXHJcbiAgICB0aGlzLiRlbC5vbignY2xpY2snLCAnLnRpdGxlJywgdGhpcy5jbGljay5iaW5kKHRoaXMpKTtcclxuICB9XHJcblxyXG4gIGNsaWNrKCkge1xyXG4gICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ21pbmltaXplZCcpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gYmVjYXVzZSB0aGUgaHRtbCB0aGF0IGNvbnRhaW5zIG91ciB0ZW1wbGF0ZSBpc24ndCBmdWxseSBsb2FkZWQgeWV0IChzaW5jZSB0aGlzIHNjcmlwdCBpcyBpbiB0aGUgaGVhZClcclxuLy8gd2FpdCBhbmQgZ2V0IHRoZSB0ZW1wbGF0ZSB3aGVuIGl0J3MgYXZhaWxhYmxlXHJcbi8vIGluIGEgcmVhbCBhcHBsaWNhdGlvbiwgdGhpcyB3b3VsZCBlaXRoZXIgYmUgaW5saW5lIChwb2x5bWVyIG9yIHJlYWN0KVxyXG4vLyBvciBmZXRjaGVkIGZvciB1cyAoYW5ndWxhciwgZXRjKVxyXG4vLyBhbHRlcm5hdGl2ZWx5LCB0aGlzIHNjcmlwdCBjb3VsZCBiZSBwbGFjZWQgYXQgdGhlIGVuZCBvZiB0aGUgaHRtbCA8Ym9keT4sIG9yIHdlIGNvdWxkIHBhc3RlIHRoZSB0ZW1wbGF0ZSBpbmxpbmUgYXMgYSBzdHJpbmcgaGVyZVxyXG4kKGRvY3VtZW50KS5vbigncmVhZHknLCAoKSA9PiB7XHJcbiAgR2l0aHViUmVwb0xpc3RJdGVtLnRlbXBsYXRlID0gXy50ZW1wbGF0ZSgkKCcjdGVtcGxhdGUtR2l0aHViUmVwb0xpc3RJdGVtJykuaHRtbCgpKTtcclxufSk7XHJcbiIsIlxyXG4vLyBvdXIgY3VzdG9tIElucHV0ICdjb21wb25lbnQnIHRvIHdyYXAgb3VyIGlucHV0IGVsZW1lbnQgbWFuYWdlbWVudCB3aXRoXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0IHtcclxuXHJcbiAgY29uc3RydWN0b3IoJGVsZW1lbnQsIGhhbmRsZXIpIHtcclxuXHJcbiAgICB0aGlzLiRyb290ID0gJGVsZW1lbnQ7XHJcblxyXG4gICAgdGhpcy4kdGV4dCA9IHRoaXMuJHJvb3QuZmluZCgnaW5wdXRbdHlwZT1cInRleHRcIl0nKTtcclxuICAgIHRoaXMuJGJ1dHRvbiA9IHRoaXMuJHJvb3QuZmluZCgnYnV0dG9uJyk7XHJcblxyXG4gICAgaWYgKGhhbmRsZXIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICB0aGlzLmJpbmQoaGFuZGxlcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBfZ2V0VmFsKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuJHRleHQudmFsKCk7XHJcbiAgfVxyXG5cclxuICAvLyBiaW5kIGEgaGFuZGxlciBmb3IgdGhpcyBpbnB1dCBjb21wb25lbnRcclxuICAvLyBjaG9zZSBub3QgdG8gdXNlIGZvcm1zIGZvciB0aGlzIGZvciBzb21lIHJlYXNvblxyXG4gIGJpbmQoaGFuZGxlcikge1xyXG4gICAgLy8gYmluZCB0byB0ZXh0IGVsZW1lbnRcclxuICAgIHRoaXMuJHRleHQub24oJ2tleXByZXNzJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIGNvbnN0IHZhbCA9IHRoaXMuX2dldFZhbCgpO1xyXG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMgJiYgdmFsLmxlbmd0aCkge1xyXG4gICAgICAgIGhhbmRsZXIodmFsKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvLyBiaW5kIHRvIGJ1dHRvblxyXG4gICAgdGhpcy4kYnV0dG9uLm9uKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgICBjb25zdCB2YWwgPSB0aGlzLl9nZXRWYWwoKTtcclxuICAgICAgaWYgKHZhbC5sZW5ndGgpIHtcclxuICAgICAgICBoYW5kbGVyKHZhbCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gc29tZSBjbGVhbnVwIGZ1bmN0aW9ucyB0aGF0IHdlIG5ldmVyIHVzZVxyXG4gIHVuYmluZCgpIHtcclxuICAgIHRoaXMuJHRleHQub2ZmKCk7XHJcbiAgICB0aGlzLiRidXR0b24ub2ZmKCk7XHJcbiAgfVxyXG5cclxuICByZW1vdmUoKSB7XHJcbiAgICB0aGlzLnVuYmluZCgpO1xyXG4gICAgdGhpcy4kcm9vdC5yZW1vdmUoKTtcclxuICB9XHJcbn1cclxuIiwiLy8gZ2VuZXJpYyBsaXN0IGNsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpc3Qge1xyXG5cclxuICBjb25zdHJ1Y3RvcigkZWxlbWVudCwgaXRlbVZpZXcpIHtcclxuICAgIHRoaXMuJHJvb3QgPSAkZWxlbWVudDtcclxuXHJcbiAgICB0aGlzLml0ZW1zID0gW107XHJcbiAgICB0aGlzLml0ZW1WaWV3ID0gaXRlbVZpZXc7XHJcblxyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuICB9XHJcblxyXG4gIHNldChuZXdJdGVtcykge1xyXG4gICAgdGhpcy5pdGVtcyA9IG5ld0l0ZW1zLm1hcCgoaXRlbSkgPT4gbmV3IHRoaXMuaXRlbVZpZXcoaXRlbSkpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgdGhpcy4kcm9vdC5jaGlsZHJlbigpLnJlbW92ZSgpO1xyXG5cclxuICAgIGlmICghdGhpcy5pdGVtcy5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuJHJvb3QuYXBwZW5kKCc8ZGl2IGNsYXNzPVwibGlzdC1pdGVtXCI+Tm90aGluZyB5ZXQhPC9kaXY+Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kcm9vdC5hcHBlbmQodGhpcy5pdGVtcy5tYXAoKGl0ZW0pID0+IGl0ZW0uJGVsKSk7XHJcbiAgfVxyXG5cclxuICBjbGVhcigpIHtcclxuICAgIHRoaXMuaXRlbXMubGVuZ3RoID0gMDtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG59XHJcbiIsIi8vIHF1aWNrIGFuZCBkaXJ0eSBtb2RhbHNcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kYWwge1xyXG5cclxuICBzdGF0aWMgdGVtcGxhdGUgPSB1bmRlZmluZWQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICB0aGlzLiRlbCA9ICQoTW9kYWwudGVtcGxhdGUoe1xyXG4gICAgICBtZXNzYWdlOiBkYXRhLm1lc3NhZ2UgPyBkYXRhLm1lc3NhZ2UgOiBkYXRhLnJlc3BvbnNlSlNPTiA/IGRhdGEucmVzcG9uc2VKU09OLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcicsXHJcbiAgICB9KSk7XHJcblxyXG4gICAgdGhpcy4kZWwub24oJ2NsaWNrJywgdGhpcy5jbGljay5iaW5kKHRoaXMpKTtcclxuICB9XHJcblxyXG4gIGNsaWNrKCkge1xyXG4gICAgdGhpcy4kZWwucmVtb3ZlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBzYW1lIGhhY2sgZXhwbGFpbmVkIGluIEdpdGh1YlJlcG9MaXN0SXRlbS5qc1xyXG4kKGRvY3VtZW50KS5vbigncmVhZHknLCAoKSA9PiB7XHJcbiAgTW9kYWwudGVtcGxhdGUgPSBfLnRlbXBsYXRlKCQoJyN0ZW1wbGF0ZS1Nb2RhbCcpLmh0bWwoKSk7XHJcbn0pO1xyXG4iLCIvLyB3cmFwcGVyIGZvciBvdXIgdGVybWluYWwtbGlrZSBzcGlubmVyXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwaW5uZXIge1xyXG4gIGNvbnN0cnVjdG9yKCRlbGVtZW50KSB7XHJcbiAgICB0aGlzLiRyb290ID0gJGVsZW1lbnQ7XHJcbiAgfVxyXG4gIHNwaW4oKSB7XHJcbiAgICB0aGlzLiRyb290LmFkZENsYXNzKCdzcGluJyk7XHJcbiAgfVxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLiRyb290LnJlbW92ZUNsYXNzKCdzcGluJyk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBBcHAgZnJvbSAnLi9BcHAuanMnO1xyXG5cclxud2luZG93LkFwcCA9IEFwcDtcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcclxuICBjb25zb2xlLmRpcihBcHApO1xyXG4gIEFwcC5zdGFydChkb2N1bWVudC5ib2R5KTtcclxufSk7XHJcbiJdfQ==
