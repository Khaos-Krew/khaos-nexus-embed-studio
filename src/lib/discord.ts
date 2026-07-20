import type {
  DiscordButton,
  DiscordEmbed,
  DiscordExportPayload,
  DiscordMessagePayload,
  StudioDocument,
  ValidationIssue,
} from '../types';

export const DISCORD_LIMITS = {
  content: 2000,
  title: 256,
  description: 4096,
  fieldName: 256,
  fieldValue: 1024,
  fields: 25,
  footer: 2048,
  author: 256,
  totalEmbedCharacters: 6000,
  actionRows: 5,
  buttonsPerRow: 5,
  buttonLabel: 80,
  customId: 100,
} as const;

export const createId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const defaultDocument = (): StudioDocument => ({
  name: 'Untitled Embed',
  payload: {
    content: '',
    username: 'Khaos Nexus',
    avatar_url: '',
    embeds: [
      {
        title: 'Khaos Nexus',
        description: 'Build a polished Discord message with a live preview.',
        color: 0xdc2626,
        fields: [],
      },
    ],
    components: [],
  },
});

const textLength = (value?: string): number => value?.length ?? 0;

export const embedCharacterCount = (embed: DiscordEmbed): number => {
  const fields = embed.fields ?? [];
  return (
    textLength(embed.title) +
    textLength(embed.description) +
    textLength(embed.author?.name) +
    textLength(embed.footer?.text) +
    fields.reduce((sum, field) => sum + field.name.length + field.value.length, 0)
  );
};

const addLengthIssue = (
  issues: ValidationIssue[],
  path: string,
  label: string,
  value: string | undefined,
  limit: number,
): void => {
  if ((value?.length ?? 0) > limit) {
    issues.push({
      path,
      severity: 'error',
      message: `${label} is ${value?.length ?? 0}/${limit} characters.`,
    });
  }
};

const validateButton = (
  button: DiscordButton,
  path: string,
  issues: ValidationIssue[],
): void => {
  addLengthIssue(issues, `${path}.label`, 'Button label', button.label, DISCORD_LIMITS.buttonLabel);
  addLengthIssue(issues, `${path}.custom_id`, 'Button custom ID', button.custom_id, DISCORD_LIMITS.customId);

  const isLink = button.style === 5;
  if (isLink && !button.url) {
    issues.push({ path, severity: 'error', message: 'Link buttons require a URL.' });
  }
  if (!isLink && !button.custom_id) {
    issues.push({ path, severity: 'error', message: 'Interactive buttons require a custom ID.' });
  }
  if (!button.label && !button.emoji?.name) {
    issues.push({ path, severity: 'error', message: 'Buttons need a label or emoji.' });
  }
};

