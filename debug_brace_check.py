from pathlib import Path
path = Path('src/components/Profile.tsx')
text = path.read_text(encoding='utf-8')
stack = []
line_num = 1
for line in text.splitlines():
    i = 0
    while i < len(line):
        c = line[i]
        if c in '"\'`':
            quote = c
            i += 1
            while i < len(line):
                if line[i] == '\\':
                    i += 2
                    continue
                if line[i] == quote:
                    i += 1
                    break
                i += 1
            continue
        if c == '/' and i + 1 < len(line) and line[i+1] == '/':
            break
        if c == '/' and i + 1 < len(line) and line[i+1] == '*':
            i += 2
            while i < len(line):
                if line[i] == '*' and i + 1 < len(line) and line[i+1] == '/':
                    i += 2
                    break
                i += 1
            continue
        if c == '{':
            stack.append((line_num, i))
        elif c == '}':
            if not stack:
                print('UNMATCHED } at', line_num, i)
            else:
                stack.pop()
        i += 1
    line_num += 1
print('leftover stack', len(stack))
if stack:
    print('first leftover', stack[0])
