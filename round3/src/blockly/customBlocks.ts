import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { CUSTOM_BLOCK_TOOLTIPS } from './blockDescriptions';

export const setupBlocks = () => {
  // Configure rich tooltips for custom action blocks
  Blockly.Blocks['action_run'] = {
    init: function () {
      this.jsonInit({
        type: 'action_run',
        message0: 'Run(1 step)',
        previousStatement: null,
        nextStatement: null,
        colour: '#4a6a3a', // Moss green matching bridge
        tooltip: CUSTOM_BLOCK_TOOLTIPS['action_run']
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
        tooltip: CUSTOM_BLOCK_TOOLTIPS['action_jump']
      });
    }
  };

  Blockly.Blocks['action_attack'] = {
    init: function () {
      this.jsonInit({
        type: 'action_attack',
        message0: 'Attack',
        previousStatement: null,
        nextStatement: null,
        colour: '#8b2020', // Red
        tooltip: CUSTOM_BLOCK_TOOLTIPS['action_attack']
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
        tooltip: CUSTOM_BLOCK_TOOLTIPS['action_defend']
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
        tooltip: CUSTOM_BLOCK_TOOLTIPS['action_equip']
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
        tooltip: CUSTOM_BLOCK_TOOLTIPS['sensor_beast_vulnerable']
      });
    }
  };

  Blockly.Blocks['action_activate_totem'] = {
    init: function () {
      this.jsonInit({
        type: 'action_activate_totem',
        message0: 'Activate Totem',
        previousStatement: null,
        nextStatement: null,
        colour: '#800080', // Purple
        tooltip: CUSTOM_BLOCK_TOOLTIPS['action_activate_totem']
      });
    }
  };

  // Configure rich tooltips for built-in Blockly standard blocks
  Blockly.Msg['CONTROLS_IF_TOOLTIP_1'] = 'If condition is true, execute the enclosed blocks.';
  Blockly.Msg['CONTROLS_IF_TOOLTIP_2'] = 'If condition is true, execute the first set of blocks. Otherwise, execute the else blocks.';
  Blockly.Msg['CONTROLS_IF_TOOLTIP_3'] = 'If first condition is true, run first blocks. Otherwise if second condition is true, run second blocks.';
  Blockly.Msg['CONTROLS_IF_TOOLTIP_4'] = 'Multi-branch conditional: tests each condition in sequence, falling back to else if none match.';
  Blockly.Msg['LOGIC_COMPARE_TOOLTIP_EQ'] = 'Returns true if both inputs are equal to each other (e.g. i % 3 == 0).';
  Blockly.Msg['LOGIC_COMPARE_TOOLTIP_NEQ'] = 'Returns true if both inputs are not equal to each other.';
  Blockly.Msg['LOGIC_COMPARE_TOOLTIP_LT'] = 'Returns true if the first input is strictly less than the second input.';
  Blockly.Msg['LOGIC_COMPARE_TOOLTIP_LTE'] = 'Returns true if the first input is less than or equal to the second input (e.g. runs <= 5).';
  Blockly.Msg['LOGIC_COMPARE_TOOLTIP_GT'] = 'Returns true if the first input is strictly greater than the second input.';
  Blockly.Msg['LOGIC_COMPARE_TOOLTIP_GTE'] = 'Returns true if the first input is greater than or equal to the second input.';
  Blockly.Msg['LOGIC_OPERATION_TOOLTIP_AND'] = 'Returns true only if both input conditions are true.';
  Blockly.Msg['LOGIC_OPERATION_TOOLTIP_OR'] = 'Returns true if at least one of the input conditions is true.';
  Blockly.Msg['LOGIC_BOOLEAN_TOOLTIP'] = 'Returns a constant true or false boolean value.';
  Blockly.Msg['CONTROLS_REPEAT_TOOLTIP'] = 'Repeat enclosed blocks exactly N times. Can take a number or a variable as the count.';
  Blockly.Msg['CONTROLS_WHILEUNTIL_TOOLTIP_WHILE'] = 'Continuously execute enclosed statements while the condition remains true (e.g. while runs <= 5).';
  Blockly.Msg['CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL'] = 'Continuously execute enclosed statements until the condition becomes true.';
  Blockly.Msg['CONTROLS_FOR_TOOLTIP'] = 'Count with a variable from start to end by step (e.g. count with i from 1 to 14 by 1), running enclosed blocks on each count.';
  Blockly.Msg['MATH_NUMBER_TOOLTIP'] = 'A numeric constant value (e.g. 1, 2, 3, 5, 14, 15).';
  Blockly.Msg['MATH_ARITHMETIC_TOOLTIP_ADD'] = 'Return the sum of the two numbers (e.g. runs + 1).';
  Blockly.Msg['MATH_ARITHMETIC_TOOLTIP_MINUS'] = 'Return the difference of the two numbers.';
  Blockly.Msg['MATH_ARITHMETIC_TOOLTIP_MULTIPLY'] = 'Return the product of the two numbers.';
  Blockly.Msg['MATH_ARITHMETIC_TOOLTIP_DIVIDE'] = 'Return the quotient of the two numbers.';
  Blockly.Msg['MATH_ARITHMETIC_TOOLTIP_POWER'] = 'Return the first number raised to the power of the second number.';
  Blockly.Msg['MATH_MODULO_TOOLTIP'] = 'Return the remainder from dividing the two numbers (e.g. remainder of i ÷ 3, or remainder of i ÷ 5).';
  Blockly.Msg['VARIABLES_SET_TOOLTIP'] = 'Sets the named variable to be equal to the input value (e.g. set runs to 1).';
  Blockly.Msg['VARIABLES_GET_TOOLTIP'] = 'Returns the current stored value of this variable.';
  Blockly.Msg['MATH_CHANGE_TOOLTIP'] = 'Adds a number to a variable (e.g. change runs by 1).';
  Blockly.Msg['PROCEDURES_DEFNORETURN_TOOLTIP'] = 'Creates a reusable function with no return value.';
  Blockly.Msg['PROCEDURES_DEFRETURN_TOOLTIP'] = 'Creates a reusable function with a return value.';
  Blockly.Msg['PROCEDURES_CALLNORETURN_TOOLTIP'] = 'Runs the defined function.';
  Blockly.Msg['PROCEDURES_CALLRETURN_TOOLTIP'] = 'Runs the defined function and uses its return value.';

  // Generator definitions
  // @ts-ignore
  javascriptGenerator.forBlock['action_run'] = function(block: Blockly.Block) {
    return `await game.runStep('${block.id}');\n`;
  };
  
  // @ts-ignore
  javascriptGenerator.forBlock['action_jump'] = function(block: Blockly.Block) {
    return `await game.jumpStep('${block.id}');\n`;
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

  // @ts-ignore
  javascriptGenerator.forBlock['action_activate_totem'] = function(block: Blockly.Block) {
    return `await game.activateTotemStep('${block.id}');\n`;
  };
};
