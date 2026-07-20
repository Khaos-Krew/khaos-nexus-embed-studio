import type { EmbedField } from '../types';

interface Props {
  field: EmbedField;
  index: number;
  onChange: (field: EmbedField) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function FieldEditor({ field, index, onChange, onRemove, onMove, canMoveUp, canMoveDown }: Props) {
  return (
    <article className="field-card">
      <div className="field-card__header">
        <strong>Field {index + 1}</strong>
        <div className="inline-actions">
          <button className="icon-button" type="button" disabled={!canMoveUp} onClick={() => onMove(-1)} aria-label="Move field up">↑</button>
          <button className="icon-button" type="button" disabled={!canMoveDown} onClick={() => onMove(1)} aria-label="Move field down">↓</button>
          <button className="icon-button danger" type="button" onClick={onRemove}>Remove</button>
        </div>
      </div>
      <label>
        Name
        <input value={field.name} maxLength={256} onChange={(event) => onChange({ ...field, name: event.target.value })} />
      </label>
      <label>
        Value
        <textarea rows={3} value={field.value} maxLength={1024} onChange={(event) => onChange({ ...field, value: event.target.value })} />
      </label>
      <label className="check-row">
        <input type="checkbox" checked={field.inline} onChange={(event) => onChange({ ...field, inline: event.target.checked })} />
        Display inline
      </label>
    </article>
  );
}