export const validatePayload = (payload: DiscordMessagePayload): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  addLengthIssue(issues, 'content', 'Message content', payload.content, DISCORD_LIMITS.content);

  if (!payload.content?.trim() && payload.embeds.length === 0) {
    issues.push({
      path: 'payload',
      severity: 'error',
      message: 'A message needs content or at least one embed.',
    });
  }

  payload.embeds.forEach((embed, embedIndex) => {
    const path = `embeds[${embedIndex}]`;
    addLengthIssue(issues, `${path}.title`, 'Embed title', embed.title, DISCORD_LIMITS.title);
    addLengthIssue(
      issues,
      `${path}.description`,
      'Embed description',
      embed.description,
      DISCORD_LIMITS.description,
    );
    addLengthIssue(issues, `${path}.author.name`, 'Author name', embed.author?.name, DISCORD_LIMITS.author);
    addLengthIssue(issues, `${path}.footer.text`, 'Footer text', embed.footer?.text, DISCORD_LIMITS.footer);

    if ((embed.fields?.length ?? 0) > DISCORD_LIMITS.fields) {
      issues.push({
        path: `${path}.fields`,
        severity: 'error',
        message: `Embed has ${embed.fields?.length ?? 0}/${DISCORD_LIMITS.fields} fields.`,
      });
    }

    embed.fields?.forEach((field, fieldIndex) => {
      addLengthIssue(
        issues,
        `${path}.fields[${fieldIndex}].name`,
        'Field name',
        field.name,
        DISCORD_LIMITS.fieldName,
      );
      addLengthIssue(
        issues,
        `${path}.fields[${fieldIndex}].value`,
        'Field value',
        field.value,
        DISCORD_LIMITS.fieldValue,
      );
      if (!field.name.trim() || !field.value.trim()) {
        issues.push({
          path: `${path}.fields[${fieldIndex}]`,
          severity: 'warning',
          message: 'Empty fields are omitted by Discord and should be removed.',
        });
      }
    });

    const total = embedCharacterCount(embed);
    if (total > DISCORD_LIMITS.totalEmbedCharacters) {
      issues.push({
        path,
        severity: 'error',
        message: `Embed uses ${total}/${DISCORD_LIMITS.totalEmbedCharacters} total characters.`,
      });
    }

    if (embed.color !== undefined && (embed.color < 0 || embed.color > 0xffffff)) {
      issues.push({ path: `${path}.color`, severity: 'error', message: 'Color must be a valid 24-bit value.' });
    }
  });

  if ((payload.components?.length ?? 0) > DISCORD_LIMITS.actionRows) {
    issues.push({
      path: 'components',
      severity: 'error',
      message: `Message has ${payload.components?.length ?? 0}/${DISCORD_LIMITS.actionRows} action rows.`,
    });
  }

  payload.components?.forEach((row, rowIndex) => {
    if (row.components.length > DISCORD_LIMITS.buttonsPerRow) {
      issues.push({
        path: `components[${rowIndex}]`,
        severity: 'error',
        message: `Action row has ${row.components.length}/${DISCORD_LIMITS.buttonsPerRow} buttons.`,
      });
    }
    row.components.forEach((button, buttonIndex) =>
      validateButton(button, `components[${rowIndex}].components[${buttonIndex}]`, issues),
    );
  });

  return issues;
};

const clean = <T>(value: T): T => JSON.parse(JSON.stringify(value, (_key, item) => {
  if (item === '' || item === undefined) return undefined;
  return item;
})) as T;

export const toDiscordPayload = (document: StudioDocument): DiscordExportPayload => {
  const payload = clean(document.payload);
  return {
    ...payload,
    embeds: payload.embeds.map((embed) => ({
      ...embed,
      fields: embed.fields?.map(({ id: _id, ...field }) => field),
    })),
    components: payload.components?.map((row) => ({
      type: 1,
      components: row.components.map(({ id: _id, ...button }) => button),
    })),
  };
};

export const normalizeImportedPayload = (input: unknown): StudioDocument => {
  if (!input || typeof input !== 'object') {
    throw new Error('Imported JSON must be an object.');
  }

  const candidate = input as Record<string, unknown>;
  const payloadCandidate =
    candidate.payload && typeof candidate.payload === 'object'
      ? (candidate.payload as Record<string, unknown>)
      : candidate;

  const embeds = Array.isArray(payloadCandidate.embeds) ? payloadCandidate.embeds : [];
  const components = Array.isArray(payloadCandidate.components) ? payloadCandidate.components : [];

  return {
    name: typeof candidate.name === 'string' ? candidate.name : 'Imported Embed',
    payload: {
      content: typeof payloadCandidate.content === 'string' ? payloadCandidate.content : '',
      username: typeof payloadCandidate.username === 'string' ? payloadCandidate.username : 'Khaos Nexus',
      avatar_url: typeof payloadCandidate.avatar_url === 'string' ? payloadCandidate.avatar_url : '',
      embeds: embeds.map((raw) => {
        const embed = (raw ?? {}) as DiscordEmbed;
        return {
          ...embed,
          fields: Array.isArray(embed.fields)
            ? embed.fields.map((field) => ({ ...field, id: field.id || createId() }))
            : [],
        };
      }),
      components: components.map((rawRow) => {
        const row = rawRow as { components?: DiscordButton[] };
        return {
          type: 1,
          components: Array.isArray(row.components)
            ? row.components.map((button) => ({ ...button, type: 2, id: button.id || createId() }))
            : [],
        };
      }),
    },
  };
};

export const colorToHex = (color?: number): string =>
  `#${(color ?? 0xdc2626).toString(16).padStart(6, '0').slice(-6)}`;

export const hexToColor = (hex: string): number => {
  const normalized = hex.replace('#', '').trim();
  return Number.parseInt(normalized || 'dc2626', 16);
};
