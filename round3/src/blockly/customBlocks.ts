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
        colour: 230,
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
        colour: 230,
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
};
