from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from types import ModuleType


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "resolve_stage5.py"


def load_script() -> ModuleType:
    spec = importlib.util.spec_from_file_location("resolve_stage5", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load Stage 5 resolver")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ResolveStage5Tests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = load_script()

    def test_resolves_v2_data_and_context(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            stage_dir = Path(temporary_directory)
            (stage_dir / "00-stage-context.json").write_text(
                json.dumps({"format_version": "2.0", "artifact_type": "stage_context"}),
                encoding="utf-8",
            )
            (stage_dir / "05-build-tickets.json").write_text(
                json.dumps({"format_version": "2.0", "data": {"tickets": [{"ticket_id": "TICKET-001"}]}}),
                encoding="utf-8",
            )
            (stage_dir / "09-stage-manifest.json").write_text(
                json.dumps(
                    {
                        "format_version": "2.0",
                        "artifacts": [
                            {
                                "artifact_type": "build_tickets",
                                "path": "Build-Plans/Stage-5/05-build-tickets.json",
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )

            resolved = self.module.resolve(stage_dir, "build_tickets", include_context=True)

            self.assertEqual(resolved["format_version"], "2.0")
            self.assertEqual(resolved["data"]["tickets"][0]["ticket_id"], "TICKET-001")
            self.assertEqual(resolved["context"]["artifact_type"], "stage_context")

    def test_resolves_legacy_self_contained_artifact(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            stage_dir = Path(temporary_directory)
            legacy = {"stage": "Stage 5", "tickets": [{"ticket_id": "TICKET-OLD"}]}
            (stage_dir / "05-build-tickets.json").write_text(json.dumps(legacy), encoding="utf-8")

            resolved = self.module.resolve(stage_dir, "build_tickets", include_context=False)

            self.assertEqual(resolved, legacy)

    def test_rejects_partial_v2_handoff_without_manifest(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            stage_dir = Path(temporary_directory)
            (stage_dir / "05-build-tickets.json").write_text(
                json.dumps({"format_version": "2.0", "data": {"tickets": []}}),
                encoding="utf-8",
            )

            with self.assertRaisesRegex(ValueError, "manifest is missing"):
                self.module.resolve(stage_dir, "build_tickets", include_context=False)


if __name__ == "__main__":
    unittest.main()
