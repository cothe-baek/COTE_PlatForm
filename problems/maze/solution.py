import sys
from collections import deque
n, m = map(int, sys.stdin.readline().split())
g = [sys.stdin.readline().strip() for _ in range(n)]
dist = [[0]*m for _ in range(n)]
dist[0][0] = 1
q = deque([(0, 0)])
while q:
    r, c = q.popleft()
    for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
        nr, nc = r+dr, c+dc
        if 0 <= nr < n and 0 <= nc < m and g[nr][nc] == "1" and dist[nr][nc] == 0:
            dist[nr][nc] = dist[r][c] + 1
            q.append((nr, nc))
print(dist[n-1][m-1] if dist[n-1][m-1] else -1)
