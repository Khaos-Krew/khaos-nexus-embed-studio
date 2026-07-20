import type { EmbedTemplate } from './types';
import { createId } from './lib/discord';

const field = (name: string, value: string, inline = true) => ({
  id: createId(),
  name,
  value,
  inline,
});

const button = (label: string, customId: string, style: 1 | 2 | 3 | 4 = 2) => ({
  id: createId(),
  type: 2 as const,
  style,
  label,
  custom_id: customId,
});

export const templates: EmbedTemplate[] = [
  {
    id: 'palworld-live-panel',
    category: 'Game Servers',
    name: 'Palworld Live Panel',
    description: 'Live server health, players, rates, and safe operator controls.',
    document: {
      name: 'Palworld Live Panel',
      payload: {
        username: 'Khaos Nexus',
        embeds: [
          {
            title: 'Palworld · Khaos Nexus Server',
            description: '🟢 **ONLINE** · telemetry current · REST connected',
            color: 0x22c55e,
            fields: [
              field('Players', '1 / 32'),
              field('Server FPS', '60'),
              field('Uptime', '45m'),
              field('World Day', '436'),
              field('Version', 'v1.0.1'),
              field('Last Poll', '<t:1784510400:R>'),
              field('Online Players', 'Khaos_Kirito · Lv42', false),
            ],
            footer: { text: 'Khaos Nexus Operations · Live data' },
            timestamp: new Date().toISOString(),
          },
        ],
        components: [
          { type: 1, components: [button('Refresh', 'pwpanel:refresh', 1), button('View Players', 'pwpanel:players'), button('View Rates', 'pwpanel:rates')] },
          { type: 1, components: [button('Save World', 'pwpanel:save', 3), button('Announcement', 'pwpanel:announce'), button('Maintenance', 'pwpanel:maintenance', 4)] },
        ],
      },
    },
  },
  {
    id: 'ark-cluster-status',
    category: 'Game Servers',
    name: 'ARK Cluster Status',
    description: 'Compact multi-map health summary with player and restart actions.',
    document: {
      name: 'ARK Cluster Status',
      payload: {
        username: 'Khaos Nexus',
        embeds: [
          {
            title: 'ARK: Survival Ascended · Cluster Status',
            description: 'All cluster services are operational.',
            color: 0xdc2626,
            fields: [
              field('Ragnarok', '🟢 Online · 6/20'),
              field('Astraeos', '🟢 Online · 3/20'),
              field('Next Restart', '<t:1784536800:R>', false),
            ],
            footer: { text: 'Parental Pangea · Khaos Nexus' },
          },
        ],
        components: [
          { type: 1, components: [button('Refresh', 'ark:refresh', 1), button('Players', 'ark:players'), button('Save All', 'ark:save', 3), button('Restart Warning', 'ark:restart', 4)] },
        ],
      },
    },
  },
  {
    id: 'maintenance-window',
    category: 'Operations',
    name: 'Maintenance Window',
    description: 'Clear planned-maintenance notice with status and acknowledgement actions.',
    document: {
      name: 'Maintenance Window',
      payload: {
        content: '@here',
        username: 'Khaos Nexus',
        embeds: [
          {
            title: 'Scheduled Maintenance',
            description: 'The service will be temporarily unavailable while updates and database maintenance are completed.',
            color: 0xf59e0b,
            fields: [
              field('Starts', '<t:1784536800:F>'),
              field('Estimated Duration', '30 minutes'),
              field('Affected Services', 'Game panels and live status updates', false),
            ],
            footer: { text: 'Updates will be posted in this message.' },
          },
        ],
        components: [{ type: 1, components: [button('Check Status', 'maintenance:status', 1), button('Acknowledge', 'maintenance:ack', 3)] }],
      },
    },
  },
  {
    id: 'community-announcement',
    category: 'Community',
    name: 'Community Announcement',
    description: 'A polished general-purpose announcement card.',
    document: {
      name: 'Community Announcement',
      payload: {
        username: 'Khaos Nexus',
        embeds: [
          {
            author: { name: 'Khaos Nexus Community' },
            title: 'What is new in the Nexus',
            description: 'Share an update, event, release, or community milestone here.',
            color: 0xdc2626,
            fields: [
              field('Highlights', '• New module\n• Improved mobile layout\n• Better support access', false),
              field('When', '<t:1784536800:F>'),
              field('Where', '#community-news'),
            ],
            footer: { text: 'Khaos Krew' },
          },
        ],
        components: [],
      },
    },
  },
  {
    id: 'incident-alert',
    category: 'Operations',
    name: 'Incident Alert',
    description: 'High-visibility outage or degraded-service alert.',
    document: {
      name: 'Incident Alert',
      payload: {
        username: 'Khaos Nexus',
        embeds: [
          {
            title: 'Service Incident · Investigating',
            description: 'We are investigating delayed status updates. Game servers remain reachable.',
            color: 0xef4444,
            fields: [
              field('Impact', 'Discord panels may show stale data', false),
              field('Started', '<t:1784510400:R>'),
              field('Next Update', 'Within 30 minutes'),
            ],
            footer: { text: 'Incident updates are timestamped automatically.' },
            timestamp: new Date().toISOString(),
          },
        ],
        components: [{ type: 1, components: [button('Refresh Status', 'incident:refresh', 1)] }],
      },
    },
  },
];
