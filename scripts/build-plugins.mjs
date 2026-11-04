#!/usr/bin/env node
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const sharedFragments = {
  cartographer: 'core/rules/cartographer.md',
  rules_template: 'core/rules/templates/rules.md.tmpl',
  rules_workflow: 'core/rules/workflow.md.tmpl',
  rules_add_workflow: 'core/rules/add-workflow.md.tmpl',
  root_blocks: 'core/shared/root-blocks.md.tmpl',
  memory_store: 'core/memory/store.md.tmpl',
  doctor_workflow: 'core/doctor/workflow.md.tmpl',
  version_file: 'core/shared/version-file.md.tmpl',
  version_check: 'core/shared/version-check.md.tmpl',
  migrate_workflow: 'core/migrate/workflow.md.tmpl',
};
// Layers whose files .mhk/version.json versions, in report order.
const versionedLayers = ['rules', 'memory'];
const migrationKinds = ['edit', 'restructure', 'remove', 'flag', 'rerun'];
// Folders a layer may ship from core/<layer>/; each needs a destination per platform.
const shippedFolders = { playbooks: 'playbook', migrations: 'migration' };
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
      migrate_command: '`/mhk:migrate`',
      platform_key: 'claude',
      cartographer_link: '../agents/repo-cartographer.md',
    },
    // Destination of each core/<layer>/<folder>/.
    playbooks: { rules: 'playbooks/rules' },
    migrations: { rules: 'migrations/rules' },
    manifest: '.claude-plugin/plugin.json',
    required: ['commands/rules.md', 'commands/rules-add.md', 'commands/memory.md', 'commands/doctor.md', 'commands/migrate.md', 'references/codex-import.md', 'agents/repo-cartographer.md', 'templates/RULES_TEMPLATE.md', 'templates/MEMORY_BLOCK.md', 'templates/MEMORY_TEMPLATE.md'],
  },
  codex: {
    variables: {
      root_file: 'AGENTS.md',
      rules_dir: '.mhk/rules',
      rule_commands: '`$mhk-rules`, `$mhk-rules-add`',
      rules_command: '`$mhk-rules`',
      memory_command: '`$mhk-memory`',
      migrate_command: '`$mhk-migrate`',
      platform_key: 'codex',
      cartographer_link: '../references/repo-cartographer.md',
    },
    playbooks: { rules: 'skills/mhk-rules/references/playbooks' },
    migrations: { rules: 'skills/mhk-migrate/references/migrations/rules' },
    manifest: '.codex-plugin/plugin.json',
    required: ['skills/mhk-migrate/SKILL.md', 'skills/mhk-migrate/agents/openai.yaml', 'skills/mhk-rules/SKILL.md', 'skills/mhk-rules-add/SKILL.md', 'skills/mhk-rules-add/agents/openai.yaml', 'skills/mhk-rules/references/repo-cartographer.md', 'skills/mhk-rules/assets/RULES_TEMPLATE.md', 'skills/mhk-memory/SKILL.md', 'skills/mhk-memory/agents/openai.yaml', 'skills/mhk-memory/assets/MEMORY_BLOCK.md', 'skills/mhk-memory/assets/MEMORY_TEMPLATE.md', 'skills/mhk-doctor/SKILL.md', 'skills/mhk-doctor/agents/openai.yaml'],
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

async function layersWith(root, folder) {
  const layers = [];
  for (const entry of await readdir(path.join(root, 'core'), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const children = await readdir(path.join(root, 'core', entry.name), { withFileTypes: true });
    if (children.some(child => child.isDirectory() && child.name === folder)) layers.push(entry.name);
  }
  return layers.sort();
}

const semver = version => version.split('.').map(Number);
export function compareVersions(a, b) {
  const [x, y] = [semver(a), semver(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

// A note is core/<layer>/migrations/<version>.md(.tmpl): items under `## ` headings, each with one Kind.
export function validateMigrationNote(layer, filename, content, version) {
  const match = filename.match(/^(\d+\.\d+\.\d+)\.md(?:\.tmpl)?$/);
  if (!match) throw new Error(`core/${layer}/migrations/${filename}: name must be <x.y.z>.md`);
  if (!versionedLayers.includes(layer)) throw new Error(`core/${layer}/migrations: ${layer} is not a versioned layer`);
  if (compareVersions(match[1], version) > 0) throw new Error(`core/${layer}/migrations/${filename}: newer than the package version ${version}`);
  const items = content.split(/^## /m).slice(1);
  if (!items.length) throw new Error(`core/${layer}/migrations/${filename}: no items`);
  for (const item of items) {
    const kind = item.match(/^Kind: (\S+)$/m)?.[1];
    if (!migrationKinds.includes(kind)) throw new Error(`core/${layer}/migrations/${filename}: item "${item.split('\n')[0]}" needs Kind: ${migrationKinds.join(' | ')}`);
  }
  return match[1];
}

export async function migrationTable(root, version) {
  const rows = ['| Layer | Migration notes |', '| --- | --- |'];
  for (const layer of versionedLayers) {
    let filenames = [];
    try { filenames = await filesUnder(path.join(root, 'core', layer, 'migrations')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const versions = [];
    for (const filename of filenames) {
      const content = await readFile(path.join(root, 'core', layer, 'migrations', filename), 'utf8');
      versions.push(validateMigrationNote(layer, filename, content, version));
    }
    versions.sort(compareVersions);
    rows.push(`| ${layer} | ${versions.join(', ') || 'none'} |`);
  }
  return rows.join('\n');
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
  const shipped = {};
  for (const folder of Object.keys(shippedFolders)) shipped[folder] = await layersWith(root, folder);
  // The root package.json is the only place the release version is written.
  const { version } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const migration_notes = await migrationTable(root, version);
  for (const [platform, target] of Object.entries(targets)) {
    const variables = { ...target.variables, version, migration_notes };
    // A layer's folder must ship somewhere; a declared destination must have a folder.
    for (const [folder, noun] of Object.entries(shippedFolders)) {
      for (const layer of new Set([...shipped[folder], ...Object.keys(target[folder])])) {
        if (!shipped[folder].includes(layer)) throw new Error(`${platform}: ${noun} destination declared for missing core/${layer}/${folder}`);
        if (!target[folder][layer]) throw new Error(`${platform}: core/${layer}/${folder} has no ${noun} destination`);
      }
    }
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
      add(filename.replace(/\.tmpl$/, ''), filename.endsWith('.tmpl') ? renderTemplate(content, variables, fragments) : content, source);
    }
    for (const [folder, layers] of Object.entries(shipped)) {
      for (const layer of layers) {
        for (const filename of await filesUnder(path.join(root, 'core', layer, folder))) {
          const source = `core/${layer}/${folder}/${filename}`;
          const content = await readFile(path.join(root, source), 'utf8');
          add(`${target[folder][layer]}/${filename.replace(/\.tmpl$/, '')}`, filename.endsWith('.tmpl') ? renderTemplate(content, variables, fragments) : content, source);
        }
      }
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
