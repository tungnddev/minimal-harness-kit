# Next phase: two new MHK components

Status: proposed scope, not implemented.

MHK already ships **rules**, the **rules-add** fast path, and **shared team memory** for Claude and Codex, plus a read-only doctor on both. See [the current setup](RULES_AND_MEMORY.md). Both plugins are implemented; their main differences are native rule loading and memory integration. The additions below are proposals, not current commands or automatic behavior.

Next, we focus on exactly two additions:

| Component | Purpose |
| --- | --- |
| **AI capabilities** | Find useful existing skills, MCP integrations, and other AI tools; sync the project selection; check availability and duplicate roles. |
| **Work verification** | Use the selected tools to check the agent's completed work and report what actually passed or failed. |

## 1. AI capabilities: find, sync, and verify

**Goal:** give the project a small, useful AI toolkit that can be reused on the current machine, another machine, or another supported agent.

MHK recommends and manages references to existing marketplace tools. Their publishers maintain them. MHK does not create or maintain its own replacement skills or MCP servers.

### Find: generate the project's selection

```text
Read the project context and inspect available AI tools
→ identify a useful capability that is missing
→ find suitable existing marketplace tools
→ check their purpose, compatibility, and overlap
→ propose a small selection
→ user reviews once
→ save the approved selection and project usage
```

Start with existing rules and project documentation. Avoid another full repository scan. An already available tool may be sufficient; recommending nothing new is a valid result.

For each selected tool, save only:

| Information | Example meaning |
| --- | --- |
| Name and source | Exact skill/plugin/MCP identity and publisher or marketplace location |
| Version | Selected release or revision; explicitly say when pinning is unavailable |
| Role | What this tool does for the project |
| When to use | The tasks or project area where it is relevant |
| Project usage | Short instructions pointing to existing app, test, or setup documentation |
| Supported agent | Where this selection is usable, including relevant limitations |

Example, illustrating the record rather than prescribing a tool:

```text
Name/source: <existing browser tool and publisher>
Version: <selected version>
Role: browser interaction for web verification
Use when: checking changes to interactive web behavior
Project usage: launch through README instructions; check the affected route
Supported agent: <verified host support>
```

Save the approved selection, not every tool detected on the developer's machine. Use existing native configuration where it already stores the required details. Keep credentials and machine-specific state local.

### Sync: make the selection usable here

```text
Read the saved project selection
→ compare it with tools available to the current agent
→ report missing tools, version differences, and unsupported entries
→ apply authorized installation/configuration changes through existing mechanisms
→ check availability again
```

Sync works on the current machine too: it helps bring the actual setup into agreement with the project's selection. Merely listing a tool does not prove it is installed or usable.

Keep project usage guidance consistent across supported agents while respecting their configuration differences. Do not silently upgrade selected versions or uninstall unrelated global tools. When local configuration is not visible, report that limitation.

### Verify capabilities: prevent duplicate roles

This check concerns the **toolkit**, not application correctness.

- Is the selected tool available to this agent and usable for its stated role?
- Does its version/configuration agree with the selection?
- Do two selected tools perform the same job for the same project scope?
- Are their usage instructions overlapping or contradictory?

**Default: one selected primary tool for each role within the same scope.** If a candidate duplicates an existing role, propose keeping the existing tool or replacing it; do not silently add both. An intentional exception needs a clear reason and separate usage boundaries.

Compare actual roles, not just names or package types. A skill that explains browser testing and an MCP that supplies browser actions can complement each other. Two browser integrations competing for the same task usually need a selection decision.

MHK should report overlaps with visible global tools. It cannot guarantee their deactivation unless the host supports that change and it is authorized.

**Expected result:** a concise, usable toolkit with clear roles and no unexplained duplicates.

## 2. Work verification: check the completed result

**Goal:** before the agent reports relevant implementation work complete, use suitable tools to check that the requested behavior works.

Build, tests, and lint remain part of verification. Add direct behavioral checks through existing browser, web, mobile, or other selected capabilities when the task needs them.

### How it works

```text
Agent finishes a relevant implementation change
→ identify the expected behavior from the request and project requirements
→ choose the relevant checks and available tools
→ run the checks
→ compare actual observations with the expected behavior
→ report one of four outcomes for each check
```

MHK decides what needs checking and coordinates the selected provider. The provider performs its existing role. Reuse an existing verification skill when suitable instead of creating another skill with the same responsibility.

Illustrative checks:

| Change | What to observe |
| --- | --- |
| Web form validation | Invalid input shows the expected message and does not submit |
| Mobile navigation | The changed action opens the expected screen with the expected state |
| Duplicate payment handling | Duplicate submission in a test environment does not create a second payment |

Expected behavior must come from the request or established requirements. If an important expectation is unclear, clarify it rather than inventing a passing condition.

### Four outcomes

| Outcome | Meaning | Example |
| --- | --- | --- |
| **Pass** | The check ran and the expected behavior was observed. | Invalid input was rejected as required. |
| **Fail** | The check ran and observed behavior contradicted the expectation. | Invalid input was accepted. |
| **Blocked** | A prerequisite prevented the check from running. | The required browser tool or simulator was unavailable. |
| **Inconclusive** | The check ran but did not establish the result. | A success message appeared, but the stored result could not be inspected. |

Report the check, outcome, and brief evidence. A passing build does not turn a blocked behavioral check into a pass. Keep screenshots and logs with the task rather than adding them to permanent rules or memory.

### When it runs

The target is automatic verification of relevant completed changes, enabled through a project-approved policy. It should not run after every conversational answer.

Use only checks relevant to the task. Skip unrelated checks before execution. Avoid repeating successful checks unless relevant code, expectations, or environment has changed. Bound execution and retries, and use approved test targets.

First establish that explicit verification works on a real task, then connect the supported automatic trigger for each agent. Report host limitations honestly.

**Expected result:** the agent's completion report states what was checked, what happened, and what remains unverified.

The implementation order is capability selection and sync, capability checks for duplicate roles, then work verification and its automatic trigger. General SDK setup stays in the README. Command names and file formats can be settled when implementation begins.
