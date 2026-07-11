import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "generate_stage_summaries.py"


class StageSummaryScriptTests(unittest.TestCase):
    def test_generates_summary_for_populated_stage_recursively(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            build_plans = root / "Build-Plans"
            stage_1 = build_plans / "Stage-1"
            nested = stage_1 / "artifacts"
            nested.mkdir(parents=True)
            (build_plans / "Stage-2").mkdir(parents=True)

            payload = {
                "stage": "Stage 1",
                "status": "in_progress",
                "command": "stage-1-product-initialization",
                "feature_groups": {"core": ["auth", "billing"]},
                "technical_risks": ["dependency mismatch"],
                "final_outputs": {},
            }
            (nested / "plan.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

            result = subprocess.run(
                [sys.executable, str(SCRIPT_PATH), "--workspace-root", str(root)],
                capture_output=True,
                text=True,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            summary_path = stage_1 / "Stage-1-summary.md"
            self.assertTrue(summary_path.exists())
            summary = summary_path.read_text(encoding="utf-8")

            self.assertIn("# Stage 1 Summary", summary)
            self.assertIn("artifacts/plan.json", summary)
            self.assertIn("Status: `in_progress`", summary)
            self.assertIn("Command: `stage-1-product-initialization`", summary)
            self.assertIn("technical_risks", summary)
            self.assertIn("final_outputs", summary)
            self.assertFalse((build_plans / "Stage-2" / "Stage-2-summary.md").exists())

    def test_fails_on_invalid_json(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            stage_3 = root / "Build-Plans" / "Stage-3"
            stage_3.mkdir(parents=True)
            (stage_3 / "broken.json").write_text("{not valid json}", encoding="utf-8")

            result = subprocess.run(
                [sys.executable, str(SCRIPT_PATH), "--workspace-root", str(root)],
                capture_output=True,
                text=True,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Invalid JSON", result.stderr)
            self.assertFalse((stage_3 / "Stage-3-summary.md").exists())


if __name__ == "__main__":
    unittest.main()
