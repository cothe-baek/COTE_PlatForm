import sys
n = int(sys.stdin.readline())
ms = [tuple(map(int, sys.stdin.readline().split())) for _ in range(n)]
ms.sort(key=lambda m: (m[1], m[0]))
cnt, last = 0, -1
for s, e in ms:
    if s >= last:
        cnt += 1; last = e
print(cnt)
