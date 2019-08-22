"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _jsData = require("js-data");

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var JSONAPIMapper =
/*#__PURE__*/
function (_Mapper) {
  _inherits(JSONAPIMapper, _Mapper);

  function JSONAPIMapper() {
    _classCallCheck(this, JSONAPIMapper);

    return _possibleConstructorReturn(this, _getPrototypeOf(JSONAPIMapper).apply(this, arguments));
  }

  _createClass(JSONAPIMapper, [{
    key: "buildDocuments",
    value: function buildDocuments(records) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var documents = {
        data: []
      };
      var included = [];
      records.forEach(function (record) {
        var document = record.buildDocument(options);
        documents.data.push(document.data);

        if (!_lodash["default"].isEmpty(document.included)) {
          document.included.forEach(function (include) {
            if (!_lodash["default"].find(included, {
              id: include.id,
              type: include.type
            })) {
              included.push(include);
            }
          });
        }
      });

      if (!_lodash["default"].isEmpty(included)) {
        documents.included = included;
      }

      return documents;
    }
  }]);

  return JSONAPIMapper;
}(_jsData.Mapper);

var _default = JSONAPIMapper;
exports["default"] = _default;