import sys
n, k = map(int, sys.stdin.readline().split())
coins = [int(sys.stdin.readline()) for _ in range(n)]
cnt = 0
for c in reversed(coins):
    cnt += k // c
    k %= c
print(cnt)
