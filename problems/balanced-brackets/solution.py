import sys
pair = {")": "(", "]": "[", "}": "{"}
t = int(sys.stdin.readline())
for _ in range(t):
    s = sys.stdin.readline().strip()
    st = []
    ok = True
    for c in s:
        if c in "([{":
            st.append(c)
        else:
            if not st or st[-1] != pair[c]:
                ok = False
                break
            st.pop()
    print("YES" if ok and not st else "NO")
