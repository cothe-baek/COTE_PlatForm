import sys
dp = [1, 1, 2, 4]
for i in range(4, 12):
    dp.append(dp[i-1] + dp[i-2] + dp[i-3])
t = int(sys.stdin.readline())
for _ in range(t):
    print(dp[int(sys.stdin.readline())])
