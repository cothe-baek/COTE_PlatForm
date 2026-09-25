import sys
n, k = map(int, sys.stdin.readline().split())
dp = [0] * (k + 1)
for _ in range(n):
    w, v = map(int, sys.stdin.readline().split())
    for c in range(k, w - 1, -1):
        dp[c] = max(dp[c], dp[c - w] + v)
print(dp[k])
