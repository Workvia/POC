import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload all skills from .claude/skills to Anthropic API and return skill IDs
 */
export async function uploadAndGetSkillIds(apiKey) {
  const client = new Anthropic({ apiKey });

  const skillsDir = path.join(__dirname, '../../.claude/skills');

  if (!fs.existsSync(skillsDir)) {
    console.warn('[Skills] No .claude/skills directory found');
    return [];
  }

  const skillIds = [];
  const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`[Skills] Found ${skillFolders.length} skill folders`);

  for (const skillFolder of skillFolders) {
    const skillPath = path.join(skillsDir, skillFolder);
    const skillManifestPath = path.join(skillPath, 'SKILL.md');

    if (!fs.existsSync(skillManifestPath)) {
      console.log(`[Skills] Skipping ${skillFolder} - no SKILL.md found`);
      continue;
    }

    try {
      // Read SKILL.md to get metadata
      const manifestContent = fs.readFileSync(skillManifestPath, 'utf-8');
      const frontmatterMatch = manifestContent.match(/^---\s*\n([\s\S]*?)\n---/);

      let displayTitle = skillFolder;
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const nameMatch = frontmatter.match(/name:\s*(.+)/);
        if (nameMatch) displayTitle = nameMatch[1].trim();
      }

      console.log(`[Skills] Uploading ${displayTitle}...`);

      // Prepare files array - need to read all files in the skill directory
      const files = [];

      // Add SKILL.md
      files.push({
        name: 'SKILL.md',
        content: Buffer.from(manifestContent).toString('base64'),
        mime_type: 'text/markdown'
      });

      // Add all reference files
      const referencePath = path.join(skillPath, 'reference');
      if (fs.existsSync(referencePath)) {
        const refFiles = fs.readdirSync(referencePath);
        for (const refFile of refFiles) {
          if (refFile.endsWith('.md')) {
            const refFilePath = path.join(referencePath, refFile);
            const refContent = fs.readFileSync(refFilePath, 'utf-8');
            files.push({
              name: `reference/${refFile}`,
              content: Buffer.from(refContent).toString('base64'),
              mime_type: 'text/markdown'
            });
          }
        }
      }

      // Upload using beta.skills.create with file tuples
      const skill = await client.beta.skills.create({
        display_title: displayTitle,
        files: files,
        betas: ['skills-2025-10-02']
      });

      skillIds.push({
        id: skill.id,
        name: displayTitle,
        folder: skillFolder
      });

      console.log(`[Skills] ✓ Uploaded ${displayTitle} (ID: ${skill.id})`);
    } catch (error) {
      console.error(`[Skills] ✗ Failed to upload ${skillFolder}:`, error.message);
      if (error.response) {
        console.error('[Skills] Error details:', await error.response.text());
      }
    }
  }

  console.log(`[Skills] Total skills uploaded: ${skillIds.length}`);
  return skillIds;
}

/**
 * List existing skills from Anthropic API
 */
export async function listExistingSkills(apiKey) {
  try {
    const client = new Anthropic({ apiKey });

    const skills = await client.beta.skills.list({
      betas: ['skills-2025-10-02']
    });

    console.log(`[Skills] Found ${skills.data.length} existing skills`);

    return skills.data.map(skill => ({
      id: skill.id,
      name: skill.display_title,
      source: skill.source
    }));
  } catch (error) {
    console.error('[Skills] Error listing skills:', error.message);
    return [];
  }
}
