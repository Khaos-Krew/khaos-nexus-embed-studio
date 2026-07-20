export type ButtonStyle = 1 | 2 | 3 | 4 | 5;

export interface EmbedField {
  id: string;
  name: string;
  value: string;
  inline: boolean;
}

export interface EmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

export interface EmbedFooter {
  text: string;
  icon_url?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  author?: EmbedAuthor;
  footer?: EmbedFooter;
  thumbnail?: { url: string };
  image?: { url: string };
  fields?: EmbedField[];
}

export interface DiscordButton {
  id: string;
  type: 2;
  style: ButtonStyle;
  label?: string;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
  emoji?: { name: string };
}

export interface DiscordActionRow {
  type: 1;
  components: DiscordButton[];
}

export interface DiscordMessagePayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds: DiscordEmbed[];
  components?: DiscordActionRow[];
}

export type DiscordExportField = Omit<EmbedField, 'id'>;
export type DiscordExportButton = Omit<DiscordButton, 'id'>;

export interface DiscordExportActionRow {
  type: 1;
  components: DiscordExportButton[];
}

export interface DiscordExportEmbed extends Omit<DiscordEmbed, 'fields'> {
  fields?: DiscordExportField[];
}

export interface DiscordExportPayload extends Omit<DiscordMessagePayload, 'embeds' | 'components'> {
  embeds: DiscordExportEmbed[];
  components?: DiscordExportActionRow[];
}

export interface StudioDocument {
  name: string;
  payload: DiscordMessagePayload;
}

export interface ValidationIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface EmbedTemplate {
  id: string;
  category: 'Game Servers' | 'Community' | 'Operations';
  name: string;
  description: string;
  document: StudioDocument;
}
