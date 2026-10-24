import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateApplicationMaterials, getProviderConfig } from './src/server/generator.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

// Health and provider status
app.get('/api/status', (_req, res) => {
  const config = getProviderConfig();
  res.json({
    ok: true,
    provider: config.provider,
    model: config.model,
    hasApiKey: config.hasApiKey,
    ollamaHost: config.ollamaHost,
    timestamp: new Date().toISOString(),
  });
});

// Generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const {
      jobDescription,
      jobTitle,
      company,
      applicantName,
      applicantExperience,
      tone,
      recruiterName,
    } = req.body || {};

    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'Please paste a job description to generate application materials.',
      });
    }

    const result = await generateApplicationMaterials({
      jobDescription,
      jobTitle,
      company,
      applicantName,
      applicantExperience,
      tone,
      recruiterName,
    });

    res.json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    console.error('Generation error:', err);
    res.status(500).json({
      ok: false,
      error: err.message || 'An unexpected error occurred during generation.',
    });
  }
});

// Setup frontend serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const config = getProviderConfig();
    console.log(`🚀 Recruiter Reach server running on http://0.0.0.0:${PORT}`);
    console.log(`🤖 Active Provider: ${config.provider.toUpperCase()} (${config.model})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
