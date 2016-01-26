'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _parser = require('./parser/parser');

var _parser2 = _interopRequireDefault(_parser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = process.argv[2] || '8080';
var jquery = _fs2.default.readFileSync("./node_modules/jquery/dist/jquery.js", "utf-8");

_http2.default.createServer((function () {
	var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
		var url_parts, query, content, parser, data;
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						url_parts = _url2.default.parse(req.url, true);
						query = url_parts.query;

						if (query.url) {
							_context.next = 4;
							break;
						}

						return _context.abrupt('return', respondJSON(res, 400, {
							error: "URL has to be provided"
						}));

					case 4:
						_context.prev = 4;
						_context.next = 7;
						return getPageContent(query.url);

					case 7:
						content = _context.sent;
						_context.next = 13;
						break;

					case 10:
						_context.prev = 10;
						_context.t0 = _context['catch'](4);

						respondJSON(res, 400, {
							error: _context.t0.toString()
						});

					case 13:
						parser = new _parser2.default(content);
						data = parser.data;

						respondJSON(res, 200, data);

					case 16:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this, [[4, 10]]);
	}));
	return function (_x, _x2) {
		return ref.apply(this, arguments);
	};
})()).listen(port);

function respondJSON(res, status, data) {
	res.writeHead(status, {
		'Content-Type': 'application/json;charset=utf-8	',
		'Access-Control-Allow-Origin': '*'
	});
	res.write((0, _stringify2.default)(data));
	res.end();
}

function getPageContent(url) {
	return new _promise2.default(function (resolve, reject) {
		_jsdom2.default.env({
			url: url,
			src: [jquery],
			done: function done(err, window) {

				if (err) {
					reject(err);
				} else {
					resolve(window);
				}
			}
		});
	});
}