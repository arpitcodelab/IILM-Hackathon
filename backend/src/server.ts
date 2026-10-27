import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';

async function bootstrap() {
  await connectDatabase();

  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`[MediBridge AI] Express Server running on http://127.0.0.1:${env.PORT}`);
    console.log(`[MediBridge AI] Health endpoint: http://127.0.0.1:${env.PORT}/api/v1/health`);
    console.log(`[MediBridge AI] MedInsight AI RAG: http://127.0.0.1:${env.PORT}/api/v1/medical-records/qa`);
    console.log(`[MediBridge AI] GenericMeds AI Alternatives: http://127.0.0.1:${env.PORT}/api/v1/medicines/alternatives`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => console.log('HTTP server closed'));
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});

