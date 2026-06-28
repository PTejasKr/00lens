"""Parsers for test output from each language's runner."""
import json
import os
import re
import xml.etree.ElementTree as ET
from glob import glob

DEFAULTS = {"total_tests": 0, "passed": 0, "failed": 0, "duration": 0.0, "coverage_pct": 0.0}


def parse_go_results(app_dir):
    """Parse go test -json output + coverage.out."""
    result = dict(DEFAULTS)
    report = os.path.join(app_dir, "test-report.json")
    try:
        passed = failed = 0
        elapsed = 0.0
        with open(report) as f:
            for line in f:
                entry = json.loads(line)
                if entry.get("Test") and "Action" in entry:
                    if entry["Action"] == "pass":
                        passed += 1
                    elif entry["Action"] == "fail":
                        failed += 1
                if entry.get("Elapsed"):
                    elapsed = max(elapsed, entry["Elapsed"])
        result["passed"] = passed
        result["failed"] = failed
        result["total_tests"] = passed + failed
        result["duration"] = round(elapsed, 3)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Warning: go report parse failed: {e}")

    # coverage
    cov_file = os.path.join(app_dir, "coverage.out")
    try:
        with open(cov_file) as f:
            for line in f:
                m = re.search(r"(\d+\.?\d*)%", line)
                if m:
                    result["coverage_pct"] = float(m.group(1))
    except FileNotFoundError:
        pass

    return result


def parse_java_results(app_dir):
    """Parse Maven Surefire XML reports."""
    result = dict(DEFAULTS)
    report_dir = os.path.join(app_dir, "target", "surefire-reports")
    xmls = glob(os.path.join(report_dir, "TEST-*.xml"))
    if not xmls:
        print(f"Warning: no surefire reports in {report_dir}")
        return result

    total = passed = failed = 0
    duration = 0.0
    try:
        for xml_path in xmls:
            tree = ET.parse(xml_path)
            root = tree.getroot()
            t = int(root.attrib.get("tests", 0))
            f = int(root.attrib.get("failures", 0))
            e = int(root.attrib.get("errors", 0))
            d = float(root.attrib.get("time", 0))
            total += t
            failed += f + e
            duration += d
        passed = total - failed
        result.update(total_tests=total, passed=passed, failed=failed, duration=round(duration, 3))
    except (ET.ParseError, ValueError) as e:
        print(f"Warning: surefire XML parse failed: {e}")

    return result


def parse_python_results(app_dir):
    """Parse pytest-json-report output."""
    result = dict(DEFAULTS)
    report = os.path.join(app_dir, "test-results.json")
    try:
        with open(report) as f:
            data = json.load(f)
        summary = data.get("summary", {})
        result["total_tests"] = summary.get("total", 0)
        result["passed"] = summary.get("passed", 0)
        result["failed"] = summary.get("failed", 0)
        result["duration"] = round(summary.get("duration", 0.0), 3)
    except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
        print(f"Warning: pytest report parse failed: {e}")
    return result


def parse_c_results(app_dir):
    """Parse custom Makefile test output (PASS/FAIL lines + Duration)."""
    result = dict(DEFAULTS)
    report = os.path.join(app_dir, "test-results.txt")
    try:
        passed = failed = 0
        with open(report) as f:
            for line in f:
                stripped = line.strip()
                if stripped.startswith("PASS:"):
                    passed += 1
                elif stripped.startswith("FAIL:"):
                    failed += 1
                elif stripped.startswith("Duration:"):
                    m = re.search(r"([\d.]+)s", stripped)
                    if m:
                        result["duration"] = float(m.group(1))
        result["passed"] = passed
        result["failed"] = failed
        result["total_tests"] = passed + failed
    except FileNotFoundError as e:
        print(f"Warning: C test report not found: {e}")
    return result


def parse_js_results(app_dir):
    """Parse Jest JSON output."""
    result = dict(DEFAULTS)
    report = os.path.join(app_dir, "test-results.json")
    try:
        with open(report) as f:
            data = json.load(f)
        result["total_tests"] = data.get("numTotalTests", 0)
        result["passed"] = data.get("numPassedTests", 0)
        result["failed"] = data.get("numFailedTests", 0)
        # sum durations from each test suite
        suites = data.get("testResults", [])
        total_ms = sum(s.get("endTime", 0) - s.get("startTime", 0) for s in suites)
        result["duration"] = round(total_ms / 1000, 3)
    except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
        print(f"Warning: jest report parse failed: {e}")
    return result


PARSERS = {
    "go": parse_go_results,
    "java": parse_java_results,
    "python": parse_python_results,
    "c": parse_c_results,
    "javascript": parse_js_results,
    "js": parse_js_results,
}


def get_parser(language):
    """Return the parser function for a given language."""
    lang = language.lower()
    if lang not in PARSERS:
        raise ValueError(f"No parser for language: {language}")
    return PARSERS[lang]
