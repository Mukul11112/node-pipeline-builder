// TextNode.js
// Part 3. Two behaviours the config-driven factory can't express, so this
// node drops down to JSX — but still renders through BaseNode, so it
// inherits every style the other nodes get.
//
//  1. The node grows with its content.
//  2. `{{ variableName }}` in the text mints a target handle on the left.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useUpdateNodeInternals } from 'reactflow';
import { useStore } from '../store';
import { BaseNode } from './BaseNode';

// Matches {{ name }} where `name` is a legal JS identifier.
const VARIABLE_PATTERN = /\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g;

const RESERVED = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
  'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
  'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
  'let', 'static', 'enum', 'await', 'implements', 'package', 'protected',
  'interface', 'private', 'public', 'null', 'true', 'false',
]);

const extractVariables = (text) => {
  const found = [];
  for (const match of text.matchAll(VARIABLE_PATTERN)) {
    const name = match[1];
    if (!RESERVED.has(name) && !found.includes(name)) found.push(name);
  }
  return found;
};

const MIN_WIDTH = 240;
const MAX_WIDTH = 480;
const MIN_TEXT_HEIGHT = 64;
const MAX_TEXT_HEIGHT = 320;

export const TextNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const updateNodeInternals = useUpdateNodeInternals();

  const [text, setText] = useState(data?.text ?? '{{ input }}');
  const [size, setSize] = useState({ width: MIN_WIDTH, height: MIN_TEXT_HEIGHT });

  const textareaRef = useRef(null);
  const mirrorRef = useRef(null);

  const variables = useMemo(() => extractVariables(text), [text]);

  // Measure with a hidden mirror that shares the textarea's typography.
  // The textarea alone can only tell us about height (scrollHeight);
  // width has to come from a element that is free to grow.
  useLayoutEffect(() => {
    const mirror = mirrorRef.current;
    const textarea = textareaRef.current;
    if (!mirror || !textarea) return;

    mirror.textContent = text || ' ';
    const width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, mirror.scrollWidth + 40));

    textarea.style.height = 'auto';
    const height = Math.min(MAX_TEXT_HEIGHT, Math.max(MIN_TEXT_HEIGHT, textarea.scrollHeight));
    textarea.style.height = `${height}px`;

    setSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }, [text]);

  // Handles that appear or disappear must be announced, or React Flow keeps
  // drawing edges to their old coordinates.
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, variables, size.height, updateNodeInternals]);

  // Seed the default into the store so an untouched node still submits text.
  useEffect(() => {
    if (data?.text === undefined) updateNodeField(id, 'text', text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    setText(e.target.value);
    updateNodeField(id, 'text', e.target.value);
  };

  const handles = [
    ...variables.map((name) => ({
      id: `${id}-${name}`,
      type: 'target',
      side: 'left',
      label: name,
    })),
    { id: `${id}-output`, type: 'source', side: 'right', label: 'output' },
  ];

  return (
    <BaseNode
      title="Text"
      icon="T"
      accent="var(--accent-text)"
      handles={handles}
      width={size.width}
    >
      <label className="field">
        <span className="field__label">Text</span>
        <textarea
          ref={textareaRef}
          className="field__control field__control--area text-node__input"
          value={text}
          onChange={handleChange}
          spellCheck={false}
          placeholder="Write a prompt. Use {{ variable }} to pull in an input."
        />
      </label>

      <p className="text-node__hint">
        {variables.length === 0
          ? 'Type {{ name }} to add an input.'
          : `${variables.length} input${variables.length > 1 ? 's' : ''}: ${variables.join(', ')}`}
      </p>

      {/* Off-screen measuring element — same font metrics as the textarea. */}
      <span ref={mirrorRef} className="text-node__mirror" aria-hidden="true" />
    </BaseNode>
  );
};
