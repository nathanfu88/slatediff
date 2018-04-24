import assert from 'assert'
import slateDiff from '../src/slateDiff'
import { pathConv } from '../src/slateDiff'
import { Value, Block, resetKeyGenerator } from 'slate'

describe('pathConv', function () {
  const p = '/nodes/2/nodes/0/characters/11/text'
  const { path, offset } = pathConv(p)

  it('parses path pointer to Slate path', function () {
    const expected = [2, 0]

    assert.deepEqual(path, expected)
  })

  it('parses path pointer to Slate offset', function () {
    const expected = 11

    assert.equal(offset, 11)
  })
})

describe('slateDiff', function() {
  const v1 = Value.fromJSON({
    document: {
      nodes: [
        {
          object: 'block',
          type: 'paragraph',
          nodes: [
            {
              object: 'text',
              leaves: [
                {
                  text: 'A line of text in a paragraph.'
                }
              ]
            }
          ]
        }
      ]
    }
  })

  it('handles RFC 6902 add operation for text in a node', function() {
    const v2 = Value.fromJSON({
      document: {
        nodes: [
          {
            object: 'block',
            type: 'paragraph',
            nodes: [
              {
                object: 'text',
                leaves: [
                  {
                    text: 'A line of text in a xparagraph.'
                  }
                ]
              }
            ]
          }
        ]
      }
    })
    const expected = [{
      type: 'insert_text',
      path: [0, 0],
      offset: 20,
      text: 'x',
      marks: []
    }]

    const ops = slateDiff(v1, v2)
    
    assert.deepEqual(ops, expected)
  })

  it('handles RFC 6902 add operation for a new node', function() {
    const node = {
      object: 'block',
      type: 'paragraph',
      nodes: [
        {
          object: 'text',
          leaves: [
            {
              text: 'a'
            }
          ]
        }
      ]
    }
    const v2 = Value.fromJSON({
      document: {
        nodes: [
          {
            object: 'block',
            type: 'paragraph',
            nodes: [
              {
                object: 'text',
                leaves: [
                  {
                    text: 'A line of text in a paragraph.'
                  }
                ]
              }
            ]
          },
          node
        ]
      }
    })

    resetKeyGenerator()
    const expected = [{
      type: 'insert_node',
      path: [1],
      node: Block.fromJSON(node)
    }]

    resetKeyGenerator()
    const ops = slateDiff(v1, v2)
    
    assert.deepEqual(ops, expected)
  })

  it('handles RFC 6902 remove operation', function() {
    const v2 = Value.fromJSON({
      document: {
        nodes: [
          {
            object: 'block',
            type: 'paragraph',
            nodes: [
              {
                object: 'text',
                leaves: [
                  {
                    text: 'A line of text in a aragraph.'
                  }
                ]
              }
            ]
          }
        ]
      }
    })
    const expected = [{
      type: 'remove_text',
      path: [0, 0],
      offset: 20,
      text: '*',
      marks: []
    }]

    const ops = slateDiff(v1, v2)
    
    assert.deepEqual(ops, expected)
  })

  it('handles RFC 6902 replace operation', function() {
    const v2 = Value.fromJSON({
      document: {
        nodes: [
          {
            object: 'block',
            type: 'paragraph',
            nodes: [
              {
                object: 'text',
                leaves: [
                  {
                    text: 'A line of test in a paragraph.'
                  }
                ]
              }
            ]
          }
        ]
      }
    })
    const expected = [{
      type: 'remove_text',
      path: [0, 0],
      offset: 12,
      text: '*',
      marks: []
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 12,
      text: 's',
      marks: []
    }]

    const ops = slateDiff(v1, v2)
    
    assert.deepEqual(ops, expected)
  })

  it('flattens returns operations properly', function() {
    const v2 = Value.fromJSON({
      document: {
        nodes: [
          {
            object: 'block',
            type: 'paragraph',
            nodes: [
              {
                object: 'text',
                leaves: [
                  {
                    text: 'A line of test in a aragraph.'
                  }
                ]
              }
            ]
          }
        ]
      }
    })
    const expected = [{
      type: 'remove_text',
      path: [0, 0],
      offset: 12,
      text: '*',
      marks: []
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 12,
      text: 's',
      marks: []
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 20,
      text: '*',
      marks: []
    }]

    const ops = slateDiff(v1, v2)
    
    assert.deepEqual(ops, expected)
  })

  // TODO: RFC 6902 operations move, copy
})