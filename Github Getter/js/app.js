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

var _Paginator = require('./Paginator');

var _Paginator2 = _interopRequireDefault(_Paginator);

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
      this.paginator = new _Paginator2['default'](this.$root.find('#paginator'), this.search.bind(this));

      this.cache = new _Cache2['default'](50);
    }

    // handler for our search input
  }, {
    key: 'search',
    value: function search(page, keyword) {
      var _this = this;

      // start our spinner
      this.spinner.spin();

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

        _this.paginator.currentQuery = keyword;
        _this.paginator.currentPage = page;
        _this.paginator.hasNext = page < ghQuery.total_pages;
        _this.paginator.hasPrev = page > 1;

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
  }]);

  return App;
})();

exports.App = App;
exports['default'] = new App();

},{"./Cache":2,"./GithubQuery":3,"./GithubRepoListItem":4,"./Input":5,"./List":6,"./Modal":7,"./Paginator":8,"./Spinner":9}],2:[function(require,module,exports){
// singly-linked list to manage our cache
// almost not worth making in lieu of using an array to
// keep track of old items
// maybe completely not worth it?
// needs testing
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
// wrapper for our pagination logic
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Paginator = (function () {
  function Paginator($element, handler) {
    _classCallCheck(this, Paginator);

    this.$root = $element;
    this.handler = handler;

    this.$next = this.$root.find('.next');
    this.$prev = this.$root.find('.previous');
    this.$next.on('click', this.getNext.bind(this));
    this.$prev.on('click', this.getPrev.bind(this));

    // state
    this.currentQuery = undefined;
    this.currentPage = 1;
  }

  // some fun with es6 setters to handle the ui changes

  _createClass(Paginator, [{
    key: 'getNext',

    // handlers for our previous/next buttons
    value: function getNext() {
      // so we can't spam the button while it's loading...
      this.$next.add(this.$prev).attr('disabled', true);
      this.handler(++this.currentPage, this.currentQuery);
    }
  }, {
    key: 'getPrev',
    value: function getPrev() {
      this.$next.add(this.$prev).attr('disabled', true);
      this.handler(--this.currentPage, this.currentQuery);
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

  return Paginator;
})();

exports['default'] = Paginator;
module.exports = exports['default'];

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppJs = require('./App.js');

var _AppJs2 = _interopRequireDefault(_AppJs);

window.App = _AppJs2['default'];

$(document).ready(function () {
  console.dir(_AppJs2['default']);
  _AppJs2['default'].start(document.body);
});

},{"./App.js":1}]},{},[10])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy90L3JlcG9zaXRvcmllcy9mcm9udGVuZC1kZXYtZXhlcmNpc2VzL0dpdGh1YiBHZXR0ZXIvanMvQXBwL0FwcC5qcyIsIkM6L1VzZXJzL3QvcmVwb3NpdG9yaWVzL2Zyb250ZW5kLWRldi1leGVyY2lzZXMvR2l0aHViIEdldHRlci9qcy9BcHAvQ2FjaGUuanMiLCJDOi9Vc2Vycy90L3JlcG9zaXRvcmllcy9mcm9udGVuZC1kZXYtZXhlcmNpc2VzL0dpdGh1YiBHZXR0ZXIvanMvQXBwL0dpdGh1YlF1ZXJ5LmpzIiwiQzovVXNlcnMvdC9yZXBvc2l0b3JpZXMvZnJvbnRlbmQtZGV2LWV4ZXJjaXNlcy9HaXRodWIgR2V0dGVyL2pzL0FwcC9HaXRodWJSZXBvTGlzdEl0ZW0uanMiLCJDOi9Vc2Vycy90L3JlcG9zaXRvcmllcy9mcm9udGVuZC1kZXYtZXhlcmNpc2VzL0dpdGh1YiBHZXR0ZXIvanMvQXBwL0lucHV0LmpzIiwiQzovVXNlcnMvdC9yZXBvc2l0b3JpZXMvZnJvbnRlbmQtZGV2LWV4ZXJjaXNlcy9HaXRodWIgR2V0dGVyL2pzL0FwcC9MaXN0LmpzIiwiQzovVXNlcnMvdC9yZXBvc2l0b3JpZXMvZnJvbnRlbmQtZGV2LWV4ZXJjaXNlcy9HaXRodWIgR2V0dGVyL2pzL0FwcC9Nb2RhbC5qcyIsIkM6L1VzZXJzL3QvcmVwb3NpdG9yaWVzL2Zyb250ZW5kLWRldi1leGVyY2lzZXMvR2l0aHViIEdldHRlci9qcy9BcHAvUGFnaW5hdG9yLmpzIiwiQzovVXNlcnMvdC9yZXBvc2l0b3JpZXMvZnJvbnRlbmQtZGV2LWV4ZXJjaXNlcy9HaXRodWIgR2V0dGVyL2pzL0FwcC9TcGlubmVyLmpzIiwiQzovVXNlcnMvdC9yZXBvc2l0b3JpZXMvZnJvbnRlbmQtZGV2LWV4ZXJjaXNlcy9HaXRodWIgR2V0dGVyL2pzL0FwcC9pbmRleC5qcyJd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LENBQUM7QUFDakIscUJBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUMxQixDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IElucHV0IGZyb20gJy4vSW5wdXQnO1xyXG5pbXBvcnQgU3Bpbm5lciBmcm9tICcuL1NwaW5uZXInO1xyXG5pbXBvcnQgTW9kYWwgZnJvbSAnLi9Nb2RhbCc7XHJcbmltcG9ydCBQYWdpbmF0b3IgZnJvbSAnLi9QYWdpbmF0b3InO1xyXG5cclxuaW1wb3J0IExpc3QgZnJvbSAnLi9MaXN0JztcclxuaW1wb3J0IEdpdGh1YlJlcG9MaXN0SXRlbSBmcm9tICcuL0dpdGh1YlJlcG9MaXN0SXRlbSc7XHJcblxyXG5pbXBvcnQgQ2FjaGUgZnJvbSAnLi9DYWNoZSc7XHJcbmltcG9ydCBHaXRodWJRdWVyeSBmcm9tICcuL0dpdGh1YlF1ZXJ5JztcclxuXHJcbmV4cG9ydCBjbGFzcyBBcHAge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gIHN0YXJ0KHJvb3RFbGVtZW50KSB7XHJcbiAgICB0aGlzLiRyb290ID0gJChyb290RWxlbWVudCk7XHJcblxyXG4gICAgLy8gaW5pdGlhbGl6ZSBjb21wb25lbnRzXHJcbiAgICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcih0aGlzLiRyb290LmZpbmQoJyNzcGlubmVyJykpO1xyXG4gICAgdGhpcy5pbnB1dCA9IG5ldyBJbnB1dCh0aGlzLiRyb290LmZpbmQoJyNzZWFyY2gnKSwgdGhpcy5zZWFyY2guYmluZCh0aGlzLCAxKSk7XHJcbiAgICB0aGlzLnJlc3VsdHMgPSBuZXcgTGlzdCh0aGlzLiRyb290LmZpbmQoJyNyZXN1bHRzLWNvbnRhaW5lcicpLCBHaXRodWJSZXBvTGlzdEl0ZW0pO1xyXG4gICAgdGhpcy5wYWdpbmF0b3IgPSBuZXcgUGFnaW5hdG9yKHRoaXMuJHJvb3QuZmluZCgnI3BhZ2luYXRvcicpLCB0aGlzLnNlYXJjaC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLmNhY2hlID0gbmV3IENhY2hlKDUwKTtcclxuICB9XHJcblxyXG4gIC8vIGhhbmRsZXIgZm9yIG91ciBzZWFyY2ggaW5wdXRcclxuICBzZWFyY2gocGFnZSwga2V5d29yZCkge1xyXG4gICAgLy8gc3RhcnQgb3VyIHNwaW5uZXJcclxuICAgIHRoaXMuc3Bpbm5lci5zcGluKCk7XHJcblxyXG4gICAgLy8gY2hlY2sgb3VyIGNhY2hlXHJcbiAgICBsZXQgZ2hRdWVyeSA9IHRoaXMuY2FjaGUuZ2V0KGtleXdvcmQpO1xyXG5cclxuICAgIC8vIG1ha2UgbmV3IHF1ZXJ5IGlmIHdlIGRvbid0IGhhdmUgaXQgY2FjaGVkXHJcbiAgICBpZiAoIWdoUXVlcnkpIHtcclxuICAgICAgZ2hRdWVyeSA9IG5ldyBHaXRodWJRdWVyeShrZXl3b3JkKTtcclxuICAgICAgdGhpcy5jYWNoZS5wdXNoKGtleXdvcmQsIGdoUXVlcnkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGdldCBwYWdlIGZvciBxdWVyeVxyXG4gICAgZ2hRdWVyeS5nZXRQYWdlKHBhZ2UpXHJcbiAgICAgIC50aGVuKChsaXN0KSA9PiB7XHJcbiAgICAgICAgLy8gdXBkYXRlIHZpZXdzXHJcbiAgICAgICAgdGhpcy5yZXN1bHRzLnNldChsaXN0KTtcclxuICAgICAgICB0aGlzLnJlc3VsdHMudXBkYXRlKCk7XHJcblxyXG4gICAgICAgIHRoaXMucGFnaW5hdG9yLmN1cnJlbnRRdWVyeSA9IGtleXdvcmQ7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0b3IuY3VycmVudFBhZ2UgPSBwYWdlO1xyXG4gICAgICAgIHRoaXMucGFnaW5hdG9yLmhhc05leHQgPSAocGFnZSA8IGdoUXVlcnkudG90YWxfcGFnZXMpO1xyXG4gICAgICAgIHRoaXMucGFnaW5hdG9yLmhhc1ByZXYgPSAocGFnZSA+IDEpO1xyXG5cclxuICAgICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgIC8vIGdpdmUgZXJyb3IgaW4gbW9kYWxcclxuICAgICAgICB0aGlzLiRyb290LmFwcGVuZChuZXcgTW9kYWwoZXJyb3IpLiRlbCk7XHJcblxyXG4gICAgICAgIHRoaXMuc3Bpbm5lci5zdG9wKCk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICBzY3JvbGxUbygwLCAwKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBuZXcgQXBwO1xyXG4iLCIvLyBzaW5nbHktbGlua2VkIGxpc3QgdG8gbWFuYWdlIG91ciBjYWNoZVxyXG4vLyBhbG1vc3Qgbm90IHdvcnRoIG1ha2luZyBpbiBsaWV1IG9mIHVzaW5nIGFuIGFycmF5IHRvXHJcbi8vIGtlZXAgdHJhY2sgb2Ygb2xkIGl0ZW1zXHJcbi8vIG1heWJlIGNvbXBsZXRlbHkgbm90IHdvcnRoIGl0P1xyXG4vLyBuZWVkcyB0ZXN0aW5nXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhY2hlIHtcclxuICBjb25zdHJ1Y3RvcihtYXhfbGVuZ3RoKSB7XHJcbiAgICB0aGlzLmRpY3QgPSB7fTtcclxuXHJcbiAgICB0aGlzLmZyb250ID0gbnVsbDtcclxuICAgIHRoaXMuZW5kID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLm1heF9sZW5ndGggPSBtYXhfbGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgZ2V0KGtleSkge1xyXG4gICAgY29uc3QgdmFsID0gdGhpcy5kaWN0W2tleV07XHJcbiAgICBpZiAodmFsKSB7XHJcbiAgICAgIHJldHVybiB2YWwudmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgcHVzaChrZXksIHZhbHVlKSB7XHJcbiAgICBjb25zdCBpdGVtID0gbmV3IENhY2hlSXRlbShrZXksIHZhbHVlKTtcclxuICAgIHRoaXMuZGljdFtrZXldID0gaXRlbTtcclxuICAgIGlmICh0aGlzLmZyb250KSB7XHJcbiAgICAgIHRoaXMuZnJvbnQubmV4dCA9IGl0ZW07XHJcbiAgICB9XHJcbiAgICB0aGlzLmZyb250ID0gaXRlbTtcclxuICAgIHRoaXMubGVuZ3RoKys7XHJcblxyXG4gICAgaWYgKHRoaXMubGVuZ3RoID4gdGhpcy5tYXhfbGVuZ3RoKSB7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLmRpY3RbdGhpcy5lbmQua2V5XTtcclxuICAgICAgdGhpcy5lbmQgPSB0aGlzLmVuZC5uZXh0O1xyXG4gICAgICB0aGlzLmxlbmd0aC0tO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgQ2FjaGVJdGVtIHtcclxuICBjb25zdHJ1Y3RvcihrZXksIHZhbHVlKSB7XHJcbiAgICB0aGlzLmtleSA9IGtleTtcclxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuICAgIHRoaXMubmV4dCA9IG51bGw7XHJcbiAgfVxyXG59XHJcbiIsIi8vIGNsYXNzIHRvIG1hbmFnZSBwYWdpbmF0ZWQgcXVlcmllc1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHaXRodWJRdWVyeSB7XHJcblxyXG4gIHN0YXRpYyBQQUdFX1NJWkUgPSAxMDA7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGtleXdvcmQpIHtcclxuICAgIHRoaXMua2V5d29yZCA9IGtleXdvcmQ7XHJcbiAgICB0aGlzLnRvdGFsX3BhZ2VzID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5wYWdlcyA9IFtdO1xyXG4gIH1cclxuXHJcbiAgZ2V0UGFnZShwYWdlX251bSkge1xyXG4gICAgLy8gcmVqZWN0IGlmIHdlJ3JlIG91dCBvZiByYW5nZVxyXG4gICAgaWYgKHRoaXMudG90YWxfcGFnZXMgJiYgcGFnZV9udW0gPiB0aGlzLnRvdGFsX3BhZ2VzKSB7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgUmFuZ2VFcnJvcihgTm8gcGFnZSAke3BhZ2VfbnVtfSBmb3IgcXVlcnkgJHt0aGlzLmtleXdvcmR9YCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJldHVybiBvdXIgY2FjaGVkIHBhZ2VcclxuICAgIGxldCBwYWdlO1xyXG4gICAgaWYgKHBhZ2UgPSB0aGlzLnBhZ2VzW3BhZ2VfbnVtIC0gMV0pIHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBxdWVyeSBwYWdlXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAvLyAkLmdldEpTT04oYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vbGVnYWN5L3JlcG9zL3NlYXJjaC8ke3F1ZXJ5fWApXHJcbiAgICAgICQuZ2V0SlNPTihgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9zZWFyY2gvcmVwb3NpdG9yaWVzP3Blcl9wYWdlPSR7R2l0aHViUXVlcnkuUEFHRV9TSVpFfSZwYWdlPSR7cGFnZV9udW19JnE9JHt0aGlzLmtleXdvcmR9YClcclxuICAgICAgICAuZmFpbCgoZXJyb3IpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGBmYWlsZWQgdG8gZ2V0ICR7dGhpcy5rZXl3b3JkfToke3BhZ2VfbnVtfWApO1xyXG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5kb25lKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZ290ICR7dGhpcy5rZXl3b3JkfToke3BhZ2VfbnVtfWAsIGRhdGEpO1xyXG5cclxuICAgICAgICAgIC8vIHNhdmUgb3VyIGRhdGFcclxuICAgICAgICAgIC8vIHF1ZXJpZXMgaGF2ZSBhIG1heGltdW0gb2YgMTAwMCBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgdGhpcy50b3RhbF9wYWdlcyA9IE1hdGgubWluKDEwMDAgLyBHaXRodWJRdWVyeS5QQUdFX1NJWkUsIE1hdGguZmxvb3IoZGF0YS50b3RhbF9jb3VudCAvIEdpdGh1YlF1ZXJ5LlBBR0VfU0laRSkpO1xyXG4gICAgICAgICAgdGhpcy5wYWdlc1twYWdlX251bSAtIDFdID0gZGF0YS5pdGVtcztcclxuXHJcbiAgICAgICAgICByZXNvbHZlKGRhdGEuaXRlbXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiIsIlxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHaXRodWJSZXBvTGlzdEl0ZW0ge1xyXG5cclxuICAvLyBzdGF0aWMgdGVtcGxhdGUgPSBfLnRlbXBsYXRlKCQoJyN0ZW1wbGF0ZS1HaXRodWJSZXBvTGlzdEl0ZW0nKS5odG1sKCkpO1xyXG4gIHN0YXRpYyB0ZW1wbGF0ZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgY29uc3RydWN0b3IoZGF0YSkge1xyXG5cclxuICAgIC8vIGdldCByaWQgb2YgKHBvdGVudGlhbCkgaHRtbCBpbiB0aGUgZGVzY3JpcHRpb25cclxuICAgIGRhdGEuZGVzY3JpcHRpb24gPSBfLmVzY2FwZShkYXRhLmRlc2NyaXB0aW9uKTtcclxuICAgIC8vIHNvbWUgcmVwb3MgZG9uJ3QgaGF2ZSBhIGxhbmd1YWdlIGFwcGFyZW50bHlcclxuICAgIGRhdGEubGFuZ3VhZ2UgPSBkYXRhLmxhbmd1YWdlIHx8ICdVbmtub3duJztcclxuICAgIC8vIHJlZmVyZW5jZSBvdXIgZGF0YVxyXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcclxuXHJcbiAgICAvLyBjb25zdHJ1Y3Qgdmlld1xyXG4gICAgdGhpcy4kZWwgPSAkKEdpdGh1YlJlcG9MaXN0SXRlbS50ZW1wbGF0ZShkYXRhKSk7XHJcbiAgICAvLyBiaW5kIGhhbmRsZXJcclxuICAgIHRoaXMuJGVsLm9uKCdjbGljaycsICcudGl0bGUnLCB0aGlzLmNsaWNrLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgY2xpY2soKSB7XHJcbiAgICB0aGlzLiRlbC50b2dnbGVDbGFzcygnbWluaW1pemVkJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBiZWNhdXNlIHRoZSBodG1sIHRoYXQgY29udGFpbnMgb3VyIHRlbXBsYXRlIGlzbid0IGZ1bGx5IGxvYWRlZCB5ZXQgKHNpbmNlIHRoaXMgc2NyaXB0IGlzIGluIHRoZSBoZWFkKVxyXG4vLyB3YWl0IGFuZCBnZXQgdGhlIHRlbXBsYXRlIHdoZW4gaXQncyBhdmFpbGFibGVcclxuLy8gaW4gYSByZWFsIGFwcGxpY2F0aW9uLCB0aGlzIHdvdWxkIGVpdGhlciBiZSBpbmxpbmUgKHBvbHltZXIgb3IgcmVhY3QpXHJcbi8vIG9yIGZldGNoZWQgZm9yIHVzIChhbmd1bGFyLCBldGMpXHJcbi8vIGFsdGVybmF0aXZlbHksIHRoaXMgc2NyaXB0IGNvdWxkIGJlIHBsYWNlZCBhdCB0aGUgZW5kIG9mIHRoZSBodG1sIDxib2R5Piwgb3Igd2UgY291bGQgcGFzdGUgdGhlIHRlbXBsYXRlIGlubGluZSBhcyBhIHN0cmluZyBoZXJlXHJcbiQoZG9jdW1lbnQpLm9uKCdyZWFkeScsICgpID0+IHtcclxuICBHaXRodWJSZXBvTGlzdEl0ZW0udGVtcGxhdGUgPSBfLnRlbXBsYXRlKCQoJyN0ZW1wbGF0ZS1HaXRodWJSZXBvTGlzdEl0ZW0nKS5odG1sKCkpO1xyXG59KTtcclxuIiwiXHJcbi8vIG91ciBjdXN0b20gSW5wdXQgJ2NvbXBvbmVudCcgdG8gd3JhcCBvdXIgaW5wdXQgZWxlbWVudCBtYW5hZ2VtZW50IHdpdGhcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5wdXQge1xyXG5cclxuICBjb25zdHJ1Y3RvcigkZWxlbWVudCwgaGFuZGxlcikge1xyXG5cclxuICAgIHRoaXMuJHJvb3QgPSAkZWxlbWVudDtcclxuXHJcbiAgICB0aGlzLiR0ZXh0ID0gdGhpcy4kcm9vdC5maW5kKCdpbnB1dFt0eXBlPVwidGV4dFwiXScpO1xyXG4gICAgdGhpcy4kYnV0dG9uID0gdGhpcy4kcm9vdC5maW5kKCdidXR0b24nKTtcclxuXHJcbiAgICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRoaXMuYmluZChoYW5kbGVyKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9nZXRWYWwoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4kdGV4dC52YWwoKTtcclxuICB9XHJcblxyXG4gIC8vIGJpbmQgYSBoYW5kbGVyIGZvciB0aGlzIGlucHV0IGNvbXBvbmVudFxyXG4gIC8vIGNob3NlIG5vdCB0byB1c2UgZm9ybXMgZm9yIHRoaXMgZm9yIHNvbWUgcmVhc29uXHJcbiAgYmluZChoYW5kbGVyKSB7XHJcbiAgICAvLyBiaW5kIHRvIHRleHQgZWxlbWVudFxyXG4gICAgdGhpcy4kdGV4dC5vbigna2V5cHJlc3MnLCAoZXZlbnQpID0+IHtcclxuICAgICAgY29uc3QgdmFsID0gdGhpcy5fZ2V0VmFsKCk7XHJcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMyAmJiB2YWwubGVuZ3RoKSB7XHJcbiAgICAgICAgaGFuZGxlcih2YWwpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vIGJpbmQgdG8gYnV0dG9uXHJcbiAgICB0aGlzLiRidXR0b24ub24oJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIGNvbnN0IHZhbCA9IHRoaXMuX2dldFZhbCgpO1xyXG4gICAgICBpZiAodmFsLmxlbmd0aCkge1xyXG4gICAgICAgIGhhbmRsZXIodmFsKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyBzb21lIGNsZWFudXAgZnVuY3Rpb25zIHRoYXQgd2UgbmV2ZXIgdXNlXHJcbiAgdW5iaW5kKCkge1xyXG4gICAgdGhpcy4kdGV4dC5vZmYoKTtcclxuICAgIHRoaXMuJGJ1dHRvbi5vZmYoKTtcclxuICB9XHJcblxyXG4gIHJlbW92ZSgpIHtcclxuICAgIHRoaXMudW5iaW5kKCk7XHJcbiAgICB0aGlzLiRyb290LnJlbW92ZSgpO1xyXG4gIH1cclxufVxyXG4iLCIvLyBnZW5lcmljIGxpc3QgY2xhc3NcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGlzdCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCRlbGVtZW50LCBpdGVtVmlldykge1xyXG4gICAgdGhpcy4kcm9vdCA9ICRlbGVtZW50O1xyXG5cclxuICAgIHRoaXMuaXRlbXMgPSBbXTtcclxuICAgIHRoaXMuaXRlbVZpZXcgPSBpdGVtVmlldztcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgc2V0KG5ld0l0ZW1zKSB7XHJcbiAgICB0aGlzLml0ZW1zID0gbmV3SXRlbXMubWFwKChpdGVtKSA9PiBuZXcgdGhpcy5pdGVtVmlldyhpdGVtKSk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICB0aGlzLiRyb290LmNoaWxkcmVuKCkucmVtb3ZlKCk7XHJcblxyXG4gICAgaWYgKCF0aGlzLml0ZW1zLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gdGhpcy4kcm9vdC5hcHBlbmQoJzxkaXYgY2xhc3M9XCJsaXN0LWl0ZW1cIj5Ob3RoaW5nIHlldCE8L2Rpdj4nKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiRyb290LmFwcGVuZCh0aGlzLml0ZW1zLm1hcCgoaXRlbSkgPT4gaXRlbS4kZWwpKTtcclxuICB9XHJcblxyXG4gIGNsZWFyKCkge1xyXG4gICAgdGhpcy5pdGVtcy5sZW5ndGggPSAwO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuICB9XHJcbn1cclxuIiwiLy8gcXVpY2sgYW5kIGRpcnR5IG1vZGFsc1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RhbCB7XHJcblxyXG4gIHN0YXRpYyB0ZW1wbGF0ZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIHRoaXMuJGVsID0gJChNb2RhbC50ZW1wbGF0ZSh7XHJcbiAgICAgIG1lc3NhZ2U6IGRhdGEubWVzc2FnZSA/IGRhdGEubWVzc2FnZSA6IGRhdGEucmVzcG9uc2VKU09OID8gZGF0YS5yZXNwb25zZUpTT04ubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJyxcclxuICAgIH0pKTtcclxuXHJcbiAgICB0aGlzLiRlbC5vbignY2xpY2snLCB0aGlzLmNsaWNrLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgY2xpY2soKSB7XHJcbiAgICB0aGlzLiRlbC5yZW1vdmUoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIHNhbWUgaGFjayBleHBsYWluZWQgaW4gR2l0aHViUmVwb0xpc3RJdGVtLmpzXHJcbiQoZG9jdW1lbnQpLm9uKCdyZWFkeScsICgpID0+IHtcclxuICBNb2RhbC50ZW1wbGF0ZSA9IF8udGVtcGxhdGUoJCgnI3RlbXBsYXRlLU1vZGFsJykuaHRtbCgpKTtcclxufSk7XHJcbiIsIi8vIHdyYXBwZXIgZm9yIG91ciBwYWdpbmF0aW9uIGxvZ2ljXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhZ2luYXRvciB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCRlbGVtZW50LCBoYW5kbGVyKSB7XHJcbiAgICB0aGlzLiRyb290ID0gJGVsZW1lbnQ7XHJcbiAgICB0aGlzLmhhbmRsZXIgPSBoYW5kbGVyO1xyXG5cclxuICAgIHRoaXMuJG5leHQgPSB0aGlzLiRyb290LmZpbmQoJy5uZXh0Jyk7XHJcbiAgICB0aGlzLiRwcmV2ID0gdGhpcy4kcm9vdC5maW5kKCcucHJldmlvdXMnKTtcclxuICAgIHRoaXMuJG5leHQub24oJ2NsaWNrJywgdGhpcy5nZXROZXh0LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy4kcHJldi5vbignY2xpY2snLCB0aGlzLmdldFByZXYuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gc3RhdGVcclxuICAgIHRoaXMuY3VycmVudFF1ZXJ5ID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IDE7XHJcbiAgfVxyXG5cclxuICAvLyBzb21lIGZ1biB3aXRoIGVzNiBzZXR0ZXJzIHRvIGhhbmRsZSB0aGUgdWkgY2hhbmdlc1xyXG4gIHNldCBoYXNQcmV2KHZhbHVlKSB7XHJcbiAgICB0aGlzLiRwcmV2LmF0dHIoJ2Rpc2FibGVkJywgIXZhbHVlKTtcclxuICB9XHJcblxyXG4gIHNldCBoYXNOZXh0KHZhbHVlKSB7XHJcbiAgICB0aGlzLiRuZXh0LmF0dHIoJ2Rpc2FibGVkJywgIXZhbHVlKTtcclxuICB9XHJcblxyXG4gIC8vIGhhbmRsZXJzIGZvciBvdXIgcHJldmlvdXMvbmV4dCBidXR0b25zXHJcbiAgZ2V0TmV4dCgpIHtcclxuICAgIC8vIHNvIHdlIGNhbid0IHNwYW0gdGhlIGJ1dHRvbiB3aGlsZSBpdCdzIGxvYWRpbmcuLi5cclxuICAgIHRoaXMuJG5leHQuYWRkKHRoaXMuJHByZXYpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XHJcbiAgICB0aGlzLmhhbmRsZXIoKyt0aGlzLmN1cnJlbnRQYWdlLCB0aGlzLmN1cnJlbnRRdWVyeSk7XHJcbiAgfVxyXG4gIGdldFByZXYoKSB7XHJcbiAgICB0aGlzLiRuZXh0LmFkZCh0aGlzLiRwcmV2KS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xyXG4gICAgdGhpcy5oYW5kbGVyKC0tdGhpcy5jdXJyZW50UGFnZSwgdGhpcy5jdXJyZW50UXVlcnkpO1xyXG4gIH1cclxufVxyXG4iLCIvLyB3cmFwcGVyIGZvciBvdXIgdGVybWluYWwtbGlrZSBzcGlubmVyXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwaW5uZXIge1xyXG4gIGNvbnN0cnVjdG9yKCRlbGVtZW50KSB7XHJcbiAgICB0aGlzLiRyb290ID0gJGVsZW1lbnQ7XHJcbiAgfVxyXG4gIHNwaW4oKSB7XHJcbiAgICB0aGlzLiRyb290LmFkZENsYXNzKCdzcGluJyk7XHJcbiAgfVxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLiRyb290LnJlbW92ZUNsYXNzKCdzcGluJyk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBBcHAgZnJvbSAnLi9BcHAuanMnO1xyXG5cclxud2luZG93LkFwcCA9IEFwcDtcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcclxuICBjb25zb2xlLmRpcihBcHApO1xyXG4gIEFwcC5zdGFydChkb2N1bWVudC5ib2R5KTtcclxufSk7XHJcbiJdfQ==
