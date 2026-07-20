import { useEffect, useMemo, useRef, useState } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { defaultDocument, normalizeImportedPayload, toDiscordPayload, validatePayload } from './lib/discord';
import { templates } from './templates';
import type { StudioDocument } from './types';
import './styles.css';

const STORAGE_KEY = 'khaos-nexus-embed-studio:document:v1';

const loadStoredDocument = (): StudioDocument => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? normalizeImportedPayload(JSON.parse(value)) : defaultDocument();
  } catch {
    return defaultDocument();
  }
};

const downloadText = (name: string, content: string) => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function App() {
  const [document, setDocument] = useState<StudioDocument>(loadStoredDocument);
  const [activeTab, setActiveTab] = useState<'editor' | 'json'>('editor');
  const [templateOpen, setTemplateOpen] = useState(false);
  const [notice, setNotice] = useState('Autosaved locally');
  const [importError, setImportError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const payload = useMemo(() => toDiscordPayload(document), [document]);
  const issues = useMemo(() => validatePayload(document.payload), [document]);
  const errors = issues.filter((issue) => issue.severity === 'error');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
      setNotice('Autosaved locally');
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [document]);

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setNotice('Discord JSON copied');
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      const next = normalizeImportedPayload(JSON.parse(await file.text()));
      setDocument(next);
      setImportError('');
      setNotice('JSON imported');
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Could not import that JSON file.');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">KN</div>
          <div>
            <span className="eyebrow">Khaos Nexus</span>
            <h1>Embed Studio</h1>
          </div>
        </div>
        <div className="topbar__actions">
          <span className="save-state">{notice}</span>
          <button className="secondary-button" type="button" onClick={() => fileInput.current?.click()}>Import</button>
          <input ref={fileInput} hidden type="file" accept="application/json,.json" onChange={(event) => void importFile(event.target.files?.[0])} />
          <button className="secondary-button" type="button" onClick={() => downloadText(`${document.name.trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'embed'}.json`, JSON.stringify(payload, null, 2))}>Export</button>
          <button className="primary-button" type="button" onClick={() => void copyJson()}>Copy Discord JSON</button>
        </div>
      </header>

      {importError ? <div className="error-banner">{importError}</div> : null}

      <main className="workspace">
        <aside className="sidebar">
          <button className="template-trigger" type="button" onClick={() => setTemplateOpen(!templateOpen)}>
            <span>Template library</span>
            <strong>{templateOpen ? '−' : '+'}</strong>
          </button>
          {templateOpen ? (
            <div className="template-list">
              {templates.map((template) => (
                <button key={template.id} type="button" className="template-card" onClick={() => {
                  setDocument(normalizeImportedPayload(template.document));
                  setTemplateOpen(false);
                  setNotice(`${template.name} loaded`);
                }}>
                  <small>{template.category}</small>
                  <strong>{template.name}</strong>
                  <span>{template.description}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="tab-list" role="tablist" aria-label="Studio panels">
            <button className={activeTab === 'editor' ? 'tab-button active' : 'tab-button'} type="button" onClick={() => setActiveTab('editor')}>Visual editor</button>
            <button className={activeTab === 'json' ? 'tab-button active' : 'tab-button'} type="button" onClick={() => setActiveTab('json')}>JSON output</button>
          </div>

          <section className="validation-card">
            <div className="validation-card__title">
              <strong>Discord validation</strong>
              <span className={errors.length ? 'status-dot status-dot--error' : 'status-dot'} />
            </div>
            {issues.length === 0 ? <p>Ready to use. No Discord limit issues found.</p> : (
              <ul>
                {issues.map((issue, index) => <li key={`${issue.path}-${index}`} className={issue.severity}>{issue.message}</li>)}
              </ul>
            )}
          </section>

          <button className="ghost-button" type="button" onClick={() => {
            setDocument(defaultDocument());
            setNotice('New document created');
          }}>Start a new embed</button>
        </aside>

        <section className="panel editor-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Build</span>
              <h2>{activeTab === 'editor' ? 'Message editor' : 'Discord JSON'}</h2>
            </div>
            <span className={errors.length ? 'health-badge health-badge--error' : 'health-badge'}>{errors.length ? `${errors.length} errors` : 'Valid'}</span>
          </div>
          {activeTab === 'editor' ? <Editor document={document} onChange={setDocument} /> : (
            <div className="json-panel">
              <pre>{JSON.stringify(payload, null, 2)}</pre>
              <button className="primary-button full-width" type="button" onClick={() => void copyJson()}>Copy JSON</button>
            </div>
          )}
        </section>

        <section className="panel preview-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Preview</span>
              <h2>Discord message</h2>
            </div>
            <span className="preview-label">Desktop-style preview</span>
          </div>
          <Preview payload={document.payload} />
          <p className="preview-note">Preview approximates Discord styling. Final rendering can vary slightly by client and theme.</p>
        </section>
      </main>
    </div>
  );
}
