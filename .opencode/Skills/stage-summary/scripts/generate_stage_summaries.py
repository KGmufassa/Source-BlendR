#!/usr/bin/env python3

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List, Sequence, Tuple


STAGE_NUMBERS: Sequence[int] = tuple(range(1, 9))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate one markdown summary for each populated Build-Plans stage folder."
    )
    parser.add_argument(
        "--workspace-root",
        default=".",
        help="Repository root containing Build-Plans/.",
    )
    return parser.parse_args()


def stage_folder_name(stage_number: int) -> str:
    return f"Stage-{stage_number}"


def load_json_documents(stage_dir: Path) -> List[Tuple[Path, Any]]:
    documents: List[Tuple[Path, Any]] = []
    for path in sorted(stage_dir.rglob("*.json")):
        if path.name.startswith("."):
            continue
        try:
            documents.append((path, json.loads(path.read_text(encoding="utf-8"))))
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON in {path}: {exc.msg} at line {exc.lineno} column {exc.colno}") from exc
    return documents


def infer_purpose(path: Path, payload: Any) -> str:
    stem = path.stem.replace("-", " ").replace("_", " ").strip()
    title = " ".join(part.capitalize() for part in stem.split()) or path.name
    if isinstance(payload, dict):
        if "status" in payload and "stage" in payload:
            return f"Stage state artifact for {payload['stage']}"
        if "artifacts" in payload:
            return "Artifact registry"
        if "accepted_risks" in payload:
            return "Risk acceptance ledger"
    return title


def summarize_value(value: Any) -> str:
    if isinstance(value, dict):
        return f"object with {len(value)} keys"
    if isinstance(value, list):
        return f"array with {len(value)} items"
    if value is None:
        return "null"
    if isinstance(value, bool):
        return str(value).lower()
    return repr(value)


def populated_keys(payload: Dict[str, Any]) -> List[str]:
    keys: List[str] = []
    for key, value in payload.items():
        if isinstance(value, dict) and value:
            keys.append(f"`{key}` ({len(value)} keys)")
        elif isinstance(value, list) and value:
            keys.append(f"`{key}` ({len(value)} items)")
        elif value not in ({}, [], None, ""):
            keys.append(f"`{key}` ({summarize_value(value)})")
    return keys


def empty_keys(payload: Dict[str, Any]) -> List[str]:
    keys: List[str] = []
    for key, value in payload.items():
        if value in ({}, [], None, ""):
            keys.append(f"`{key}`")
    return keys


def render_document_section(stage_dir: Path, path: Path, payload: Any) -> str:
    relative_path = path.relative_to(stage_dir).as_posix()
    lines = [f"## `{relative_path}`", ""]
    lines.append(f"- Purpose: {infer_purpose(path, payload)}")

    if isinstance(payload, dict):
        lines.append(f"- Top-level keys: {', '.join(f'`{key}`' for key in payload.keys()) or 'none'}")
        if "stage" in payload:
            lines.append(f"- Stage: `{payload['stage']}`")
        if "status" in payload:
            lines.append(f"- Status: `{payload['status']}`")
        if "command" in payload:
            lines.append(f"- Command: `{payload['command']}`")

        populated = populated_keys(payload)
        empty = empty_keys(payload)
        lines.append(f"- Populated sections: {', '.join(populated) if populated else 'none'}")
        lines.append(f"- Empty or incomplete sections: {', '.join(empty) if empty else 'none'}")
    else:
        lines.append(f"- Root value: {summarize_value(payload)}")

    lines.append("")
    return "\n".join(lines)


def render_stage_summary(stage_number: int, stage_dir: Path, documents: Sequence[Tuple[Path, Any]]) -> str:
    file_count = len(documents)
    dict_docs = [payload for _, payload in documents if isinstance(payload, dict)]
    status_docs = sum(1 for payload in dict_docs if "status" in payload)
    mostly_empty_docs = 0
    for payload in dict_docs:
        total_keys = len(payload)
        empty_count = len(empty_keys(payload))
        if total_keys and empty_count >= total_keys / 2:
            mostly_empty_docs += 1

    lines = [
        f"# Stage {stage_number} Summary",
        "",
        f"Generated from JSON artifacts under `{stage_dir.as_posix()}`.",
        "",
        "## Stage Overview",
        "",
        f"- JSON files summarized: {file_count}",
        f"- Files with explicit `status`: {status_docs}",
        f"- Files that are mostly empty or placeholders: {mostly_empty_docs}",
        "",
    ]

    for path, payload in documents:
        lines.append(render_document_section(stage_dir, path, payload))

    lines.extend(
        [
            "## Recap",
            "",
            f"- Stage folder: `{stage_dir.name}`",
            f"- Summary file: `{stage_dir.name}-summary.md`",
            "- Notes: Deterministic summary generated from all nested JSON files in this stage folder.",
            "",
        ]
    )
    return "\n".join(lines)


def generate_stage_summaries(workspace_root: Path) -> Tuple[List[str], List[str]]:
    build_plans_dir = workspace_root / "Build-Plans"
    if not build_plans_dir.exists():
        raise FileNotFoundError(f"Build-Plans directory not found at {build_plans_dir}")

    generated: List[str] = []
    skipped: List[str] = []

    for stage_number in STAGE_NUMBERS:
        stage_dir = build_plans_dir / stage_folder_name(stage_number)
        if not stage_dir.exists():
            skipped.append(stage_dir.name)
            continue

        documents = load_json_documents(stage_dir)
        if not documents:
            skipped.append(stage_dir.name)
            continue

        output_path = stage_dir / f"{stage_dir.name}-summary.md"
        output_path.write_text(
            render_stage_summary(stage_number, stage_dir, documents),
            encoding="utf-8",
        )
        generated.append(output_path.relative_to(workspace_root).as_posix())

    return generated, skipped


def main() -> int:
    args = parse_args()
    workspace_root = Path(args.workspace_root).resolve()

    try:
        generated, skipped = generate_stage_summaries(workspace_root)
    except (FileNotFoundError, ValueError) as exc:
        print(str(exc), file=sys.stderr)
        return 1

    if generated:
        print("Generated stage summaries:")
        for path in generated:
            print(f"- {path}")
    else:
        print("No populated stage folders found.")

    if skipped:
        print("Skipped stages:")
        for stage_name in skipped:
            print(f"- {stage_name}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
