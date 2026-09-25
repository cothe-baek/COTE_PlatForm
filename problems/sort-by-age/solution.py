import sys
n = int(sys.stdin.readline())
rows = []
for _ in range(n):
    age, name = sys.stdin.readline().split()
    rows.append((int(age), name))
rows.sort(key=lambda r: r[0])
sys.stdout.write("\n".join(f"{a} {b}" for a, b in rows) + "\n")
