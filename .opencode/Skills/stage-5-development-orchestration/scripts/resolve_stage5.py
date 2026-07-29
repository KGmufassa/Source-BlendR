from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Sequence


ARTIFACT_FILENAMES = {
    "development_roadmap": "01-development-roadmap.json",
    "implementation_sequence": "02-implementation-sequence.json",
    "engineering_dependencies": "03-engineering-dependencies.json",
    "testing_strategy": "04-testing-strategy.json",
    "build_tickets": "05-build-tickets.json",
    "agent_assignment_plan": "06-agent-assignment-plan.json",
    "parallel_execution_plan": "07-parallel-execution-plan.json",
    "release_plan": "08-release-plan.json",
}


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def resolve(stage_dir: Path, artifact_type: str, include_context: bool) -> dict[str, Any]:
    manifest_path = stage_dir / "09-stage-manifest.json"
    artifact_path = stage_dir / ARTIFACT_FILENAMES[artifact_type]
    if manifest_path.is_file():
        manifest = read_json(manifest_path)
        if manifest.get("format_version") == "2.0":
            entry = next(
                (item for item in manifest.get("artifacts", []) if item.get("artifact_type") == artifact_type),
                None,
            )
            if not isinstance(entry, dict) or not isinstance(entry.get("path"), str):
                raise ValueError(f"{manifest_path} does not index {artifact_type!r}")
            artifact_path = stage_dir / Path(entry["path"]).name
    artifact = read_json(artifact_path)
    if artifact.get("format_version") == "2.0":
        if not manifest_path.is_file():
            raise ValueError(f"{artifact_path} declares format 2.0 but the Stage 5 manifest is missing")
        data = artifact.get("data")
        if not isinstance(data, dict):
            raise ValueError(f"{artifact_path} does not contain a v2 data object")
        if include_context:
            context = read_json(stage_dir / "00-stage-context.json")
            return {"format_version": "2.0", "context": context, "artifact": artifact, "data": data}
        return data

    # lazy: keep one compatibility branch for pre-v2 self-contained artifacts;
    # remove it only after archived Stage 5 plans no longer need to be replayed.
    if include_context:
        return {"format_version": "1", "context": artifact, "artifact": artifact, "data": artifact}
    return artifact


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Resolve Stage 5 v2 or legacy artifact data.")
    parser.add_argument("--stage-dir", type=Path, default=Path("Build-Plans/Stage-5"))
    parser.add_argument("--artifact", choices=sorted(ARTIFACT_FILENAMES), required=True)
    parser.add_argument("--with-context", action="store_true")
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    value = resolve(args.stage_dir, args.artifact, args.with_context)
    print(json.dumps(value, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
