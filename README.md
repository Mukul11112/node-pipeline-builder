# VectorShift — Frontend Technical Assessment

## Running it

Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:
```bash
cd frontend
npm i
npm start
```

The frontend expects the backend on `http://localhost:8000`. Override with
`REACT_APP_API_BASE` if needed.

---

## Part 1 — Node abstraction

Three layers, each with one job:

| File | Responsibility |
| --- | --- |
| `nodes/BaseNode.js` | The card shell: header, body, handle placement and labelling. Every node renders through it, so a style change lands everywhere at once. |
| `nodes/NodeField.js` | One declarative field spec → one control. Adding a control type here makes it available to all nodes. |
| `nodes/createNode.js` | Factory: config object → wired React Flow component. State lives in the Zustand store, so `submit.js` sees whatever the user typed. |

A node is now **data**, not code. The whole Filter node:

```js
{
  type: 'filter',
  label: 'Filter',
  icon: '⚟',
  accent: 'var(--accent-logic)',
  group: 'Logic',
  title: 'Filter',
  description: 'Passes text through only when the condition holds.',
  fields: [
    { key: 'operator', label: 'Condition', type: 'select', default: 'contains', options: [...] },
    { key: 'value', label: 'Compare to', default: '' },
    { key: 'caseSensitive', label: 'Case sensitive', type: 'checkbox', default: false },
  ],
  handles: ({ id }) => [
    { id: `${id}-input`, type: 'target', side: 'left', label: 'input' },
    { id: `${id}-pass`, type: 'source', side: 'right', label: 'pass' },
    { id: `${id}-fail`, type: 'source', side: 'right', label: 'fail' },
  ],
}
```

All ten nodes live in `nodes/index.js`. Handles on a side are spread evenly by
the shell — a node never computes a `top: 33%` for itself again.

**The originals:** Input, Output and LLM are now pure configs.
**The five new ones:** Filter (two outputs), Math (two inputs), API (three
fields, three handles), Delay, and Note (zero handles — the shell handles that
case without a special branch).

Anything a config can't express drops to JSX but still renders through
`BaseNode`, so it inherits every style for free. `TextNode` is the only one that
needed to.

## Part 2 — Styling

Plain CSS with a token layer in `index.css`; no new dependencies. The direction
is a patchbay rather than a dashboard: dark instrument rail on the left, cool
grey bench, white cards, and every port named in mono so a wired pipeline reads
like a schematic. Node category is carried by a single `--node-accent` variable
that flows through the header wash, the icon chip, the handles, and the focus
ring — one variable per node, set in its config.

## Part 3 — Text node logic

- **Auto-resize.** Height comes from the textarea's `scrollHeight`. Width needs
  an element that's free to grow, so a hidden mirror span with identical font
  metrics is measured instead. Both clamp between a min and max.
- **Variables.** `{{ name }}` is matched with `/\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g`,
  reserved words are rejected, duplicates collapse to one handle.
  `useUpdateNodeInternals` fires whenever the handle set or node height changes —
  without it React Flow keeps drawing edges to stale coordinates.

## Part 4 — Backend integration

`submit.js` reads `useStore.getState()` at click time and POSTs `{nodes, edges}`
to `/pipelines/parse`. The alert reports counts and explains the DAG result in
plain terms; a failed fetch tells the user how to start the backend.

`main.py` adds CORS (the dev server is a different origin — the POST is
preflighted and fails without it), validates the body with Pydantic, and runs
Kahn's algorithm: a topological order that covers every node means no cycle.
Edges pointing at unknown nodes are ignored. Verified against acyclic, cyclic,
self-loop and empty pipelines.
