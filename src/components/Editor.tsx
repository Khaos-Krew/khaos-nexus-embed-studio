import type { DiscordButton, DiscordEmbed, StudioDocument } from '../types';
import { colorToHex, createId, hexToColor } from '../lib/discord';
import { ButtonEditor } from './ButtonEditor';
import { FieldEditor } from './FieldEditor';

interface Props {
  document: StudioDocument;
  onChange: (document: StudioDocument) => void;
}

export function Editor({ document, onChange }: Props) {
  const payload = document.payload;
  const embed = payload.embeds[0] ?? { fields: [], color: 0xdc2626 };

  const updatePayload = (patch: Partial<StudioDocument['payload']>) =>
    onChange({ ...document, payload: { ...payload, ...patch } });

  const updateEmbed = (patch: Partial<DiscordEmbed>) => {
    const embeds = [...payload.embeds];
    embeds[0] = { ...embed, ...patch };
    updatePayload({ embeds });
  };

  const fields = embed.fields ?? [];
  const rows = payload.components ?? [];

  const updateButton = (rowIndex: number, buttonIndex: number, next: DiscordButton) => {
    const components = rows.map((row, index) => index === rowIndex
      ? { ...row, components: row.components.map((button, childIndex) => childIndex === buttonIndex ? next : button) }
      : row);
    updatePayload({ components });
  };

  return (
    <div className="editor-stack">
      <details open className="editor-section">
        <summary>Message</summary>
        <div className="editor-section__body">
          <label>
            Document name
            <input value={document.name} onChange={(event) => onChange({ ...document, name: event.target.value })} />
          </label>
          <label>
            Message content
            <textarea rows={3} maxLength={2000} value={payload.content ?? ''} onChange={(event) => updatePayload({ content: event.target.value })} placeholder="Optional text above the embed" />
          </label>
          <div className="form-grid form-grid--two">
            <label>
              Bot display name
              <input value={payload.username ?? ''} onChange={(event) => updatePayload({ username: event.target.value })} />
            </label>
            <label>
              Avatar URL
              <input value={payload.avatar_url ?? ''} onChange={(event) => updatePayload({ avatar_url: event.target.value })} placeholder="https://..." />
            </label>
          </div>
        </div>
      </details>

      <details open className="editor-section">
        <summary>Embed content</summary>
        <div className="editor-section__body">
          <div className="form-grid form-grid--color">
            <label>
              Accent color
              <input type="color" value={colorToHex(embed.color)} onChange={(event) => updateEmbed({ color: hexToColor(event.target.value) })} />
            </label>
            <label>
              Hex
              <input value={colorToHex(embed.color)} onChange={(event) => updateEmbed({ color: hexToColor(event.target.value) })} />
            </label>
          </div>
          <label>
            Title
            <input maxLength={256} value={embed.title ?? ''} onChange={(event) => updateEmbed({ title: event.target.value })} />
          </label>
          <label>
            Title URL
            <input value={embed.url ?? ''} onChange={(event) => updateEmbed({ url: event.target.value })} placeholder="Optional" />
          </label>
          <label>
            Description
            <textarea rows={7} maxLength={4096} value={embed.description ?? ''} onChange={(event) => updateEmbed({ description: event.target.value })} />
          </label>
          <div className="form-grid form-grid--two">
            <label>
              Author name
              <input maxLength={256} value={embed.author?.name ?? ''} onChange={(event) => updateEmbed({ author: { ...embed.author, name: event.target.value } })} />
            </label>
            <label>
              Author icon URL
              <input value={embed.author?.icon_url ?? ''} onChange={(event) => updateEmbed({ author: { name: embed.author?.name ?? '', ...embed.author, icon_url: event.target.value } })} />
            </label>
          </div>
        </div>
      </details>

      <details open className="editor-section">
        <summary>Fields <span className="summary-count">{fields.length}/25</span></summary>
        <div className="editor-section__body">
          {fields.map((field, index) => (
            <FieldEditor
              key={field.id}
              field={field}
              index={index}
              canMoveUp={index > 0}
              canMoveDown={index < fields.length - 1}
              onChange={(next) => updateEmbed({ fields: fields.map((item) => item.id === field.id ? next : item) })}
              onRemove={() => updateEmbed({ fields: fields.filter((item) => item.id !== field.id) })}
              onMove={(direction) => {
                const target = index + direction;
                const next = [...fields];
                [next[index], next[target]] = [next[target], next[index]];
                updateEmbed({ fields: next });
              }}
            />
          ))}
          <button className="secondary-button full-width" type="button" disabled={fields.length >= 25} onClick={() => updateEmbed({ fields: [...fields, { id: createId(), name: 'New field', value: 'Field value', inline: true }] })}>+ Add field</button>
        </div>
      </details>

      <details className="editor-section">
        <summary>Media and footer</summary>
        <div className="editor-section__body">
          <div className="form-grid form-grid--two">
            <label>
              Thumbnail URL
              <input value={embed.thumbnail?.url ?? ''} onChange={(event) => updateEmbed({ thumbnail: event.target.value ? { url: event.target.value } : undefined })} />
            </label>
            <label>
              Image URL
              <input value={embed.image?.url ?? ''} onChange={(event) => updateEmbed({ image: event.target.value ? { url: event.target.value } : undefined })} />
            </label>
            <label>
              Footer text
              <input maxLength={2048} value={embed.footer?.text ?? ''} onChange={(event) => updateEmbed({ footer: { ...embed.footer, text: event.target.value } })} />
            </label>
            <label>
              Footer icon URL
              <input value={embed.footer?.icon_url ?? ''} onChange={(event) => updateEmbed({ footer: { text: embed.footer?.text ?? '', ...embed.footer, icon_url: event.target.value } })} />
            </label>
          </div>
          <label className="check-row">
            <input type="checkbox" checked={Boolean(embed.timestamp)} onChange={(event) => updateEmbed({ timestamp: event.target.checked ? new Date().toISOString() : undefined })} />
            Include timestamp
          </label>
        </div>
      </details>

      <details open className="editor-section">
        <summary>Buttons <span className="summary-count">{rows.reduce((sum, row) => sum + row.components.length, 0)}</span></summary>
        <div className="editor-section__body">
          {rows.map((row, rowIndex) => (
            <section className="action-row-editor" key={rowIndex}>
              <div className="field-card__header">
                <strong>Action row {rowIndex + 1}</strong>
                <button className="icon-button danger" type="button" onClick={() => updatePayload({ components: rows.filter((_, index) => index !== rowIndex) })}>Remove row</button>
              </div>
              {row.components.map((button, buttonIndex) => (
                <ButtonEditor
                  key={button.id}
                  button={button}
                  onChange={(next) => updateButton(rowIndex, buttonIndex, next)}
                  onRemove={() => updatePayload({ components: rows.map((item, index) => index === rowIndex ? { ...item, components: item.components.filter((_, childIndex) => childIndex !== buttonIndex) } : item).filter((item) => item.components.length > 0) })}
                />
              ))}
              <button className="secondary-button full-width" type="button" disabled={row.components.length >= 5} onClick={() => updatePayload({ components: rows.map((item, index) => index === rowIndex ? { ...item, components: [...item.components, { id: createId(), type: 2, style: 2, label: 'New button', custom_id: 'action:new' }] } : item) })}>+ Add button</button>
            </section>
          ))}
          <button className="secondary-button full-width" type="button" disabled={rows.length >= 5} onClick={() => updatePayload({ components: [...rows, { type: 1, components: [{ id: createId(), type: 2, style: 2, label: 'New button', custom_id: 'action:new' }] }] })}>+ Add action row</button>
        </div>
      </details>
    </div>
  );
}
