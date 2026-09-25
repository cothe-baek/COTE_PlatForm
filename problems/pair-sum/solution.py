import sys
n, m = map(int, sys.stdin.readline().split())
a = sorted(map(int, sys.stdin.readline().split()))
i, j, cnt = 0, n - 1, 0
while i < j:
    s = a[i] + a[j]
    if s == m:
        cnt += 1; i += 1; j -= 1
    elif s < m:
        i += 1
    else:
        j -= 1
print(cnt)
