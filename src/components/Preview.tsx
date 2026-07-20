import type { DiscordButton, DiscordEmbed, DiscordMessagePayload } from '../types';
import { colorToHex } from '../lib/discord';

const renderMarkdown = (text: string) => {
  const escaped = text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  const formatted = escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br />');
  return { __html: formatted };
};

function ButtonPreview({ button }: { button: DiscordButton }) {
  return (
    <button className={`discord-button discord-button--${button.style}`} disabled={button.disabled} type="button">
      {button.emoji?.name ? <span>{button.emoji.name}</span> : null}
      {button.label || 'Button'}
      {button.style === 5 ? <span aria-hidden>↗</span> : null}
    </button>
  );
}

function EmbedPreview({ embed }: { embed: DiscordEmbed }) {
  return (
    <article className="discord-embed" style={{ borderLeftColor: colorToHex(embed.color) }}>
      <div className="discord-embed__body">
        {embed.author?.name ? (
          <div className="discord-author">
            {embed.author.icon_url ? <img src={embed.author.icon_url} alt="" /> : null}
            <span>{embed.author.name}</span>
          </div>
        ) : null}
        {embed.title ? <h3>{embed.title}</h3> : null}
        {embed.description ? <p dangerouslySetInnerHTML={renderMarkdown(embed.description)} /> : null}
        {(embed.fields?.length ?? 0) > 0 ? (
          <div className="discord-fields">
            {embed.fields?.map((field) => (
              <section key={field.id} className={field.inline ? 'discord-field discord-field--inline' : 'discord-field'}>
                <strong>{field.name || 'Untitled field'}</strong>
                <p dangerouslySetInnerHTML={renderMarkdown(field.value || 'Empty value')} />
              </section>
            ))}
          </div>
        ) : null}
        {embed.image?.url ? <img className="discord-image" src={embed.image.url} alt="Embed" /> : null}
        {embed.footer?.text || embed.timestamp ? (
          <footer className="discord-footer">
            {embed.footer?.icon_url ? <img src={embed.footer.icon_url} alt="" /> : null}
            <span>{embed.footer?.text}</span>
            {embed.footer?.text && embed.timestamp ? <span>•</span> : null}
            {embed.timestamp ? <time>{new Date(embed.timestamp).toLocaleString()}</time> : null}
          </footer>
        ) : null}
      </div>
      {embed.thumbnail?.url ? <img className="discord-thumbnail" src={embed.thumbnail.url} alt="Thumbnail" /> : null}
    </article>
  );
}

export function Preview({ payload }: { payload: DiscordMessagePayload }) {
  return (
    <div className="discord-stage">
      <div className="discord-message">
        <div className="discord-avatar">
          {payload.avatar_url ? <img src={payload.avatar_url} alt="" /> : <span>KN</span>}
        </div>
        <div className="discord-message__content">
          <div className="discord-name-row">
            <strong>{payload.username || 'Khaos Nexus'}</strong>
            <span className="bot-pill">APP</span>
            <small>Today at {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small>
          </div>
          {payload.content ? <p className="discord-content" dangerouslySetInnerHTML={renderMarkdown(payload.content)} /> : null}
          {payload.embeds.map((embed, index) => <EmbedPreview key={index} embed={embed} />)}
          {payload.components?.map((row, rowIndex) => (
            <div className="discord-actions" key={rowIndex}>
              {row.components.map((button) => <ButtonPreview key={button.id} button={button} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
