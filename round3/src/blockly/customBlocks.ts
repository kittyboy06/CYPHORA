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

  Blockly.Blocks['action_equip'] = {
    init: function () {
      this.jsonInit({
        type: 'action_equip',
        message0: 'Equip Item',
        previousStatement: null,
        nextStatement: null,
        colour: '#c86f1e', // Orange/Brown for equip
        tooltip: 'Equip an item from the current tile'
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
  javascriptGenerator.forBlock['action_equip'] = function(block: Blockly.Block) {
    return `await game.equip('${block.id}');\n`;
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

};
