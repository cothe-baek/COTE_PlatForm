#!/usr/bin/env python3
"""각 문제의 solution.py를 tests/*.in에 실행해 tests/*.out과 일치하는지 검증한다."""
import os, subprocess, sys, glob

root = os.path.dirname(os.path.abspath(__file__))
fail = 0
for pdir in sorted(glob.glob(os.path.join(root, "*/"))):
    sol = os.path.join(pdir, "solution.py")
    if not os.path.exists(sol):
        continue
    slug = os.path.basename(os.path.normpath(pdir))
    for inp in sorted(glob.glob(os.path.join(pdir, "tests", "*.in"))):
        exp = open(inp[:-3] + ".out").read()
        got = subprocess.run([sys.executable, sol], input=open(inp).read(), capture_output=True, text=True, timeout=10).stdout
        norm = lambda s: [l.rstrip() for l in s.rstrip().splitlines()]
        if norm(got) != norm(exp):
            fail += 1
            print(f"FAIL {slug} {os.path.basename(inp)}\n expected: {exp!r}\n got:      {got!r}")
print("all passed" if fail == 0 else f"{fail} failures")
sys.exit(1 if fail else 0)
