import sys
n = int(sys.stdin.readline())
arr = list(map(int, sys.stdin.readline().split()))
m = max(arr)
print(m, arr.index(m) + 1)
