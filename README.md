# slate-diff

Experimental library that compares two [Slate](https://github.com/ianstormtaylor/slate) `Value`s and returns a list of Slate [operations](https://docs.slatejs.org/slate-core/operation) that can be applied with a `Change` to synchronize the two `Value`s.

## Use
This library is not published as an `npm` module yet. Add with direct url:

```
yarn add git://github.com/nathanfu88/slatediff.git
```

Use to compare two Values
```
const v1 = Value.fromJSON({ document: { nodes: [{ object: 'block', type: 'paragraph', nodes: [{ object: 'text', leaves: [{ text: 'A line of text in a paragraph.'}]}]}]}
const v2 = Value.fromJSON({ document: { nodes: [{ object: 'block', type: 'paragraph', nodes: [{ object: 'text', leaves: [{ text: 'A line of test in a paragraph.'}]}]}]}

const ops = slateDiff(v1, v2)
// [{ type: 'remove_text', path: [0, 0], offset: 12, text: '*', marks: []}, { type: 'insert_text', path: [0, 0], offset: 12, text: 's', marks: []}]
```

## Notes
- Does not handle `marks`
- Has not been extensively tested