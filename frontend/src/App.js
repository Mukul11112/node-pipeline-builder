import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

function App() {
  return (
    <div className="app">
      <PipelineToolbar />
      <main className="workspace">
        <header className="workspace__bar">
          <div>
            <h1 className="workspace__title">Untitled pipeline</h1>
            <p className="workspace__subtitle">Draft · not yet published</p>
          </div>
          <SubmitButton />
        </header>
        <PipelineUI />
      </main>
    </div>
  );
}

export default App;
