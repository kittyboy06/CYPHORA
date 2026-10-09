import * as Blockly from 'blockly';

/**
 * CYPHORA Temple & Cyber Theme for Blockly
 * Defines consistent colors, block styles, category accents, and component appearance.
 */
export const cyphoraTheme = Blockly.Theme.defineTheme('cyphora_dark', {
  name: 'cyphora_dark',
  base: Blockly.Themes.Classic,
  blockStyles: {
    action_blocks: {
      colourPrimary: '#3e5c2c',
      colourSecondary: '#2d4420',
      colourTertiary: '#1f2e16',
      hat: '',
    },
    combat_blocks: {
      colourPrimary: '#8b2020',
      colourSecondary: '#6e1919',
      colourTertiary: '#4a1111',
      hat: '',
    },
    defense_blocks: {
      colourPrimary: '#1e5a8a',
      colourSecondary: '#164366',
      colourTertiary: '#0f2c44',
      hat: '',
    },
    sensor_blocks: {
      colourPrimary: '#c2971b',
      colourSecondary: '#947314',
      colourTertiary: '#634d0d',
      hat: '',
    },
    totem_blocks: {
      colourPrimary: '#7a227a',
      colourSecondary: '#5e1a5e',
      colourTertiary: '#3d113d',
      hat: '',
    },
    loop_blocks: {
      colourPrimary: '#2d6b38',
      colourSecondary: '#214e29',
      colourTertiary: '#16331b',
      hat: '',
    },
    logic_blocks: {
      colourPrimary: '#346585',
      colourSecondary: '#254a61',
      colourTertiary: '#172f3d',
      hat: '',
    },
    math_blocks: {
      colourPrimary: '#42538c',
      colourSecondary: '#2f3c64',
      colourTertiary: '#1f2742',
      hat: '',
    },
    variable_blocks: {
      colourPrimary: '#823769',
      colourSecondary: '#61294e',
      colourTertiary: '#401b34',
      hat: '',
    },
    procedure_blocks: {
      colourPrimary: '#6d3782',
      colourSecondary: '#502861',
      colourTertiary: '#341a3f',
      hat: '',
    },
  },
  categoryStyles: {
    actions_category: {
      colour: '#3e5c2c',
    },
    sensors_category: {
      colour: '#c2971b',
    },
    logic_category: {
      colour: '#346585',
    },
    loop_category: {
      colour: '#2d6b38',
    },
    math_category: {
      colour: '#42538c',
    },
    variable_category: {
      colour: '#823769',
    },
    procedure_category: {
      colour: '#6d3782',
    },
  },
  componentStyles: {
    workspaceBackgroundColour: 'transparent',
    toolboxBackgroundColour: 'rgba(14, 18, 12, 0.96)',
    toolboxForegroundColour: '#eae0c8',
    flyoutBackgroundColour: 'rgba(10, 14, 8, 0.97)',
    flyoutOpacity: 0.96,
    scrollbarColour: 'rgba(223, 177, 37, 0.35)',
    scrollbarOpacity: 0.85,
    insertionMarkerColour: '#dfb125',
    insertionMarkerOpacity: 0.8,
    markerColour: '#dfb125',
    cursorColour: '#dfb125',
  },
  fontStyle: {
    family: "'Fira Code', 'Courier New', monospace",
    weight: '600',
    size: 12,
  },
});
