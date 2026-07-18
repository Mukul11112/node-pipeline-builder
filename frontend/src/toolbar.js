// toolbar.js

import { DraggableNode } from './draggableNode';
import { nodeCatalog } from './nodes';

// Group order is taken from first appearance in the catalog.
const groups = nodeCatalog.reduce((acc, node) => {
  (acc[node.group] = acc[node.group] || []).push(node);
  return acc;
}, {});

export const PipelineToolbar = () => (
  <aside className="palette">
    <div className="palette__brand">
      <span className="palette__mark">VS</span>
      <div>
        <p className="palette__name">Pipeline Builder</p>
        <p className="palette__hint">Drag a block onto the canvas</p>
      </div>
    </div>

    {Object.entries(groups).map(([group, items]) => (
      <section key={group} className="palette__group">
        <h2 className="palette__group-title">{group}</h2>
        <div className="palette__items">
          {items.map((node) => (
            <DraggableNode key={node.type} {...node} />
          ))}
        </div>
      </section>
    ))}
  </aside>
);
