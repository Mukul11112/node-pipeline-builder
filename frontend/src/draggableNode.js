// draggableNode.js

export const DraggableNode = ({ type, label, icon, accent }) => {
  const onDragStart = (event) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ nodeType: type })
    );
    event.dataTransfer.effectAllowed = 'move';
    event.currentTarget.style.cursor = 'grabbing';
  };

  return (
    <div
      className="palette-item"
      style={{ '--node-accent': accent }}
      onDragStart={onDragStart}
      onDragEnd={(event) => (event.currentTarget.style.cursor = 'grab')}
      draggable
      title={`Drag ${label} onto the canvas`}
    >
      <span className="palette-item__icon" aria-hidden="true">{icon}</span>
      <span className="palette-item__label">{label}</span>
    </div>
  );
};
