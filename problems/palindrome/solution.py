import sys
t = int(sys.stdin.readline())
for _ in range(t):
    s = sys.stdin.readline().strip()
    print("yes" if s == s[::-1] else "no")
