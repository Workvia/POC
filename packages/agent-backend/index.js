import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { uploadAndGetSkillIds, listExistingSkills } from './skills-manager.js';

dotenv.config();

// Initialize Anthropic client with beta headers
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Store uploaded skill IDs
let insuranceSkillIds = [];

// Upload skills at startup
async function initializeSkills() {
  console.log('[Skills] Initializing insurance knowledge base...');

  try {
    // First, check if we already have skills uploaded
    const existingSkills = await listExistingSkills(process.env.ANTHROPIC_API_KEY);

    if (existingSkills.length > 0) {
      console.log(`[Skills] Found ${existingSkills.length} existing skills, using those`);
      insuranceSkillIds = existingSkills;
    } else {
      console.log('[Skills] No existing skills found, uploading new ones...');
      insuranceSkillIds = await uploadAndGetSkillIds(process.env.ANTHROPIC_API_KEY);
    }

    console.log(`[Skills] Ready with ${insuranceSkillIds.length} insurance skills`);
  } catch (error) {
    console.error('[Skills] Error initializing skills:', error.message);
  }
}

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Agent Backend',
    skills: insuranceSkillIds.length
  });
});

// Chat endpoint compatible with AI SDK useChat hook
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log(`[Chat] Received ${messages.length} messages`);

    const systemPrompt = `You are an AI assistant integrated into an insurance management platform. Your role is to help insurance professionals efficiently answer insurance questions, understand their documents and policies, manage client relationships, reduce busywork, and streamline workflows.

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

You have access to comprehensive California insurance knowledge through specialized skills that you can use to provide accurate, California-specific regulatory and legal information.

Your goal is to make insurance professionals more efficient and effective in serving their clients.`;

    // Prepare Anthropic API request with Skills
    const requestParams = {
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      messages: messages,
      system: systemPrompt,
      stream: true,
      betas: ['code-execution-2025-08-25', 'skills-2025-10-02', 'files-api-2025-04-14'],
      tools: [
        {
          type: 'code_execution_20250825',
          name: 'code_execution'
        }
      ]
    };

    // Add Skills container if we have skills
    if (insuranceSkillIds.length > 0) {
      requestParams.container = {
        skills: insuranceSkillIds.slice(0, 8).map(skill => ({
          type: 'custom',
          skill_id: skill.id,
          version: 'latest'
        }))
      };
      console.log(`[Chat] Using ${Math.min(insuranceSkillIds.length, 8)} insurance knowledge skills`);
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Stream the response using Anthropic SDK
    try {
      const stream = await anthropic.beta.messages.create(requestParams);

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta?.text) {
          // AI SDK data stream format: "0:" prefix for text chunks
          const text = event.delta.text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
          res.write(`0:"${text}"\n`);
        }
      }
      res.end();
      console.log('[Chat] Stream completed successfully');
    } catch (streamError) {
      console.error('[Chat] Streaming error:', streamError);
      console.error('[Chat] Error details:', streamError.message);
      if (streamError.response) {
        console.error('[Chat] Response:', await streamError.response.text());
      }
      res.status(500).end();
    }
  } catch (error) {
    console.error('[Chat] Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Start server and initialize skills
app.listen(PORT, async () => {
  console.log(`\n🤖 AI Agent Backend running on http://localhost:${PORT}`);
  console.log(`📡 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`💚 Health check: http://localhost:${PORT}/health\n`);

  // Initialize skills after server starts
  await initializeSkills();
});
