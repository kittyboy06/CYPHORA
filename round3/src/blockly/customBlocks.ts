import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export const setupBlocks = () => {
  Blockly.Blocks['action_run'] = {
    init: function () {
      this.jsonInit({
        type: 'action_run',
        message0: 'Run(1 step)',
        previousStatement: null,
        nextStatement: null,
        colour: '#4a6a3a', // Moss green matching bridge
        tooltip: 'Run forward one step on the ground'
      });
    }
  };

  Blockly.Blocks['action_jump'] = {
    init: function () {
      this.jsonInit({
        type: 'action_jump',
        message0: 'Jump(1 step)',
        previousStatement: null,
        nextStatement: null,
        colour: '#555544', // Stone gray matching bridge
        tooltip: 'Jump forward one step'
      });
    }
  };

  // Generator definitions
  // @ts-ignore
  javascriptGenerator.forBlock['action_run'] = function(block: Blockly.Block) {
    return `await game.runStep('${block.id}');\n`;
  };
  
  // @ts-ignore
  javascriptGenerator.forBlock['action_jump'] = function(block: Blockly.Block) {
    return `await game.jumpStep('${block.id}');\n`;
  };

  Blockly.Blocks['action_attack'] = {
    init: function () {
      this.jsonInit({
        type: 'action_attack',
        message0: 'Attack',
        previousStatement: null,
        nextStatement: null,
        colour: '#8b2020', // Red
        tooltip: 'Attack the beast'
      });
    }
  };

  Blockly.Blocks['action_defend'] = {
    init: function () {
      this.jsonInit({
        type: 'action_defend',
        message0: 'Defend',
        previousStatement: null,
        nextStatement: null,
        colour: '#2266aa', // Shield blue
        tooltip: 'Raise shield'
      });
    }
  };

  Blockly.Blocks['sensor_beast_vulnerable'] = {
    init: function () {
      this.jsonInit({
        type: 'sensor_beast_vulnerable',
        message0: 'Is beast vulnerable?',
        output: 'Boolean',
        colour: '#dfb125', // Gold
        tooltip: 'Returns true if the beast has lowered its shield'
      });
    }
  };

  // @ts-ignore
  javascriptGenerator.forBlock['action_attack'] = function(block: Blockly.Block) {
    return `await game.attack('${block.id}');\n`;
  };

  // @ts-ignore
  javascriptGenerator.forBlock['action_defend'] = function(block: Blockly.Block) {
    return `await game.defend('${block.id}');\n`;
  };

  // @ts-ignore
  javascriptGenerator.forBlock['sensor_beast_vulnerable'] = function(block: Blockly.Block) {
    return [`await game.isBeastVulnerable()`, javascriptGenerator.ORDER_ATOMIC];
  };

  Blockly.Blocks['action_activate_totem'] = {
    init: function () {
      this.jsonInit({
        type: 'action_activate_totem',
        message0: 'Activate Totem',
        previousStatement: null,
        nextStatement: null,
        colour: '#800080', // Purple
        tooltip: 'Activates the totem you are standing on'
      });
    }
  };

  // @ts-ignore
  javascriptGenerator.forBlock['action_activate_totem'] = function(block: Blockly.Block) {
    return `await game.activateTotemStep('${block.id}');\n`;
  };

  // ──── Level 3 Blocks ────
  Blockly.Blocks['action_dodge'] = {
    init: function () {
      this.jsonInit({
        type: 'action_dodge',
        message0: 'Dodge',
        previousStatement: null,
        nextStatement: null,
        colour: '#aa3333', // Reddish
        tooltip: 'Dodge a threat on a red tile'
      });
    }
  };

  Blockly.Blocks['action_slide'] = {
    init: function () {
      this.jsonInit({
        type: 'action_slide',
        message0: 'Slide',
        previousStatement: null,
        nextStatement: null,
        colour: '#3366aa', // Blueish
        tooltip: 'Slide under a threat on a blue tile'
      });
    }
  };

  Blockly.Blocks['action_activate_tile'] = {
    init: function () {
      this.jsonInit({
        type: 'action_activate_tile',
        message0: 'Activate (Tile)',
        previousStatement: null,
        nextStatement: null,
        colour: '#cc9900', // Gold
        tooltip: 'Activate a gold tile'
      });
    }
  };

  Blockly.Blocks['sensor_tile_color'] = {
    init: function () {
      this.jsonInit({
        type: 'sensor_tile_color',
        message0: 'Current Tile Color',
        output: 'String',
        colour: '#555555',
        tooltip: 'Returns the color of the current tile ("red", "blue", "gold", "none")'
      });
    }
  };

  Blockly.Blocks['color_value'] = {
    init: function () {
      this.jsonInit({
        type: 'color_value',
        message0: '%1',
        args0: [
          {
            type: 'field_dropdown',
            name: 'COLOR',
            options: [
              ['Red', 'red'],
              ['Blue', 'blue'],
              ['Gold', 'gold']
            ]
          }
        ],
        output: 'String',
        colour: '#888888',
        tooltip: 'Select a color to compare'
      });
    }
  };

  // @ts-ignore
  javascriptGenerator.forBlock['action_dodge'] = function(block: Blockly.Block) {
    return `await game.dodgeStep('${block.id}');\n`;
  };

  // @ts-ignore
  javascriptGenerator.forBlock['action_slide'] = function(block: Blockly.Block) {
    return `await game.slideStep('${block.id}');\n`;
  };

  // @ts-ignore
  javascriptGenerator.forBlock['action_activate_tile'] = function(block: Blockly.Block) {
    return `await game.activateTileStep('${block.id}');\n`;
  };

  // @ts-ignore
  javascriptGenerator.forBlock['sensor_tile_color'] = function(block: Blockly.Block) {
    return [`await game.getTileColor()`, javascriptGenerator.ORDER_ATOMIC];
  };

  // @ts-ignore
  javascriptGenerator.forBlock['color_value'] = function(block: Blockly.Block) {
    const color = block.getFieldValue('COLOR');
    return [`'${color}'`, javascriptGenerator.ORDER_ATOMIC];
  };
};
