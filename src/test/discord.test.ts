import { describe, expect, it } from 'vitest';
import { defaultDocument, normalizeImportedPayload, toDiscordPayload, validatePayload } from '../lib/discord';

const withField = () => {
  const document = defaultDocument();
  document.payload.embeds[0].fields = [{ id: 'internal-id', name: 'Players', value: '1 / 32', inline: true }];
  return document;
};

describe('Discord payload tools', () => {
  it('removes internal editor ids from exported payloads', () => {
    const payload = toDiscordPayload(withField());
    expect(payload.embeds[0].fields?.[0]).toEqual({ name: 'Players', value: '1 / 32', inline: true });
  });

  it('flags Discord title limits', () => {
    const document = defaultDocument();
    document.payload.embeds[0].title = 'x'.repeat(257);
    expect(validatePayload(document.payload)).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'embeds[0].title', severity: 'error' }),
    ]));
  });

  it('requires custom ids for interactive buttons', () => {
    const document = defaultDocument();
    document.payload.components = [{ type: 1, components: [{ id: '1', type: 2, style: 1, label: 'Refresh' }] }];
    expect(validatePayload(document.payload)).toEqual(expect.arrayContaining([
      expect.objectContaining({ message: 'Interactive buttons require a custom ID.' }),
    ]));
  });

  it('normalizes plain Discord payload JSON into a studio document', () => {
    const document = normalizeImportedPayload({ embeds: [{ title: 'Imported', fields: [{ name: 'A', value: 'B', inline: true }] }] });
    expect(document.name).toBe('Imported Embed');
    expect(document.payload.embeds[0].fields?.[0].id).toBeTruthy();
  });
});
