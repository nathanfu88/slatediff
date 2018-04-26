import diff from './diff'
import { Value, Block } from 'slate'

// TODO: Move to path.js
export function pathConv(pathStr) {
  const result = pathStr.match(/\d+/g).map(v => {
    return parseInt(v, 10)
  })
  let path = result.slice(0, result.length-1)
  const offset = result[result.length-1]

  // Handle single node path
  if (path.length === 0) { path = [ offset ] }

  return { path, offset }
}

function slateRemoveTextOp(path, offset) {
  return {
    type: 'remove_text',
    path: path,
    offset: offset,
    text: '*',
    // TODO: How are marks handled?
    marks: []
  }
}

function slateRemoveNodeOp(path, node) {
  return {
    type: 'remove_node',
    path: path,
    node: node
  }
}

function slateAddTextOp(path, offset, value) {
  return {
    type: 'insert_text',
    path: path,
    offset: offset,
    text: value,
    // TODO: Get marks from `value`
    marks: []
  }
}

function slateAddNodeOp(path, offset, value) {
  return {
    type: 'insert_node',
    path: path,
    node: Block.fromJSON(value.toJSON())
  }
}

export default function slateDiff(value1, value2) {
  const differences = diff(value1.document, value2.document)

  const slateOps = differences.map((d) => {
    const op = d.get('op')
    const { path, offset } = pathConv(d.get('path'))
    if (op === 'remove') {
      if (path.length === 1) {
        // If path length is 1, offset = path[0]
        return slateRemoveNodeOp(path, value1.document.nodes.get(offset))
      }
      else {
        return slateRemoveTextOp(path, offset)
      }
    }
    else if (op === 'add') {
      const value = d.get('value')
      // Safe to assume value has .object?
      const obj = value.object
      if (obj === 'character') {
        return slateAddTextOp(path, offset, value.text)
      }
      else if (obj === 'block') {
        return slateAddNodeOp(path, offset, value)
      }
      else {
        console.error('Unhandled value.object type ', obj)
        return
      }
    }
    else if (op === 'replace') {
      const value = d.get('value')
      return [
        slateRemoveTextOp(path, offset), slateAddTextOp(path, offset, value)
      ]
    }
    else {
      console.error('Unhandled operation ', op)
      return
    }
  })

  // Flatten for `replace`
  return [].concat(...slateOps.toJS())
}