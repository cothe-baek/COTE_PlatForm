import sys
from bisect import bisect_left
n = int(sys.stdin.readline())
tails = []
for x in map(int, sys.stdin.readline().split()):
    i = bisect_left(tails, x)
    if i == len(tails):
        tails.append(x)
    else:
        tails[i] = x
print(len(tails))
