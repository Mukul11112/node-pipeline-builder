// BaseNode.js
// The single shell that every node renders through.
// Owns: card chrome, header, handle layout + labels, sizing.
// Knows nothing about what any individual node does.

import { Handle, Position } from 'reactflow';

const SIDE = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

// Handles on the same side are spread evenly: (i + 1) / (n + 1)
const offsetFor = (index, total) => `${((index + 1) / (total + 1)) * 100}%`;

export const BaseNode = ({
  title,
  icon,
  accent = 'var(--accent-default)',
  description,
  handles = [],
  width,
  style,
  children,
}) => {
  const bySide = handles.reduce((acc, h) => {
    const side = h.side || 'left';
    (acc[side] = acc[side] || []).push(h);
    return acc;
  }, {});

  return (
    <div className="node" style={{ '--node-accent': accent, width, ...style }}>
      <header className="node__header">
        <span className="node__icon" aria-hidden="true">{icon}</span>
        <span className="node__title">{title}</span>
      </header>

      <div className="node__body">
        {description && <p className="node__description">{description}</p>}
        {children}
      </div>

      {Object.entries(bySide).flatMap(([side, group]) =>
        group.map((handle, i) => {
          const vertical = side === 'left' || side === 'right';
          const offset = offsetFor(i, group.length);
          return (
            <Handle
              key={handle.id}
              id={handle.id}
              type={handle.type}
              position={SIDE[side]}
              className={`node__handle node__handle--${side}`}
              style={vertical ? { top: offset } : { left: offset }}
            >
              {handle.label && (
                <span className={`node__handle-label node__handle-label--${side}`}>
                  {handle.label}
                </span>
              )}
            </Handle>
          );
        })
      )}
    </div>
  );
};
