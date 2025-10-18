import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;
const PYTHON_AGENT_URL = process.env.PYTHON_AGENT_URL || 'http://localhost:3002';

// Middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Gateway (AI SDK Core)',
    features: ['streamText', 'Anthropic Claude', 'CRM Tool Integration']
  });
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Main chat endpoint using Anthropic SDK directly
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    console.log(`[AI Gateway] Received ${messages.length} messages`);

    // Filter out empty messages (from failed attempts)
    const validMessages = messages.filter(msg => msg.content && msg.content.trim().length > 0);

    if (validMessages.length === 0) {
      return res.status(400).json({ error: 'No valid messages provided' });
    }

    console.log(`[AI Gateway] Using ${validMessages.length} valid messages`);

    // Define tools for CRM operations
    const tools = {
      search_companies: {
        description: 'Search for companies in the Twenty CRM database by name or domain',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (company name or domain)'
            }
          },
          required: ['query']
        },
        execute: async ({ query }) => {
          console.log(`[Tool] Searching companies: ${query}`);
          try {
            const response = await fetch(`${PYTHON_AGENT_URL}/api/tools/search_companies`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query })
            });
            const data = await response.json();
            return data.result || `No companies found for: ${query}`;
          } catch (error) {
            console.error('[Tool] Error:', error);
            return `Error searching companies: ${error.message}`;
          }
        }
      },
      search_contacts: {
        description: 'Search for people/contacts in the Twenty CRM database by name or email',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (person name or email)'
            }
          },
          required: ['query']
        },
        execute: async ({ query }) => {
          console.log(`[Tool] Searching contacts: ${query}`);
          try {
            const response = await fetch(`${PYTHON_AGENT_URL}/api/tools/search_contacts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query })
            });
            const data = await response.json();
            return data.result || `No contacts found for: ${query}`;
          } catch (error) {
            console.error('[Tool] Error:', error);
            return `Error searching contacts: ${error.message}`;
          }
        }
      },
      get_company_details: {
        description: 'Get detailed information about a specific company by ID',
        parameters: {
          type: 'object',
          properties: {
            company_id: {
              type: 'string',
              description: 'The UUID of the company'
            }
          },
          required: ['company_id']
        },
        execute: async ({ company_id }) => {
          console.log(`[Tool] Getting company details: ${company_id}`);
          try {
            const response = await fetch(`${PYTHON_AGENT_URL}/api/tools/get_company_details`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ company_id })
            });
            const data = await response.json();
            return data.result || `Company not found: ${company_id}`;
          } catch (error) {
            console.error('[Tool] Error:', error);
            return `Error getting company details: ${error.message}`;
          }
        }
      }
    };

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    console.log('[AI Gateway] Starting stream...');

    // Use Anthropic SDK streaming (same as Python backend)
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: validMessages,
      system: 'You are a helpful AI assistant integrated into Twenty CRM. You help users manage their contacts, companies, and workflows. Be concise and helpful.'
    });

    // Stream the response in AI SDK data format
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const text = chunk.delta.text;
        console.log('[AI Gateway] Chunk:', text);
        // Escape quotes and newlines
        const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
        res.write(`0:"${escaped}"\n`);
      }
    }

    res.end();
    console.log('[AI Gateway] Stream completed');

  } catch (error) {
    console.error('[AI Gateway] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 AI Gateway (AI SDK Core) Started!');
  console.log(`📡 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Python Agent: ${PYTHON_AGENT_URL}`);
  console.log(`🎯 Frontend: http://localhost:3001\n`);
});
