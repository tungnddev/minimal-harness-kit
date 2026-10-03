#!/usr/bin/env node
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const sharedFragments = {
  cartographer: 'core/repo-cartographer.md',
  rules_template: 'core/templates/rules.md.tmpl',
  rules_workflow: 'core/rules-workflow.md.tmpl',
  rules_add_workflow: 'core/rules-add-workflow.md.tmpl',
  root_blocks: 'core/root-blocks.md.tmpl',
  memory_store: 'core/memory-store.md.tmpl',
  doctor_workflow: 'core/doctor-workflow.md.tmpl',
};
const platformFragments = [
  'rule_loading', 'rule_discovery', 'rule_audit', 'enforcement_claims', 'permission_proposals',
];
const targets = {
  claude: {
    variables: {
      root_file: 'CLAUDE.md',
      rules_dir: '.claude/rules',
      rule_commands: '`/mhk:rules`, `/mhk:doctor`, `/mhk:rules-add`',
      rules_command: '`/mhk:rules`',
      memory_command: '`/mhk:memory`',
      cartographer_link: '../agents/repo-cartographer.md',
    },
    playbooks: 'playbooks',
    manifest: '.claude-plugin/plugin.json',
    required: ['commands/rules.md', 'commands/rules-add.md', 'commands/memory.md', 'commands/doctor.md', 'references/codex-migration.md', 'agents/repo-cartographer.md', 'templates/RULES_TEMPLATE.md', 'templates/MEMORY_BLOCK.md', 'templates/MEMORY_TEMPLATE.md'],
  },
  codex: {
    variables: {
      root_file: 'AGENTS.md',
      rules_dir: '.mhk/rules',
      rule_commands: '`$mhk-rules`, `$mhk-rules-add`',
      rules_command: '`$mhk-rules`',
      memory_command: '`$mhk-memory`',
      cartographer_link: '../references/repo-cartographer.md',
    },
    playbooks: 'skills/mhk-rules/references/playbooks',
    manifest: '.codex-plugin/plugin.json',
    required: ['skills/mhk-rules/SKILL.md', 'skills/mhk-rules-add/SKILL.md', 'skills/mhk-rules-add/agents/openai.yaml', 'skills/mhk-rules/references/repo-cartographer.md', 'skills/mhk-rules/assets/RULES_TEMPLATE.md', 'skills/mhk-memory/SKILL.md', 'skills/mhk-memory/agents/openai.yaml', 'skills/mhk-memory/assets/MEMORY_BLOCK.md', 'skills/mhk-memory/assets/MEMORY_TEMPLATE.md', 'skills/mhk-doctor/SKILL.md', 'skills/mhk-doctor/agents/openai.yaml'],
  },
};

// Deliberately only two constructs: scalar substitution and named fragments.
// There are no conditionals, expressions, or implicit variables in prompts.
export function renderTemplate(source, variables, fragments, stack = []) {
  const rendered = source.replace(/\{\{\s*(>)?\s*([a-z_]+)\s*\}\}/g, (_, include, name) => {
    const values = include ? fragments : variables;
    if (!Object.hasOwn(values, name)) {
      throw new Error(`Unknown ${include ? 'fragment' : 'variable'}: ${name}`);
    }
    if (!include) return values[name];
    if (stack.includes(name)) throw new Error(`Circular fragment: ${[...stack, name].join(' -> ')}`);
    return renderTemplate(values[name].trimEnd(), variables, fragments, [...stack, name]);
  });
  if (/\{\{|\}\}/.test(rendered)) throw new Error('Unresolved or unsupported template syntax');
  return rendered;
}

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    if (entry.isSymbolicLink()) throw new Error(`Package sources and outputs must not be symlinks: ${path.join(directory, entry.name)}`);
    if (entry.isDirectory()) {
      for (const child of await filesUnder(path.join(directory, entry.name))) files.push(`${entry.name}/${child}`);
    } else if (entry.isFile()) files.push(entry.name);
  }
  return files;
}

function withSourceNotice(content, source) {
  const notice = `<!-- Generated from ${source}; edit core/ or adapters/ and run npm run build:plugins. -->`;
  const frontmatter = content.match(/^---\n[\s\S]*?\n---\n/);
  if (!frontmatter) return `${notice}\n\n${content}`;
  return `${frontmatter[0]}\n${notice}\n\n${content.slice(frontmatter[0].length).replace(/^\n+/, '')}`;
}

