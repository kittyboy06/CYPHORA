import * as Blockly from 'blockly';
import { cyphoraTheme } from './theme';
import { getToolboxXml } from './toolbox';

export interface WorkspaceConfigOptions {
  level: number;
  gridSpacing?: number;
  gridLength?: number;
  gridColour?: string;
  gridSnap?: boolean;
}

/**
 * Builds modular Blockly workspace options with grid, snapping, theme, and navigation.
 */
export function getWorkspaceOptions(options: WorkspaceConfigOptions): Blockly.BlocklyOptions {
  const {
    level,
    gridSpacing = 25,
    gridLength = 25, // 25 forms continuous grid lines; 3 forms crosshairs
    gridColour = 'rgba(223, 177, 37, 0.18)',
    gridSnap = true,
  } = options;

  return {
    toolbox: getToolboxXml(level),
    grid: {
      spacing: gridSpacing,
      length: gridLength,
      colour: gridColour,
      snap: gridSnap,
    },
    trashcan: false,
    move: {
      scrollbars: {
        horizontal: true,
        vertical: true,
      },
      drag: true,
      wheel: true,
    },
    zoom: {
      controls: false,
      wheel: false,
      startScale: 1.0,
      maxScale: 2.0,
      minScale: 0.5,
      scaleSpeed: 1.1,
    },
    renderer: 'zelos',
    theme: cyphoraTheme,
    sounds: false,
    comments: false,
    collapse: false,
    disable: false,
  };
}
