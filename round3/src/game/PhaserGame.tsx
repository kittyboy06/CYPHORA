import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Phaser from 'phaser';
import GameScene from './GameScene';
import { level1 } from '../levels/level1';
import { level2 } from '../levels/level2';
import { level4 } from '../levels/level4';

interface Props {
  levelIndex: number;
}

const PhaserGame = forwardRef((props: Props, ref) => {
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

  useEffect(() => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (scene) {
        const levelDef = props.levelIndex === 4 ? level4 : props.levelIndex === 2 ? level2 : level1;
        scene.loadLevel(levelDef);
      }
    }
  }, [props.levelIndex]);

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
    },
    isBeastVulnerable: () => {
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
        return scene.isBeastVulnerable();
      }
      return false;
    }
  }));

  return <div ref={containerRef} className="absolute inset-0"></div>;
});

export default PhaserGame;
