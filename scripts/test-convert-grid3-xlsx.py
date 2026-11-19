import csv
import importlib.util
import tempfile
import unittest
from pathlib import Path

from openpyxl import Workbook

MODULE_PATH = Path(__file__).with_name("convert-grid3-xlsx.py")
SPEC = importlib.util.spec_from_file_location("grid3_converter", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
convert = MODULE.convert


class Grid3ConverterTests(unittest.TestCase):
    def test_preserves_rows_without_coordinates_and_never_verifies(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "sample.xlsx"
            output = root / "out.csv"
            workbook = Workbook()
            sheet = workbook.active
            sheet.append([
                "unique_id", "facility_name", "state_standard", "lga_standard",
                "latitude", "longitude", "functional", "facility_type",
                "facility_level", "ward_standard", "settlement_name", "date_created",
            ])
            sheet.append([
                "GRID3_001", "Sample Primary Health Centre", "Delta", "Sapele",
                5.9, 5.67, "Unknown", "Primary Health Center", "Primary",
                "Sapele Ward 1", "Sapele", "2025-04-11",
            ])
            sheet.append([
                "GRID3_002", "Facility without GPS", "Delta", "Sapele",
                None, None, None, "Maternity Home", "Primary",
                None, None, "2025-04-11",
            ])
            workbook.save(source)
            report = convert(source, output)

            with output.open(encoding="utf-8-sig", newline="") as handle:
                rows = list(csv.DictReader(handle))

            self.assertEqual(report["source_rows"], 2)
            self.assertEqual(report["output_rows"], 2)
            self.assertEqual(report["with_coordinates"], 1)
            self.assertEqual(report["without_coordinates"], 1)
            self.assertEqual(rows[0]["verification_status"], "unverified")
            self.assertEqual(rows[0]["is_published"], "false")
            self.assertEqual(rows[0]["has_emergency_department"], "")
            self.assertEqual(rows[1]["latitude"], "")
            self.assertEqual(rows[1]["facility_type"], "maternity_centre")
            self.assertEqual(rows[1]["functionality_status"], "not_reported")


if __name__ == "__main__":
    unittest.main()
