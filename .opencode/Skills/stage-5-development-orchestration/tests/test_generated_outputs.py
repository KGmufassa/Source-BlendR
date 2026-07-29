from __future__ import annotations

import json
import unittest
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[4]
STAGE_DIR = ROOT / "Build-Plans" / "Stage-5"
NUMBERED_FILES = (
    "01-development-roadmap.json",
    "02-implementation-sequence.json",
    "03-engineering-dependencies.json",
    "04-testing-strategy.json",
    "05-build-tickets.json",
    "06-agent-assignment-plan.json",
    "07-parallel-execution-plan.json",
    "08-release-plan.json",
)


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


class GeneratedStage5OutputsTests(unittest.TestCase):
    def test_v2_outputs_use_context_and_manifest(self) -> None:
        context = read_json(STAGE_DIR / "00-stage-context.json")
        manifest = read_json(STAGE_DIR / "09-stage-manifest.json")

        self.assertEqual(context["artifact_type"], "stage_context")
        self.assertEqual(manifest["artifact_type"], "stage_manifest")
        self.assertEqual(len(manifest["artifacts"]), 8)
        self.assertTrue(manifest["stage_6_handoff"]["ready"])

    def test_numbered_artifacts_do_not_repeat_stage_envelope(self) -> None:
        forbidden = {
            "selected_stack",
            "stage_contract_profile",
            "guidance_policy",
            "assumptions",
            "risks",
            "stage_6_handoff",
            "completion_status",
            "schema_validation",
        }
        for filename in NUMBERED_FILES:
            with self.subTest(filename=filename):
                artifact = read_json(STAGE_DIR / filename)
                self.assertEqual(artifact["format_version"], "2.0")
                self.assertEqual(artifact["context_ref"], "Build-Plans/Stage-5/00-stage-context.json")
                self.assertFalse(forbidden.intersection(artifact))

    def test_canonical_ticket_and_batch_collections_are_stored_once(self) -> None:
        tickets = read_json(STAGE_DIR / "05-build-tickets.json")
        batches = read_json(STAGE_DIR / "07-parallel-execution-plan.json")

        self.assertIn("tickets", tickets["data"])
        self.assertNotIn("build_tickets", tickets["data"])
        self.assertIn("batches", batches["data"])
        self.assertNotIn("parallel_batches", batches["data"])
        self.assertNotIn("serial_batches", batches["data"])

    def test_ticket_refs_and_agent_scopes_match_upstream_contracts(self) -> None:
        tickets = read_json(STAGE_DIR / "05-build-tickets.json")["data"]["tickets"]
        agents = {
            item["agent_id"]: item
            for item in read_json(STAGE_DIR / "06-agent-assignment-plan.json")["data"]["agents"]
        }
        serialized_tickets = json.dumps(tickets)

        for stale_ref in ("STATE-JOB", "STATE-CANDIDATE", "INFRA-WEB", "INFRA-WORKER", "INFRA-DB", "INFRA-REDIS"):
            self.assertNotIn(stale_ref, serialized_tickets)
        self.assertIn("packages/domain/**", agents["AGENT-FOUNDATION"]["allowed_file_scopes"])
        self.assertIn("packages/validation/**", agents["AGENT-FOUNDATION"]["allowed_file_scopes"])
        self.assertIn("apps/worker/**", agents["AGENT-VALIDATION"]["allowed_file_scopes"])
        self.assertIn(".github/workflows/**", agents["AGENT-VALIDATION"]["allowed_file_scopes"])

    def test_parallel_same_batch_dependencies_use_execution_waves(self) -> None:
        batches = read_json(STAGE_DIR / "07-parallel-execution-plan.json")["data"]["batches"]
        batch = next(item for item in batches if item["batch_id"] == "BATCH-002")
        wave_by_ticket = {
            ticket_id: index
            for index, wave in enumerate(batch["execution_waves"])
            for ticket_id in wave
        }

        self.assertLess(wave_by_ticket["TICKET-002"], wave_by_ticket["TICKET-003"])
        self.assertLess(wave_by_ticket["TICKET-002"], wave_by_ticket["TICKET-004"])
        self.assertLess(wave_by_ticket["TICKET-003"], wave_by_ticket["TICKET-016"])


if __name__ == "__main__":
    unittest.main()
