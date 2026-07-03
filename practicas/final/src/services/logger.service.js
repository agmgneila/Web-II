import { IncomingWebhook } from '@slack/webhook';

export const reportServerError = async (error, req) => {
  if (!process.env.SLACK_WEBHOOK_URL || process.env.NODE_ENV === 'test') return;
  const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
  await webhook.send({
    text: [
      `*Error 5XX en BildyApp*`,
      `Timestamp: ${new Date().toISOString()}`,
      `Ruta: ${req.method} ${req.originalUrl}`,
      `Mensaje: ${error.message}`,
      `\`\`\`${error.stack || 'Sin stack'}\`\`\``
    ].join('\n')
  });
};
