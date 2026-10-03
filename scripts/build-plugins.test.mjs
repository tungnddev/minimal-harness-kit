import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { assemblePlugins, buildPlugins, renderTemplate, validatePackage } from './build-plugins.mjs';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

test('templates resolve scalar values and fragments without interpreting host syntax', () => {
  assert.equal(renderTemplate('${CLAUDE_PLUGIN_ROOT}/{{folder}}\n{{> behavior }}',
    { folder: 'rules', root_file: 'CLAUDE.md' },
    { behavior: 'Read {{root_file}}.' }), '${CLAUDE_PLUGIN_ROOT}/rules\nRead CLAUDE.md.');
});

test('invalid templates fail instead of shipping unresolved instructions', () => {
  assert.throws(() => renderTemplate('{{unknown}}', {}, {}), /Unknown variable/);
  assert.throws(() => renderTemplate('{{> missing }}', {}, {}), /Unknown fragment/);
  assert.throws(() => renderTemplate('{{#if codex}}', {}, {}), /unsupported template syntax/);
  assert.throws(() => renderTemplate('{{root_file}}', { root_file: '{{unknown}}' }, {}), /Unresolved/);
  assert.throws(() => renderTemplate('{{> first }}', {}, {
    first: '{{> second }}', second: '{{> first }}',
  }), /Circular fragment/);
});