export function validatePackage(platform, files) {
  const target = targets[platform];
  for (const filename of [target.manifest, ...target.required]) {
    if (!files.has(filename)) throw new Error(`${platform}: missing required file ${filename}`);
  }
  const manifest = JSON.parse(files.get(target.manifest));
  if (manifest.skills && ![...files.keys()].some(name => name.startsWith(manifest.skills.replace(/^\.\//, '').replace(/\/$/, '') + '/'))) {
    throw new Error(`${platform}: manifest skills directory is missing`);
  }
  for (const [filename, content] of files) {
    if (/\{\{|\}\}/.test(content)) throw new Error(`${platform}/${filename}: unresolved template syntax`);
    if (/Term map|<rules-dir>|mhk:methodology:|edit both copies/.test(content)) {
      throw new Error(`${platform}/${filename}: obsolete runtime portability instructions`);
    }
    if (!filename.endsWith('.md')) continue;
    // Fenced examples and inline code can describe files in the consumer repo.
    const prose = content.replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, '').replace(/`[^`\n]*`/g, '');
    for (const match of prose.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)) {
      const link = match[1].split('#')[0];
      if (!link || /^[a-z]+:/i.test(link) || /^(?:\.mhk|\.claude)\//.test(link)) continue;
      const destination = path.posix.normalize(path.posix.join(path.posix.dirname(filename), link));
      if (path.posix.isAbsolute(link) || destination.startsWith('../') || !files.has(destination)) {
        throw new Error(`${platform}/${filename}: missing or external package reference ${link}`);
      }
    }
    // Claude's plugin-root references also occur inside code spans.
    for (const match of content.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^\s`'"),;]+)/g)) {
      const reference = match[1].replace(/\/$/, '');
      if (reference.includes('<') || reference.includes('*')) continue;
      if (!files.has(reference) && ![...files.keys()].some(name => name.startsWith(reference + '/'))) {
        throw new Error(`${platform}/${filename}: missing plugin-root reference ${reference}`);
      }
    }
  }
}

export async function assemblePlugins(root = repositoryRoot) {
  const packages = new Map();
  for (const [platform, target] of Object.entries(targets)) {
    const fragments = {};
    const sources = { ...sharedFragments };
    for (const name of platformFragments) sources[name] = `adapters/${platform}/fragments/${name.replaceAll('_', '-')}.md`;
    for (const [name, source] of Object.entries(sources)) fragments[name] = await readFile(path.join(root, source), 'utf8');
    const files = new Map();
    const add = (filename, content, source) => {
      if (files.has(filename)) throw new Error(`${platform}: duplicate output ${filename}`);
      files.set(filename, filename.endsWith('.md') ? withSourceNotice(content, source) : content);
    };
    const sourceDirectory = `adapters/${platform}/package`;
    for (const filename of await filesUnder(path.join(root, sourceDirectory))) {
      const source = `${sourceDirectory}/${filename}`;
      const content = await readFile(path.join(root, source), 'utf8');
      add(filename.replace(/\.tmpl$/, ''), filename.endsWith('.tmpl') ? renderTemplate(content, target.variables, fragments) : content, source);
    }
    for (const filename of await filesUnder(path.join(root, 'core/playbooks'))) {
      const source = `core/playbooks/${filename}`;
      add(`${target.playbooks}/${filename}`, await readFile(path.join(root, source), 'utf8'), source);
    }
    validatePackage(platform, files);
    packages.set(platform, files);
  }
  return packages;
}

export async function buildPlugins({ root = repositoryRoot, check = false } = {}) {
  // Assemble and validate both packages before touching either destination.
  const packages = await assemblePlugins(root);
  const changes = [];
  for (const [platform, files] of packages) {
    const directory = path.join(root, 'plugins', platform);
    let existing;
    try { existing = await filesUnder(directory); }
    catch (error) { if (error.code !== 'ENOENT') throw error; existing = []; }
    const extra = existing.filter(filename => !files.has(filename));
    if (extra.length) throw new Error(`${platform}: unexpected package files; review and remove stale outputs explicitly: ${extra.join(', ')}`);
    for (const [filename, content] of files) {
      const destination = path.join(directory, filename);
      let current;
      try { current = await readFile(destination, 'utf8'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (current !== content) changes.push({ destination, content, relative: `plugins/${platform}/${filename}` });
    }
  }
  if (!check) {
    for (const change of changes) {
      await mkdir(path.dirname(change.destination), { recursive: true });
      await writeFile(change.destination, change.content);
    }
  }
  return changes.map(change => change.relative);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some(arg => arg !== '--check')) throw new Error('Usage: node scripts/build-plugins.mjs [--check]');
    const check = args.includes('--check');
    const changed = await buildPlugins({ check });
    if (check && changed.length) {
      console.error(`Plugin outputs are stale. Run npm run build:plugins:\n${changed.join('\n')}`);
      process.exitCode = 1;
    } else console.log(check ? 'Plugin packages are current and references resolve.' : `Built plugin packages (${changed.length} files updated).`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
