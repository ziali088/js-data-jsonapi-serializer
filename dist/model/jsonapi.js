"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _jsData = require("js-data");

var _lodash = _interopRequireDefault(require("lodash"));

var _pluralize = _interopRequireDefault(require("pluralize"));

var _ajv = _interopRequireDefault(require("ajv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _buildRelationshipLinkObject = Symbol('_buildRelationshipLinkObject');

var _buildRelationshipIncludes = Symbol('_buildRelationshipIncludes');

var _isHasManyRelationship = Symbol('_isHasManyRelationship');

var JSONAPIRecord =
/*#__PURE__*/
function (_Record) {
  _inherits(JSONAPIRecord, _Record);

  function JSONAPIRecord() {
    var _this;

    _classCallCheck(this, JSONAPIRecord);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(JSONAPIRecord).apply(this, arguments));
    var ajv = new _ajv["default"]();
    var valid = ajv.validate(JSONAPIRecord.jsonapiSchema, _this.specification);

    if (!valid) {
      throw new Error("Specification error: ".concat(ajv.errors.map(function (err) {
        return "\"".concat(err.schemaPath, "\" => ").concat(err.message);
      }).join(', ')));
    }

    return _this;
  }

  _createClass(JSONAPIRecord, [{
    key: "buildDocument",
    value: function buildDocument() {
      var _this2 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var include = options.include;
      var baseUrl = options.baseUrl || '';
      var attributes = {};
      this.specification.attributes.forEach(function (attr) {
        attributes[attr] = _this2[attr];
      });

      if (this.specification.kebabCaseAttrs) {
        attributes = _lodash["default"].mapKeys(attributes, function (val, key) {
          return _lodash["default"].kebabCase(key);
        });
      }

      var document = {
        data: {
          id: this.id,
          type: _pluralize["default"].plural(this.specification.type),
          attributes: attributes
        }
      };

      if (_lodash["default"].isEmpty(include)) {
        return document;
      }

      var relationships = {};
      document.included = [];
      include.forEach(function (name) {
        var relationOptions = {
          baseUrl: baseUrl
        };
        var relation = name;
        var relationIncludes = [];

        if (_lodash["default"].isObject(name)) {
          var _$flatten = _lodash["default"].flatten(_lodash["default"].toPairs(name));

          var _$flatten2 = _slicedToArray(_$flatten, 2);

          relation = _$flatten2[0];
          relationIncludes = _$flatten2[1];
          relationOptions.include = relationIncludes;
        }

        relationships[relation] = _this2[_buildRelationshipLinkObject](relation, baseUrl);

        _this2[_buildRelationshipIncludes](relation, relationOptions).forEach(function (inc) {
          return document.included.push(inc);
        });
      });
      document.data.relationships = relationships;
      return document;
    }
  }, {
    key: _buildRelationshipIncludes,
    value: function value(relationName) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var included = [];

      if (this[_isHasManyRelationship](this, relationName)) {
        this[relationName].forEach(function (record) {
          var document = record.buildDocument(options);
          included.push(document.data);
          (document.included || []).forEach(function (include) {
            return included.push(include);
          });
        });
      } else {
        var document = this[relationName].buildDocument(options);
        included.push(document.data);
        (document.included || []).forEach(function (include) {
          return included.push(include);
        });
      }

      return included;
    }
  }, {
    key: _buildRelationshipLinkObject,
    value: function value(relationName, baseUrl) {
      var relationship = this[relationName];

      var modelType = _pluralize["default"].plural(this.specification.type);

      var type = _pluralize["default"].plural(relationName);

      var links = {
        self: "".concat(baseUrl, "/").concat(modelType, "/").concat(this.id, "/relationships/").concat(relationName),
        related: "".concat(baseUrl, "/").concat(modelType, "/").concat(this.id, "/").concat(relationName)
      };

      if (this[_isHasManyRelationship](this, relationName)) {
        var _data = relationship.map(function (relation) {
          return {
            type: type,
            id: relation.id
          };
        });

        return {
          data: _data,
          links: links
        };
      }

      var data = {
        type: type,
        id: relationship.id
      };
      return {
        data: data,
        links: links
      };
    }
  }, {
    key: _isHasManyRelationship,
    value: function value(model, relationName) {
      if (_lodash["default"].hasIn(model.mapper.relations, "hasMany.".concat(_pluralize["default"].singular(relationName)))) {
        return true;
      }

      return false;
    }
  }, {
    key: "mapper",
    get: function get() {
      return this._mapper();
    }
  }], [{
    key: "jsonapiSchema",
    get: function get() {
      return {
        type: 'object',
        properties: {
          type: {
            type: 'string'
          },
          attributes: {
            type: 'array',
            items: {
              type: 'string'
            },
            uniqueItems: true
          },
          kebabCaseAttrs: {
            type: 'boolean'
          }
        },
        required: ['type', 'attributes']
      };
    }
  }]);

  return JSONAPIRecord;
}(_jsData.Record);

var _default = JSONAPIRecord;
exports["default"] = _default;