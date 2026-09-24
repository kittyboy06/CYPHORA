import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Phaser from 'phaser';
import GameScene from './GameScene';

const PhaserGame = forwardRef((props, ref) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: rect.width,
        height: rect.height,
        backgroundColor: '#050804',
        scene: [GameScene],
        pixelArt: false,
        antialias: true,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        }
      };

      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    executeCommand: async (cmd: any) => {
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
        return await scene.executeCommand(cmd);
      }
      return 'FAILED';
    },
    resetLevel: () => {
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
        scene.resetLevel();
      }
    }
  }));

  return <div ref={containerRef} className="absolute inset-0"></div>;
});

export default PhaserGame;
