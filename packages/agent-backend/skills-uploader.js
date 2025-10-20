import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload all skills from .claude/skills to Anthropic API
 * Returns array of skill IDs that can be used in container parameter
 */
export async function uploadSkills(apiKey) {
  const skillsDir = path.join(__dirname, '../../.claude/skills');

  if (!fs.existsSync(skillsDir)) {
    console.warn('[Skills] No .claude/skills directory found');
    return [];
  }

  const skillIds = [];
  const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

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

      let skillName = skillFolder;
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const nameMatch = frontmatter.match(/name:\s*(.+)/);
        if (nameMatch) skillName = nameMatch[1].trim();
      }

      // Create zip file using native zip command
      const zipPath = path.join('/tmp', `${skillFolder}.zip`);
      execSync(`cd "${skillPath}/.." && zip -r "${zipPath}" "${skillFolder}" -x "*.DS_Store"`, {
        stdio: 'pipe'
      });

      // Upload skill via API
      console.log(`[Skills] Uploading ${skillName}...`);

      const form = new FormData();
      const fileBuffer = fs.readFileSync(zipPath);
      const fileBlob = new Blob([fileBuffer], { type: 'application/zip' });
      form.append('file', fileBlob, `${skillFolder}.zip`);

      // Use raw fetch since SDK may not support skills endpoint yet
      const response = await fetch('https://api.anthropic.com/v1/skills', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-beta': 'skills-2025-10-02,code-execution-2025-08-25,files-api-2025-04-14',
          'anthropic-version': '2023-06-01'
        },
        body: form
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`[Skills] Failed to upload ${skillName}:`, error);
        continue;
      }

      const result = await response.json();
      skillIds.push({
        id: result.id,
        name: skillName,
        folder: skillFolder
      });

      console.log(`[Skills] Uploaded ${skillName} (ID: ${result.id})`);

      // Clean up temp zip file
      fs.unlinkSync(zipPath);
    } catch (error) {
      console.error(`[Skills] Error uploading ${skillFolder}:`, error.message);
    }
  }

  console.log(`[Skills] Total skills uploaded: ${skillIds.length}`);
  return skillIds;
}

/**
 * List existing skills from Anthropic API
 */
export async function listSkills(apiKey) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/skills', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-beta': 'skills-2025-10-02,code-execution-2025-08-25,files-api-2025-04-14',
        'anthropic-version': '2023-06-01'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Skills] Failed to list skills:', error);
      return [];
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[Skills] Error listing skills:', error.message);
    return [];
  }
}
