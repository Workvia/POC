import express from 'express';
import cors from 'cors';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

// Ultra-minimal test endpoint
app.post('/test-chat', async (req, res) => {
  try {
    console.log('[Test] Received request');
    const { messages } = req.body;

    // Simplest possible streamText call
    const result = streamText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      messages: messages || [{ role: 'user', content: 'Say hello!' }],
      maxTokens: 100,
    });

    // Use AI SDK's recommended method for Express
    result.pipeDataStreamToResponse(res);

    console.log('[Test] Response piped to client');
  } catch (error) {
    console.error('[Test] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🧪 Test server running on http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test-chat\n`);
});
