import express from 'express';
import cors from 'cors';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToModelMessages } from 'ai';
import dotenv from 'dotenv';
import { uploadAndGetSkillIds, listExistingSkills } from './skills-manager.js';

dotenv.config();

// Store uploaded skill IDs
let insuranceSkillIds = [];

// Upload skills at startup
async function initializeSkills() {
  console.log('[Skills] Initializing insurance knowledge base...');

  try {
    // Upload skills from .claude/skills directory
    const uploadedSkills = await uploadAndGetSkillIds(process.env.ANTHROPIC_API_KEY);
    insuranceSkillIds = uploadedSkills;
    console.log(`[Skills] Ready with ${insuranceSkillIds.length} insurance skills`);
    console.log('[Skills] Skill IDs:', JSON.stringify(insuranceSkillIds, null, 2));
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
    console.log('[Chat] Messages format:', JSON.stringify(messages, null, 2));

    // Use AI SDK's convertToModelMessages to convert UIMessage[] to ModelMessage[]
    const modelMessages = convertToModelMessages(messages);

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

    // Use first 4 custom insurance skills
    const skillsConfig = insuranceSkillIds.slice(0, 4).map(skill => ({
      type: 'custom',
      skillId: skill.id
    }));

    console.log(`[Chat] Using ${skillsConfig.length} custom insurance skill(s)`);
    if (skillsConfig.length > 0) {
      console.log('[Chat] Skills:', insuranceSkillIds.slice(0, 4).map(s => s.name).join(', '));
    }

    // Use AI SDK streamText with Anthropic provider + Skills
    const result = streamText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      messages: modelMessages,
      system: systemPrompt,
      // Don't set maxTokens - let Anthropic decide when using Skills
      tools: {
        code_execution: anthropic.tools.codeExecution_20250825(),
      },
      // Enable Skills - testing with 2 skills first
      providerOptions: {
        anthropic: {
          container: skillsConfig.length > 0
            ? { skills: skillsConfig }
            : undefined
        }
      }
    });

    console.log('[Chat] Piping UI message stream to response...');

    // Use AI SDK's built-in method for Express - handles ALL protocol details!
    result.pipeUIMessageStreamToResponse(res);

    console.log('[Chat] Stream piping completed');
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
