// submit.js
// Part 4. Sends the live pipeline to FastAPI and reports back.

import { useState } from 'react';
import { useStore } from './store';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

export const SubmitButton = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Read straight from the store at click time — no stale snapshot.
    const { nodes, edges } = useStore.getState();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error(`Server responded ${response.status}`);
      }

      const { num_nodes, num_edges, is_dag } = await response.json();

      alert(
        [
          'Pipeline submitted',
          '',
          `Nodes: ${num_nodes}`,
          `Connections: ${num_edges}`,
          '',
          is_dag
            ? 'This pipeline is a valid DAG — it runs start to finish with no loops.'
            : 'This pipeline is not a DAG — there is a cycle, so it would never finish. Remove a connection that loops back.',
        ].join('\n')
      );
    } catch (error) {
      alert(
        `Could not reach the pipeline service at ${API_BASE}.\n\n` +
        `${error.message}\n\nStart the backend with: uvicorn main:app --reload`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button className="submit-button" onClick={handleSubmit} disabled={isSubmitting}>
      {isSubmitting ? 'Checking…' : 'Submit pipeline'}
    </button>
  );
};
