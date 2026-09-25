import sys
sys.setrecursionlimit(10000)
data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
adj = [[] for _ in range(n + 1)]
for i in range(m):
    u, v = int(data[2 + 2*i]), int(data[3 + 2*i])
    adj[u].append(v); adj[v].append(u)
seen = [False] * (n + 1)
cnt = 0
for s in range(1, n + 1):
    if seen[s]:
        continue
    cnt += 1
    stack = [s]; seen[s] = True
    while stack:
        x = stack.pop()
        for y in adj[x]:
            if not seen[y]:
                seen[y] = True; stack.append(y)
print(cnt)
