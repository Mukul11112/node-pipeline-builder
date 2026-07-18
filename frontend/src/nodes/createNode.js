// createNode.js
// Turns a plain config object into a fully wired React Flow node:
// state is kept in the Zustand store (so submit.js sees it),
// fields are rendered declaratively, handles come from the config.
//
// A new node type costs one config object. No JSX required.

import { useEffect } from 'react';
import { useStore } from '../store';
import { BaseNode } from './BaseNode';
import { NodeField } from './NodeField';

const resolve = (value, ctx) => (typeof value === 'function' ? value(ctx) : value);

export const createNode = (config) => {
  const NodeComponent = ({ id, data }) => {
    const updateNodeField = useStore((s) => s.updateNodeField);
    const fields = resolve(config.fields, { id, data }) ?? [];

    // Seed defaults into the store once, so an untouched node still
    // submits meaningful data.
    useEffect(() => {
      fields.forEach((f) => {
        if (data?.[f.key] === undefined && f.default !== undefined) {
          updateNodeField(id, f.key, resolve(f.default, { id, data }));
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const ctx = { id, data };

    return (
      <BaseNode
        title={resolve(config.title, ctx)}
        icon={config.icon}
        accent={config.accent}
        description={resolve(config.description, ctx)}
        handles={resolve(config.handles, ctx) ?? []}
        width={config.width}
      >
        {fields.map((field) => (
          <NodeField
            key={field.key}
            field={field}
            value={data?.[field.key] ?? resolve(field.default, ctx)}
            onChange={(v) => updateNodeField(id, field.key, v)}
          />
        ))}
        {config.render?.(ctx)}
      </BaseNode>
    );
  };

  NodeComponent.displayName = `${config.type}Node`;
  return NodeComponent;
};