test('packages retain host entry points and render only their own rule behavior', async () => {
  const packages = await assemblePlugins();
  const claude = packages.get('claude');
  const codex = packages.get('codex');
  assert.match(claude.get('agents/repo-cartographer.md'), /^---\nname: repo-cartographer\n/);
  assert.match(claude.get('agents/repo-cartographer.md'), /tools: Read, Grep, Glob\n---/);
  assert.match(claude.get('agents/repo-cartographer.md'), /\nomitClaudeMd: true\n[\s\S]*?\n---/);
  assert.match(codex.get('skills/mhk-rules/SKILL.md'), /^---\nname: mhk-rules\n/);
  assert.match(codex.get('skills/mhk-rules/agents/openai.yaml'), /allow_implicit_invocation: false/);
  assert.match(codex.get('skills/mhk-rules-add/SKILL.md'), /^---\nname: mhk-rules-add\n/);
  assert.match(codex.get('skills/mhk-rules-add/agents/openai.yaml'), /allow_implicit_invocation: false/);

  // Commands run only when typed; the host enforces it, not the command body.
  for (const command of ['rules', 'rules-add', 'memory', 'doctor']) {
    const frontmatter = claude.get(`commands/${command}.md`).match(/^---\n([\s\S]*?)\n---\n/)[1];
    assert.match(frontmatter, /^disable-model-invocation: true$/m);
  }
  assert.match(claude.get('commands/doctor.md').match(/^---\n([\s\S]*?)\n---\n/)[1], /^disallowed-tools: Write, Edit, NotebookEdit$/m);
  assert.match(codex.get('skills/mhk-doctor/SKILL.md'), /^---\nname: mhk-doctor\n/);
  assert.match(codex.get('skills/mhk-doctor/agents/openai.yaml'), /allow_implicit_invocation: false/);

  const addWorkflow = await readFile(path.join(repositoryRoot, 'core/rules-add-workflow.md.tmpl'), 'utf8');
  const doctorWorkflow = await readFile(path.join(repositoryRoot, 'core/doctor-workflow.md.tmpl'), 'utf8');
  const rootBlocks = await readFile(path.join(repositoryRoot, 'core/root-blocks.md.tmpl'), 'utf8');
  const memoryStore = await readFile(path.join(repositoryRoot, 'core/memory-store.md.tmpl'), 'utf8');
  for (const [platform, files, entry, doctor] of [
    ['claude', claude, 'commands/rules-add.md', 'commands/doctor.md'],
    ['codex', codex, 'skills/mhk-rules-add/SKILL.md', 'skills/mhk-doctor/SKILL.md'],
  ]) {
    const discovery = await readFile(path.join(repositoryRoot, `adapters/${platform}/fragments/rule-discovery.md`), 'utf8');
    const variables = {
      root_file: platform === 'claude' ? 'CLAUDE.md' : 'AGENTS.md',
      rules_dir: platform === 'claude' ? '.claude/rules' : '.mhk/rules',
      rules_command: platform === 'claude' ? '`/mhk:rules`' : '`$mhk-rules`',
      memory_command: platform === 'claude' ? '`/mhk:memory`' : '`$mhk-memory`',
    };
    const expected = renderTemplate(addWorkflow, variables, { rule_discovery: discovery, root_blocks: rootBlocks });
    assert.ok(files.get(entry).includes(expected.trimEnd()));
    // Both doctors check against the same ownership contract and store format the writers use.
    const checks = renderTemplate(doctorWorkflow, variables, { root_blocks: rootBlocks, memory_store: memoryStore });
    assert.ok(files.get(doctor).includes(checks.trimEnd()));
  }

  // Each layer owns its own root block; the rules templates carry no memory pointer.
  for (const [files, rootTemplate, memoryBlock, memoryTemplate] of [
    [claude, 'templates/CLAUDE_TEMPLATE.md', 'templates/MEMORY_BLOCK.md', 'templates/MEMORY_TEMPLATE.md'],
    [codex, 'skills/mhk-rules/assets/AGENTS_TEMPLATE.md', 'skills/mhk-memory/assets/MEMORY_BLOCK.md', 'skills/mhk-memory/assets/MEMORY_TEMPLATE.md'],
  ]) {
    assert.match(files.get(rootTemplate), /<!-- mhk:rules:begin -->[\s\S]*<!-- mhk:rules:end -->/);
    assert.doesNotMatch(files.get(rootTemplate), /mhk:managed|\.mhk\/memory/);
    assert.match(files.get(memoryBlock), /<!-- mhk:memory:begin -->[\s\S]*\.mhk\/memory\/MEMORY\.md[\s\S]*<!-- mhk:memory:end -->/);
    // Both platforms regenerate the same shared index, so its header must match exactly.
    assert.ok(files.get(memoryTemplate).includes('# Team memory\n\nFacts about this repository, one file each beside this index. Read the ones relevant to the task.\n'));
  }
  assert.match(claude.get('templates/MEMORY_BLOCK.md'), /@\.mhk\/memory\/MEMORY\.md /);
  assert.doesNotMatch(codex.get('skills/mhk-memory/assets/MEMORY_BLOCK.md'), /@\.mhk/);
  assert.match(codex.get('skills/mhk-memory/SKILL.md'), /^---\nname: mhk-memory\n/);
  assert.match(codex.get('skills/mhk-memory/agents/openai.yaml'), /allow_implicit_invocation: false/);
  assert.match(claude.get('commands/rules.md'), /<!-- mhk:memory:begin -->[^\n]*`\/mhk:memory`/);
  assert.match(codex.get('skills/mhk-rules/SKILL.md'), /<!-- mhk:memory:begin -->[^\n]*`\$mhk-memory`/);

  const claudeRules = claude.get('templates/RULES_TEMPLATE.md');
  const codexRules = codex.get('skills/mhk-rules/assets/RULES_TEMPLATE.md');
  assert.match(claudeRules, /\.claude\/rules\//);
  assert.match(claudeRules, /one-line signpost/);
  assert.doesNotMatch(claudeRules, /Codex|AGENTS\.md|\.mhk\/rules/);
  assert.match(codexRules, /\.mhk\/rules\//);
  assert.match(codexRules, /not loaded automatically/);
  assert.doesNotMatch(codexRules, /Claude|CLAUDE\.md|\.claude\/rules/);
  assert.match(codexRules, /<!-- mhk:generated -->/);

  const core = await readFile(path.join(repositoryRoot, 'core/repo-cartographer.md'), 'utf8');
  assert.doesNotMatch(core, /Claude|Codex|root pointer|root instruction|<rules-dir>|Term map/);
  assert.match(core, /applies_to/);
  assert.match(core, /task:/);
  assert.match(core, /summary:/);
  assert.ok(claude.get('agents/repo-cartographer.md').includes(core.trimEnd()));
  assert.ok(codex.get('skills/mhk-rules/references/repo-cartographer.md').includes(core.trimEnd()));
  for (const name of ['backend', 'frontend', 'mobile']) {
    assert.equal(claude.get(`playbooks/${name}.md`), codex.get(`skills/mhk-rules/references/playbooks/${name}.md`));
  }
});

test('broken and escaping package references are rejected', async () => {
  const packages = await assemblePlugins();
  for (const [platform, filename] of [
    ['codex', 'skills/mhk-rules-add/SKILL.md'],
    ['codex', 'skills/mhk-rules-add/agents/openai.yaml'],
    ['codex', 'skills/mhk-doctor/SKILL.md'],
    ['claude', 'references/codex-migration.md'],
    ['claude', 'commands/rules-add.md'],
    ['claude', 'commands/doctor.md'],
  ]) {
    const incomplete = new Map(packages.get(platform));
    incomplete.delete(filename);
    assert.throws(() => validatePackage(platform, incomplete), /missing required file/);
  }
  const codex = new Map(packages.get('codex'));
  codex.delete('skills/mhk-rules/references/permissions.md');
  assert.throws(() => validatePackage('codex', codex), /missing or external package reference/);
  const claude = new Map(packages.get('claude'));
  claude.delete('templates/CLAUDE_TEMPLATE.md');
  assert.throws(() => validatePackage('claude', claude), /missing plugin-root reference/);
  const escaped = new Map(packages.get('codex'));
  escaped.set('skills/mhk-rules/SKILL.md', escaped.get('skills/mhk-rules/SKILL.md') + '\n[external](../../../core/repo-cartographer.md)\n');
  assert.throws(() => validatePackage('codex', escaped), /external package reference/);
});

test('fresh builds are repeatable; checks report drift without writing; invalid sources write nothing', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'mhk-build-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of ['core', 'adapters']) {
    await cp(path.join(repositoryRoot, directory), path.join(root, directory), { recursive: true });
  }
  assert.ok((await buildPlugins({ root })).length > 0);
  assert.deepEqual(await buildPlugins({ root }), []);
  assert.deepEqual(await buildPlugins({ root, check: true }), []);

  const destination = path.join(root, 'plugins/claude/playbooks/backend.md');
  const original = await readFile(destination, 'utf8');
  await writeFile(destination, 'Manual edit\n');
  assert.deepEqual(await buildPlugins({ root, check: true }), ['plugins/claude/playbooks/backend.md']);
  assert.equal(await readFile(destination, 'utf8'), 'Manual edit\n');
  await buildPlugins({ root });
  assert.equal(await readFile(destination, 'utf8'), original);

  const extra = path.join(root, 'plugins/codex/stale.md');
  await writeFile(extra, 'Do not silently delete this\n');
  await assert.rejects(buildPlugins({ root }), /unexpected package files/);
  assert.equal(await readFile(extra, 'utf8'), 'Do not silently delete this\n');
  await rm(extra);

  // Even a valid change in the first package must not be written if the second fails.
  const playbook = path.join(root, 'core/playbooks/backend.md');
  await writeFile(playbook, '# Changed shared playbook\n');
  const skill = path.join(root, 'adapters/codex/package/skills/mhk-rules/SKILL.md.tmpl');
  await writeFile(skill, '{{> nonexistent }}\n');
  await assert.rejects(buildPlugins({ root }), /Unknown fragment/);
  assert.equal(await readFile(destination, 'utf8'), original);
});
