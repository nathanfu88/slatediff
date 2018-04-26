'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pathConv = pathConv;
exports.default = slateDiff;

var _diff = require('./diff');

var _diff2 = _interopRequireDefault(_diff);

var _slate = require('slate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// TODO: Move to path.js
function pathConv(pathStr) {
  var result = pathStr.match(/\d+/g).map(function (v) {
    return parseInt(v, 10);
  });
  var path = result.slice(0, result.length - 1);
  var offset = result[result.length - 1];

  // Handle single node path
  if (path.length === 0) {
    path = [offset];
  }

  return { path: path, offset: offset };
}

function slateRemoveTextOp(path, offset) {
  return {
    type: 'remove_text',
    path: path,
    offset: offset,
    text: '*',
    // TODO: How are marks handled?
    marks: []
  };
}

function slateRemoveNodeOp(path, node) {
  return {
    type: 'remove_node',
    path: path,
    node: node
  };
}

function slateAddTextOp(path, offset, value) {
  return {
    type: 'insert_text',
    path: path,
    offset: offset,
    text: value,
    // TODO: Get marks from `value`
    marks: []
  };
}

function slateAddNodeOp(path, offset, value) {
  return {
    type: 'insert_node',
    path: path,
    node: _slate.Block.fromJSON(value.toJSON())
  };
}

function slateDiff(value1, value2) {
  var _ref;

  var differences = (0, _diff2.default)(value1.document, value2.document);

  var slateOps = differences.map(function (d) {
    var op = d.get('op');

    var _pathConv = pathConv(d.get('path')),
        path = _pathConv.path,
        offset = _pathConv.offset;

    if (op === 'remove') {
      if (path.length === 1) {
        // If path length is 1, offset = path[0]
        return slateRemoveNodeOp(path, value1.document.nodes.get(offset));
      } else {
        return slateRemoveTextOp(path, offset);
      }
    } else if (op === 'add') {
      var value = d.get('value');
      // Safe to assume value has .object?
      var obj = value.object;
      if (obj === 'character') {
        return slateAddTextOp(path, offset, value.text);
      } else if (obj === 'block') {
        return slateAddNodeOp(path, offset, value);
      } else {
        console.error('Unhandled value.object type ', obj);
        return;
      }
    } else if (op === 'replace') {
      var _value = d.get('value');
      return [slateRemoveTextOp(path, offset), slateAddTextOp(path, offset, _value)];
    } else {
      console.error('Unhandled operation ', op);
      return;
    }
  });

  // Flatten for `replace`
  return (_ref = []).concat.apply(_ref, _toConsumableArray(slateOps.toJS()));
}
//# sourceMappingURL=slateDiff.js.map