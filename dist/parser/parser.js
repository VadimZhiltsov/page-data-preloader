'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mp4Regex = /video\/mp4/;
var Iconv = require('iconv').Iconv;
var charsetRegex = /charset=(\S+)$/;

var Parser = (function () {
    function Parser(window) {
        (0, _classCallCheck3.default)(this, Parser);

        try {
            this.window = window;
            this.$ = window.$;
            this.encoding = this.getCharset();
            this._translator = new Iconv(this.encoding, 'utf-8');

            this.data = this.parse();
        } catch (e) {
            console.error(e, e.stack);
        }
    }

    (0, _createClass3.default)(Parser, [{
        key: 'getCharset',
        value: function getCharset() {
            var charsetStr = this.$('meta[http-equiv="content-type"]').attr('content');
            var charsetFindings = charsetRegex.exec(charsetStr);

            return charsetFindings && charsetFindings.length ? charsetFindings[1] : 'utf-8';
        }
    }, {
        key: 'parse',
        value: function parse(camera) {
            var hash = {};

            this.parseDesctiption(hash);
            this.parseTitle(hash);
            this.parseImage(hash);
            this.parseVideo(hash);

            return hash;
        }
    }, {
        key: 'parseDesctiption',
        value: function parseDesctiption(hash) {
            var text = this.$('meta[name="description"]').attr('content');
            var description = this._translator.convert(text).toString();

            if (description) {
                hash.description = description;
            }
        }
    }, {
        key: 'parseTitle',
        value: function parseTitle(hash) {
            var text = this.$('title').text();
            var title = this._translator.convert(text).toString();

            if (title) {
                hash.title = title;
            }
        }
    }, {
        key: 'parseImage',
        value: function parseImage(hash) {
            var img = this.$('meta[property="og:image"]').text();

            if (!img) {
                img = this.$('img[rel="image_src"]').attr('src');
            }

            if (!img) {
                img = this.$('link[rel="shortcut icon"]').attr('href');
            }

            if (!img) {
                img = this.$('link[rel="image_src"]').attr('href');
            }

            if (typeof img === 'string' && img.indexOf('http') !== 0) {
                img = window.location.protocol + '//' + window.location.host + '/' + img;
            }

            hash.img = img;
        }
    }, {
        key: 'parseVideo',
        value: function parseVideo(hash) {
            var _this = this;

            var videoMeta = this.$('meta[property^="og:video"]');

            if (videoMeta.length) {
                var _ret = (function () {
                    var video = {};

                    videoMeta.toArray().forEach(function (item) {
                        var key = _this.$(item).attr('property').replace(/^og:video:/, '');
                        var value = _this.$(item).attr('content');

                        video[key] = value;
                    });

                    hash.video = video;

                    return {
                        v: undefined
                    };
                })();

                if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
            }

            var hasTwitterTag = mp4Regex.test(this.$('meta[name="twitter:player:stream:content_type"]').attr('content'));

            if (hasTwitterTag) {
                var videoUrl = this.$('meta[name="twitter:player:stream"]').attr('content');
                if (videoUrl) {
                    hash.video = {
                        url: videoUrl
                    };
                    return;
                }
            }
        }
    }]);
    return Parser;
})();

exports.default = Parser;