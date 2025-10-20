import express from 'express';
import cors from 'cors';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import dotenv from 'dotenv';
import { listExistingSkills } from './skills-manager.js';

dotenv.config();

// Store uploaded skill IDs
let insuranceSkillIds = [];

// Upload skills at startup
async function initializeSkills() {
  console.log('[Skills] Initializing insurance knowledge base...');

  try {
    // Get existing skills from Anthropic API
    const existingSkills = await listExistingSkills(process.env.ANTHROPIC_API_KEY);
    insuranceSkillIds = existingSkills;
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
    service: 'AI Agent Backend (AI SDK v5)',
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

    // Build Skills configuration for AI SDK
    const skillsConfig = insuranceSkillIds.length > 0
      ? insuranceSkillIds.slice(0, 8).map(skill => ({
          type: 'custom',
          skillId: skill.id,
          version: 'latest'
        }))
      : [];

    console.log(`[Chat] Using ${skillsConfig.length} insurance knowledge skills`);

    // Use AI SDK streamText with Anthropic provider
    const result = streamText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      messages,
      system: systemPrompt,
      maxTokens: 8000,
      tools: {
        code_execution: anthropic.tools.codeExecution_20250825(),
      },
      providerOptions: {
        anthropic: {
          container: skillsConfig.length > 0
            ? { skills: skillsConfig }
            : undefined
        }
      }
    });

    // Convert to Data Stream Response and pipe to Express response
    const dataStreamResponse = result.toDataStreamResponse();

    // Set headers from the Data Stream Response
    res.status(dataStreamResponse.status);
    dataStreamResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Pipe the body stream to Express response
    const reader = dataStreamResponse.body.getReader();
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            console.log('[Chat] Stream completed successfully');
            break;
          }
          res.write(value);
        }
      } catch (error) {
        console.error('[Chat] Streaming error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: error.message });
        } else {
          res.end();
        }
      }
    };

    pump();
  } catch (error) {
    console.error('[Chat] Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Start server and initialize skills
app.listen(PORT, async () => {
  console.log(`\n🤖 AI Agent Backend (AI SDK v5) running on http://localhost:${PORT}`);
  console.log(`📡 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`💚 Health check: http://localhost:${PORT}/health\n`);

  // Initialize skills after server starts
  await initializeSkills();
});
