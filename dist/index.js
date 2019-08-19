"use strict";

var _jsonapi = _interopRequireDefault(require("./model/jsonapi"));

var _jsonapi2 = _interopRequireDefault(require("./mapper/jsonapi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

module.exports = {
  JSONAPIRecord: _jsonapi["default"],
  JSONAPIMapper: _jsonapi2["default"]
};