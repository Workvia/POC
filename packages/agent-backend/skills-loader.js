import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load all Anthropic Skills from the .claude/skills directory
 * Returns skills in the format required by Anthropic API
 */
export function loadSkills() {
  const skillsDir = path.join(__dirname, '../../.claude/skills');

  if (!fs.existsSync(skillsDir)) {
    console.warn('[Skills] No .claude/skills directory found');
    return [];
  }

  const skills = [];
  const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const skillFolder of skillFolders) {
    const skillPath = path.join(skillsDir, skillFolder);
    const skillManifestPath = path.join(skillPath, 'SKILL.md');

    if (!fs.existsSync(skillManifestPath)) {
      continue;
    }

    try {
      // Read SKILL.md manifest
      const manifestContent = fs.readFileSync(skillManifestPath, 'utf-8');

      // Parse frontmatter to get name and description
      const frontmatterMatch = manifestContent.match(/^---\s*\n([\s\S]*?)\n---/);
      let skillName = skillFolder;
      let skillDescription = '';

      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const nameMatch = frontmatter.match(/name:\s*(.+)/);
        const descMatch = frontmatter.match(/description:\s*(.+)/);

        if (nameMatch) skillName = nameMatch[1].trim();
        if (descMatch) skillDescription = descMatch[1].trim();
      }

      // Load all reference files
      const referencePath = path.join(skillPath, 'reference');
      const referenceFiles = [];

      if (fs.existsSync(referencePath)) {
        const files = fs.readdirSync(referencePath);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const filePath = path.join(referencePath, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            referenceFiles.push({
              name: file,
              content: content
            });
          }
        }
      }

      // Combine manifest + all reference files into one knowledge base
      let fullContent = manifestContent;
      if (referenceFiles.length > 0) {
        fullContent += '\n\n---\n\n# Reference Documents\n\n';
        for (const ref of referenceFiles) {
          fullContent += `\n## ${ref.name}\n\n${ref.content}\n\n`;
        }
      }

      skills.push({
        name: skillName,
        description: skillDescription,
        content: fullContent  // Keep as plain text, not base64
      });

      console.log(`[Skills] Loaded: ${skillName} (${referenceFiles.length} reference files)`);
    } catch (error) {
      console.error(`[Skills] Error loading ${skillFolder}:`, error.message);
    }
  }

  console.log(`[Skills] Total skills loaded: ${skills.length}`);
  return skills;
}
