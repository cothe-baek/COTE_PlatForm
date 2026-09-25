import sys
from bisect import bisect_left
inp = sys.stdin.read().split()
n = int(inp[0]); cards = sorted(map(int, inp[1:1+n]))
m = int(inp[1+n]); qs = map(int, inp[2+n:2+n+m])
out = []
for q in qs:
    i = bisect_left(cards, q)
    out.append("1" if i < n and cards[i] == q else "0")
print(" ".join(out))
