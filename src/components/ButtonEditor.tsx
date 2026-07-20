import type { DiscordButton } from '../types';

interface Props {
  button: DiscordButton;
  onChange: (button: DiscordButton) => void;
  onRemove: () => void;
}

export function ButtonEditor({ button, onChange, onRemove }: Props) {
  const isLink = button.style === 5;

  return (
    <article className="field-card">
      <div className="field-card__header">
        <strong>Button</strong>
        <button className="icon-button danger" type="button" onClick={onRemove}>Remove</button>
      </div>
      <div className="form-grid form-grid--two">
        <label>
          Label
          <input value={button.label ?? ''} maxLength={80} onChange={(event) => onChange({ ...button, label: event.target.value })} />
        </label>
        <label>
          Style
          <select value={button.style} onChange={(event) => {
            const style = Number(event.target.value) as DiscordButton['style'];
            onChange({ ...button, style, custom_id: style === 5 ? undefined : button.custom_id ?? 'action:id', url: style === 5 ? button.url ?? 'https://example.com' : undefined });
          }}>
            <option value={1}>Primary</option>
            <option value={2}>Secondary</option>
            <option value={3}>Success</option>
            <option value={4}>Danger</option>
            <option value={5}>Link</option>
          </select>
        </label>
      </div>
      <label>
        {isLink ? 'URL' : 'Custom ID'}
        <input
          value={isLink ? button.url ?? '' : button.custom_id ?? ''}
          onChange={(event) => onChange(isLink ? { ...button, url: event.target.value } : { ...button, custom_id: event.target.value })}
        />
      </label>
      <div className="form-grid form-grid--two">
        <label>
          Emoji
          <input value={button.emoji?.name ?? ''} placeholder="Optional" onChange={(event) => onChange({ ...button, emoji: event.target.value ? { name: event.target.value } : undefined })} />
        </label>
        <label className="check-row check-row--bottom">
          <input type="checkbox" checked={button.disabled ?? false} onChange={(event) => onChange({ ...button, disabled: event.target.checked })} />
          Disabled
        </label>
      </div>
    </article>
  );
}
