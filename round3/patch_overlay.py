import re

with open('src/components/GameOverlay.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(
    r'interface Props \{\s*onRetry: \(\) => void;\s*\}',
    'interface Props {\\n  onRetry: () => void;\\n  onNextLevel: (next: number) => void;\\n}',
    code
)

code = re.sub(
    r'export const GameOverlay: React\.FC<Props> = \(\{ onRetry \}\) => \{',
    'export const GameOverlay: React.FC<Props> = ({ onRetry, onNextLevel }) => {',
    code
)

code = re.sub(
    r'onClick=\{.*?setLevel\(nextLevel\).*?\}',
    'onClick={() => onNextLevel(nextLevel)}',
    code
)

with open('src/components/GameOverlay.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
