import { EventEmitter } from 'node:events';

export const notifications = new EventEmitter();
for (const event of ['user:registered', 'user:verified', 'user:invited', 'user:deleted']) {
  notifications.on(event, (data) => console.log(`[${event}]`, data));
}
