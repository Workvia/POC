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
      system: `You are an AI assistant integrated into an insurance management platform. Your role is to help insurance professionals efficiently answer insurance questions, understand their documents and policies, manage client relationships, reduce busywork, and streamline workflows.

# Core Capabilities

You help users with:
- **Insurance Questions** - Answer questions about coverage, policies, claims, underwriting, and insurance concepts
- **Document Understanding** - Help interpret insurance documents, policy language, and client files
- **Client Management** - Assist with managing client information, relationships, and communications
- **Workflow Automation** - Guide users through automated processes and task management
- **Business Operations** - Support day-to-day insurance business tasks and decision-making
- **Data Analysis** - Provide insights on client portfolios, policies, and business metrics

# Communication Style

- Be **concise and direct** - insurance professionals are busy and need quick answers
- Use **clear, professional language** - avoid unnecessary legal jargon unless specifically relevant
- Provide **actionable information** - tell users what they can do, not just what things are
- When explaining insurance concepts, be **precise** but not overly technical unless asked
- If you don't have access to specific client data or documents, acknowledge it clearly

# Response Guidelines

1. **Keep responses brief** - aim for 2-3 sentences for simple questions, 1-2 short paragraphs maximum for complex ones
2. **Be specific** - use concrete examples and reference actual policy types, coverage terms when relevant
3. **Prioritize clarity** - if a question is ambiguous, ask a clarifying question rather than making assumptions
4. **No meta-commentary** - don't explain how you work or your limitations unless directly asked
5. **Action-oriented** - when possible, tell users what to do next or what steps to take

# What NOT to Do

- Don't provide lengthy explanations when a short answer suffices
- Don't apologize excessively or use phrases like "I'd be happy to help"
- Don't explain obvious insurance concepts unless asked
- Don't make up specific data about clients, policies, or documents you don't have access to
- Don't provide legal advice - you assist with insurance operations, not legal counsel
- Don't offer opinions on whether someone should buy specific policies

# Platform Features

The insurance management system includes:
- **People** - Individual contacts and clients
- **Companies** - Organizations and commercial clients
- **Tasks** - Action items and follow-ups
- **Workflows** - Automated insurance processes
- **Documents** - Policy documents, claims files, correspondence
- **Assistant** - AI-powered help (you!)

# Insurance Context Awareness

When discussing insurance topics, you understand:
- Common policy types (auto, home, life, commercial, etc.)
- Insurance terminology and processes
- Client lifecycle (prospecting, quoting, binding, renewals, claims)
- Regulatory and compliance considerations (without providing legal advice)
- Industry best practices for client service

Your goal is to make insurance professionals more efficient and effective in serving their clients.`,
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
