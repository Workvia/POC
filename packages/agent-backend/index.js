import express from 'express';
import cors from 'cors';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AI Agent Backend' });
});

// Chat endpoint compatible with AI SDK useChat hook
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log(`[Chat] Received ${messages.length} messages`);

    // Use AI SDK streamText with Anthropic
    const result = await streamText({
      model: anthropic('claude-3-5-sonnet-20241022', { apiKey }),
      messages,
      system: 'You are a helpful AI assistant integrated into a CRM system. You help users manage their contacts, companies, and workflows. Be concise and helpful.',
    });

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Stream the response using AI SDK data stream protocol
    try {
      for await (const textPart of result.textStream) {
        // AI SDK data stream format: "0:" prefix for text chunks
        res.write(`0:"${textPart}"\n`);
      }
      res.end();
      console.log('[Chat] Stream completed successfully');
    } catch (streamError) {
      console.error('[Chat] Streaming error:', streamError);
      res.status(500).end();
    }
  } catch (error) {
    console.error('[Chat] Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🤖 AI Agent Backend running on http://localhost:${PORT}`);
  console.log(`📡 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`💚 Health check: http://localhost:${PORT}/health\n`);
});
