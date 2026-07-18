// nodes/index.js
// Every node in the app, declared as data.
// Four originals, five new ones, plus the hand-written Text node.

import { createNode } from './createNode';
import { TextNode } from './TextNode';

const nodeConfigs = [
  {
    type: 'customInput',
    label: 'Input',
    icon: '↓',
    accent: 'var(--accent-io)',
    group: 'Start & end',
    title: 'Input',
    fields: ({ id }) => [
      { key: 'inputName', label: 'Name', default: id.replace('customInput-', 'input_') },
      {
        key: 'inputType',
        label: 'Type',
        type: 'select',
        default: 'Text',
        options: [
          { value: 'Text', label: 'Text' },
          { value: 'File', label: 'File' },
        ],
      },
    ],
    handles: ({ id }) => [
      { id: `${id}-value`, type: 'source', side: 'right', label: 'value' },
    ],
  },

  {
    type: 'customOutput',
    label: 'Output',
    icon: '↑',
    accent: 'var(--accent-io)',
    group: 'Start & end',
    title: 'Output',
    fields: ({ id }) => [
      { key: 'outputName', label: 'Name', default: id.replace('customOutput-', 'output_') },
      {
        key: 'outputType',
        label: 'Type',
        type: 'select',
        default: 'Text',
        options: [
          { value: 'Text', label: 'Text' },
          { value: 'Image', label: 'Image' },
        ],
      },
    ],
    handles: ({ id }) => [
      { id: `${id}-value`, type: 'target', side: 'left', label: 'value' },
    ],
  },

  {
    type: 'llm',
    label: 'LLM',
    icon: '✦',
    accent: 'var(--accent-llm)',
    group: 'Models',
    title: 'LLM',
    fields: [
      {
        key: 'model',
        label: 'Model',
        type: 'select',
        default: 'gpt-4o',
        options: [
          { value: 'gpt-4o', label: 'GPT-4o' },
          { value: 'claude-sonnet', label: 'Claude Sonnet' },
          { value: 'llama-3', label: 'Llama 3' },
        ],
      },
      { key: 'temperature', label: 'Temperature', type: 'number', default: 0.7, min: 0, max: 2, step: 0.1 },
    ],
    handles: ({ id }) => [
      { id: `${id}-system`, type: 'target', side: 'left', label: 'system' },
      { id: `${id}-prompt`, type: 'target', side: 'left', label: 'prompt' },
      { id: `${id}-response`, type: 'source', side: 'right', label: 'response' },
    ],
  },

  // ── Five new nodes. Each one is only its config. ──────────────────

  {
    type: 'filter',
    label: 'Filter',
    icon: '⚟',
    accent: 'var(--accent-logic)',
    group: 'Logic',
    title: 'Filter',
    description: 'Passes text through only when the condition holds.',
    fields: [
      {
        key: 'operator',
        label: 'Condition',
        type: 'select',
        default: 'contains',
        options: [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'startsWith', label: 'Starts with' },
          { value: 'matches', label: 'Matches regex' },
        ],
      },
      { key: 'value', label: 'Compare to', default: '', placeholder: 'urgent' },
      { key: 'caseSensitive', label: 'Case sensitive', type: 'checkbox', default: false },
    ],
    handles: ({ id }) => [
      { id: `${id}-input`, type: 'target', side: 'left', label: 'input' },
      { id: `${id}-pass`, type: 'source', side: 'right', label: 'pass' },
      { id: `${id}-fail`, type: 'source', side: 'right', label: 'fail' },
    ],
  },

  {
    type: 'math',
    label: 'Math',
    icon: '∑',
    accent: 'var(--accent-logic)',
    group: 'Logic',
    title: 'Math',
    fields: [
      {
        key: 'operation',
        label: 'Operation',
        type: 'select',
        default: 'add',
        options: [
          { value: 'add', label: 'Add' },
          { value: 'subtract', label: 'Subtract' },
          { value: 'multiply', label: 'Multiply' },
          { value: 'divide', label: 'Divide' },
        ],
      },
      { key: 'precision', label: 'Decimal places', type: 'number', default: 2, min: 0, max: 10 },
    ],
    handles: ({ id }) => [
      { id: `${id}-a`, type: 'target', side: 'left', label: 'a' },
      { id: `${id}-b`, type: 'target', side: 'left', label: 'b' },
      { id: `${id}-result`, type: 'source', side: 'right', label: 'result' },
    ],
  },

  {
    type: 'api',
    label: 'API',
    icon: '⇄',
    accent: 'var(--accent-data)',
    group: 'Data',
    title: 'API request',
    width: 260,
    fields: [
      {
        key: 'method',
        label: 'Method',
        type: 'select',
        default: 'GET',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' },
        ],
      },
      { key: 'url', label: 'URL', default: '', placeholder: 'https://api.example.com/v1' },
      { key: 'headers', label: 'Headers', type: 'textarea', default: '', placeholder: 'Authorization: Bearer ...' },
    ],
    handles: ({ id }) => [
      { id: `${id}-body`, type: 'target', side: 'left', label: 'body' },
      { id: `${id}-response`, type: 'source', side: 'right', label: 'response' },
      { id: `${id}-error`, type: 'source', side: 'right', label: 'error' },
    ],
  },

  {
    type: 'delay',
    label: 'Delay',
    icon: '◷',
    accent: 'var(--accent-data)',
    group: 'Data',
    title: 'Delay',
    description: 'Holds the run before passing the value on.',
    fields: [
      { key: 'duration', label: 'Wait', type: 'number', default: 5, min: 0 },
      {
        key: 'unit',
        label: 'Unit',
        type: 'select',
        default: 'seconds',
        options: [
          { value: 'seconds', label: 'Seconds' },
          { value: 'minutes', label: 'Minutes' },
          { value: 'hours', label: 'Hours' },
        ],
      },
    ],
    handles: ({ id }) => [
      { id: `${id}-input`, type: 'target', side: 'left', label: 'input' },
      { id: `${id}-output`, type: 'source', side: 'right', label: 'output' },
    ],
  },

  {
    type: 'note',
    label: 'Note',
    icon: '✎',
    accent: 'var(--accent-note)',
    group: 'Canvas',
    title: 'Note',
    // No handles at all — the shell handles that case without special-casing.
    fields: [
      { key: 'body', label: 'For your team', type: 'textarea', default: '', placeholder: 'Why this branch exists…' },
    ],
    handles: [],
  },

  {
    type: 'arrow',
    label: 'Arrow',
    icon: '➜',
    accent: 'var(--accent-note)',
    group: 'Canvas',
    title: 'Arrow',
    // A pure annotation, like Note: no handles. The glyph just rotates with
    // its one field, so the whole node stays data + a small render — no new
    // component needed.
    fields: [
      {
        key: 'direction',
        label: 'Point',
        type: 'select',
        default: 'right',
        options: [
          { value: 'right', label: 'Right →' },
          { value: 'downRight', label: 'Down-right ↘' },
          { value: 'down', label: 'Down ↓' },
          { value: 'downLeft', label: 'Down-left ↙' },
          { value: 'left', label: 'Left ←' },
          { value: 'upLeft', label: 'Up-left ↖' },
          { value: 'up', label: 'Up ↑' },
          { value: 'upRight', label: 'Up-right ↗' },
        ],
      },
    ],
    handles: [],
    render: ({ data }) => {
      const deg = {
        right: 0, downRight: 45, down: 90, downLeft: 135,
        left: 180, upLeft: 225, up: 270, upRight: 315,
      }[data?.direction ?? 'right'] ?? 0;
      return (
        <div className="arrow-node__glyph" style={{ transform: `rotate(${deg}deg)` }}>
          ➜
        </div>
      );
    },
  },
];

// Toolbar reads this; nodeTypes feeds React Flow.
export const nodeCatalog = [
  ...nodeConfigs.map(({ type, label, icon, accent, group }) => ({ type, label, icon, accent, group })),
  { type: 'text', label: 'Text', icon: 'T', accent: 'var(--accent-text)', group: 'Models' },
];

export const nodeTypes = {
  ...Object.fromEntries(nodeConfigs.map((c) => [c.type, createNode(c)])),
  text: TextNode,
};
