---
name: stage-summary
description: Scans Build-Plans Stage-1 through Stage-8 folders, reads nested JSON artifacts, and writes one markdown summary file per populated stage.
compatibility: opencode
---

# Stage Summary

Use this skill when a user wants concise markdown summaries of populated stage folders in `Build-Plans/`.

## When To Use

- The repository contains `Build-Plans/Stage-1` through `Build-Plans/Stage-8` folders.
- One or more stage folders have JSON artifacts that need a human-readable rollup.
- The user wants one markdown summary per populated stage, not one markdown file per JSON artifact.
- The summary must be deterministic and grounded only in the JSON on disk.

## Scope

This skill scans only:

```text
Build-Plans/Stage-1
Build-Plans/Stage-2
Build-Plans/Stage-3
Build-Plans/Stage-4
Build-Plans/Stage-5
Build-Plans/Stage-6
Build-Plans/Stage-7
Build-Plans/Stage-8
```

Rules:

- scan each stage folder recursively for `*.json`
- ignore `.gitkeep` and non-JSON files
- ignore `Build-Plans/Build-status`
- skip stages that have no JSON artifacts
- write exactly one summary markdown file per populated stage

## Required Inputs

- Workspace root containing `Build-Plans/`

## Output Contract

For each populated stage, write:

```text
Build-Plans/Stage-N/Stage-N-summary.md
```

Each summary must include:

- stage title
- count of JSON files summarized
- one section per JSON file in deterministic path order
- file path relative to the stage folder
- inferred purpose from filename and obvious metadata
- top-level keys
- `stage`, `status`, and `command` values when present
- notable populated sections
- notable empty or incomplete sections
- short recap block

## Workflow

1. Verify `Build-Plans/` exists.
2. Check `Stage-1` through `Stage-8` in order.
3. Collect nested JSON files for each stage.
4. If a stage has no JSON files, skip it without writing a placeholder markdown file.
5. Read and summarize every JSON file found in that stage.
6. Write `Stage-N-summary.md` into the same stage folder.
7. Report generated summaries and skipped stages.

## Script

Use:

```bash
python3 .opencode/Skills/stage-summary/scripts/generate_stage_summaries.py --workspace-root <repo-root>
```

If the current working directory is the repository root, `<repo-root>` can be `.`.

## Determinism Rules

- sort JSON files by relative path before rendering
- preserve exact stage naming from the folder name
- do not invent requirements, status, or interpretations not supported by the JSON
- keep headings and bullet order stable across runs

## Stop Conditions

Stop and surface an error if:

- `Build-Plans/` is missing
- a targeted JSON file is malformed
- a stage path cannot be read

## Verification

Before completion, confirm:

- only populated stage folders produced markdown files
- each generated markdown file matches the stage naming pattern
- every nested JSON file in a summarized stage appears in the markdown
- `Build-Plans/Build-status/` was not scanned
