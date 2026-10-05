import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

def_next_level = '''  const handleNextLevel = (nextLevel: number) => {
    setStatus('idle');
    useGameStore.getState().setLevel(nextLevel);
    if (gameRef.current) gameRef.current.resetLevel();
  };'''

code = code.replace("  const handleReset = () => {", def_next_level + "\\n\\n  const handleReset = () => {")

code = code.replace("<GameOverlay onRetry={handleReset} />", "<GameOverlay onRetry={handleReset} onNextLevel={handleNextLevel} />")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
