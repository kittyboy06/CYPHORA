export interface BlockDescription {
  id: string;
  name: string;
  category: 'Actions' | 'Sensors' | 'Logic' | 'Loops' | 'Math' | 'Variables' | 'Functions';
  color: string;
  syntax: string;
  summary: string;
  description: string;
  levels: number[];
  rulesOrNotes?: string;
  example?: string;
}

export const BLOCK_DESCRIPTIONS: BlockDescription[] = [
  // ==================== ACTIONS ====================
  {
    id: 'action_run',
    name: 'Run(1 step)',
    category: 'Actions',
    color: '#4a6a3a',
    syntax: 'await game.runStep()',
    summary: 'Advances the player forward by exactly 1 tile along the solid ground or bridge.',
    description: 'Moves the explorer forward by one tile. Can only be safely executed when standing on and moving onto solid terrain. If executed directly facing a chasm, gap, or pitfall, the explorer will stumble and plunge, causing the trial run to fail.',
    levels: [1, 2, 3],
    rulesOrNotes: 'In Level 1, bridge gaps expand in a triangular number progression (1 run, 2 runs, 3 runs, etc.). In Level 3, run on ground tiles where the index is not divisible by 3 or 5.',
    example: 'Repeat N times: Run(1 step)'
  },
  {
    id: 'action_jump',
    name: 'Jump(1 step)',
    category: 'Actions',
    color: '#555544',
    syntax: 'await game.jumpStep()',
    summary: 'Leaps forward 1 tile through the air over a gap, chasm, or hazard.',
    description: 'Propels the explorer in an airborne leap forward by one tile over hazardous obstacles. Required to leap across broken bridge gaps in Level 1 and over burning fire pits in Level 3.',
    levels: [1, 2, 3],
    rulesOrNotes: '⚠️ CRITICAL CONSTRAINT IN LEVEL 1: Low-hanging jungle canopy branches prevent jumping on solid ground! You can ONLY jump over broken bridge gaps. In Level 3, jump on tiles where tile index is divisible by 3 (Fire hazards).',
    example: 'If facing gap / fire pit -> Jump(1 step)'
  },
  {
    id: 'action_equip',
    name: 'Equip Item',
    category: 'Actions',
    color: '#c86f1e',
    syntax: 'await game.equip()',
    summary: 'Interacts with the current ground tile to pick up and equip an ancient relic.',
    description: 'Picks up equipment located on the tile where the explorer is currently standing. In Level 2 (The Beast\'s Lair), you must equip the Sword on tile 3 and the Shield on tile 5. Without the Sword you cannot deal damage, and without the Shield you cannot deflect heavy beast smashes.',
    levels: [2],
    rulesOrNotes: 'Must be on the exact tile containing the item (Tile 3 for Sword, Tile 5 for Shield). You must equip both before engaging the beast.',
    example: 'Run 2 tiles -> Equip Item (Sword) -> Run 2 tiles -> Equip Item (Shield)'
  },
  {
    id: 'action_attack',
    name: 'Attack',
    category: 'Actions',
    color: '#8b2020',
    syntax: 'await game.attack()',
    summary: 'Strikes forward with your equipped weapon to damage beasts or defeat enemies.',
    description: 'Executes a forward weapon strike. In Level 2, damages the Guardian Beast only when its guard is dropped. In Level 3, strikes and defeats forest Goblins encountered on the trial path.',
    levels: [2, 3],
    rulesOrNotes: 'In Level 2, only attack when "Is beast vulnerable?" returns TRUE. Attacking when the beast is guarding will result in a deflect and damage to the player. In Level 3, attack on tiles where index is divisible by 5 (Goblins).',
    example: 'If "Is beast vulnerable?" -> Attack'
  },
  {
    id: 'action_defend',
    name: 'Defend',
    category: 'Actions',
    color: '#2266aa',
    syntax: 'await game.defend()',
    summary: 'Raises your equipped shield to block devastating incoming monster attacks.',
    description: 'Enters a guarded stance using your equipped shield to block the Guardian Beast\'s counterattack in Level 2. Essential when the beast prepares to strike while its defensive shield is raised.',
    levels: [2],
    rulesOrNotes: 'In Level 2, use when "Is beast vulnerable?" returns FALSE. Blocking successfully protects the explorer from defeat.',
    example: 'Else -> Defend'
  },
  {
    id: 'action_activate_totem',
    name: 'Activate Totem',
    category: 'Actions',
    color: '#800080',
    syntax: 'await game.activateTotemStep()',
    summary: 'Channels mystic energy into the ancient Totem stone on the current tile.',
    description: 'Awakens an ancient stone Totem checkpoint. In Level 3 (The Path of Trials), each of the 3 trial zones features a 14-step obstacle course followed immediately by a mystic Totem.',
    levels: [3],
    rulesOrNotes: 'Must be called right after finishing the 14-step obstacle path in each zone. Activates the gate to the next zone or completes the trial.',
    example: 'After loop of 14 steps -> Activate Totem'
  },

  // ==================== SENSORS ====================
  {
    id: 'sensor_beast_vulnerable',
    name: 'Is beast vulnerable?',
    category: 'Sensors',
    color: '#dfb125',
    syntax: 'await game.isBeastVulnerable() -> boolean',
    summary: 'Returns true if the Guardian Beast has lowered its defenses, false otherwise.',
    description: 'Inspects the combat stance of the Guardian Beast in Level 2. When the beast lowers its guard, this sensor returns TRUE, creating an opening to Attack. When the beast raises its shield and prepares a smash, this returns FALSE, signaling that you must Defend.',
    levels: [2],
    rulesOrNotes: 'Use this block as the condition in an "if / else" structure inside a repeat loop facing the beast.',
    example: 'if (is beast vulnerable) then { Attack } else { Defend }'
  },

  // ==================== LOGIC ====================
  {
    id: 'controls_if',
    name: 'If / Else If / Else',
    category: 'Logic',
    color: '#6366f1',
    syntax: 'if (condition) { ... } else { ... }',
    summary: 'Executes different blocks of code conditionally based on boolean evaluations.',
    description: 'Tests whether a condition evaluates to true. If true, runs the enclosed blocks. Click the gear icon to add "else if" and "else" branches for multi-path decision making.',
    levels: [1, 2, 3],
    rulesOrNotes: 'Crucial in Level 2 to branch between attacking and defending, and in Level 3 to handle multi-case obstacle checks (divisible by 15, 3, 5, or else run).',
    example: 'if (is_vulnerable) Attack else Defend'
  },
  {
    id: 'logic_compare',
    name: 'Comparison Operator (=, ≠, <, ≤, >, ≥)',
    category: 'Logic',
    color: '#6366f1',
    syntax: 'A == B, A <= B, A > B',
    summary: 'Compares two values (numbers or variables) and returns true or false.',
    description: 'Evaluates relationships between two expressions: equal (=), not equal (≠), less than (<), less than or equal (≤), greater than (>), or greater than or equal (≥).',
    levels: [1, 2, 3],
    rulesOrNotes: 'Used in Level 1 while-loops (e.g., runs <= 5) and in Level 3 to test if remainder equals 0 (e.g., i % 3 == 0).',
    example: 'remainder of i ÷ 3 == 0'
  },
  {
    id: 'logic_operation',
    name: 'Logical Operator (and / or)',
    category: 'Logic',
    color: '#6366f1',
    syntax: 'conditionA && conditionB, conditionA || conditionB',
    summary: 'Combines two boolean expressions using logical AND or logical OR.',
    description: 'AND returns true only when BOTH input conditions evaluate to true. OR returns true when AT LEAST ONE input condition evaluates to true.',
    levels: [1, 2, 3],
    rulesOrNotes: 'Useful for compound condition checking, such as checking if a number is divisible by both 3 and 5.',
    example: '(i % 3 == 0) and (i % 5 == 0)'
  },
  {
    id: 'logic_boolean',
    name: 'Boolean Constant (true / false)',
    category: 'Logic',
    color: '#6366f1',
    syntax: 'true | false',
    summary: 'Outputs a fixed boolean value of either true or false.',
    description: 'Provides a constant true or false truth value that can be plugged into conditional slots or variable initializers.',
    levels: [1, 2, 3],
    rulesOrNotes: 'Can be used for infinite loops ("while true") or flag state flags.',
    example: 'while true do { ... }'
  },

  // ==================== LOOPS ====================
  {
    id: 'controls_repeat_ext',
    name: 'Repeat N Times',
    category: 'Loops',
    color: '#10b981',
    syntax: 'for (let count = 0; count < N; count++) { ... }',
    summary: 'Repeats the enclosed block sequence a specific number of times.',
    description: 'Executes the nested statements N times, where N can be a static number block or a dynamic variable value.',
    levels: [1, 2, 3],
    rulesOrNotes: 'In Level 1: Repeat "Run" N times where N is the current `runs` variable. In Level 2: Repeat 14 runs to reach the beast, and repeat 11 turns to defeat it. In Level 3: Repeat 3 times for the 3 zones.',
    example: 'Repeat [runs] times: Run(1 step)'
  },
  {
    id: 'controls_whileUntil',
    name: 'While / Until Loop',
    category: 'Loops',
    color: '#10b981',
    syntax: 'while (condition) { ... } / until (condition) { ... }',
    summary: 'Repeats execution while a condition is true, or until a condition becomes true.',
    description: 'Continuously loops through enclosed statements as long as the condition evaluates to true ("while"), or stops as soon as the condition turns true ("until").',
    levels: [1, 2, 3],
    rulesOrNotes: 'In Level 1, perfect for controlling the outer loop progression: "while runs <= 5 do { ... }".',
    example: 'while runs <= 5 do { repeat runs { run }; jump; runs = runs + 1 }'
  },
  {
    id: 'controls_for',
    name: 'Count with (For Loop)',
    category: 'Loops',
    color: '#10b981',
    syntax: 'for (let i = FROM; i <= TO; i += BY) { ... }',
    summary: 'Iterates a counter variable from a start value to an end value by a step amount.',
    description: 'Defines an iterator variable (e.g. `i`), starts at the FROM value, and increments by the BY step value on each pass until reaching the TO limit.',
    levels: [1, 2, 3],
    rulesOrNotes: 'Essential for Level 3 (The Path of Trials): "count with i from 1 to 14 by 1" to evaluate each tile index against modulo conditions.',
    example: 'count with i from 1 to 14 by 1 do { check tile i }'
  },

  // ==================== MATH ====================
  {
    id: 'math_number',
    name: 'Number Constant',
    category: 'Math',
    color: '#a855f7',
    syntax: '123',
    summary: 'Provides a numeric constant (integers or decimals).',
    description: 'Allows you to input any numerical value. Used as loop counts, variable values, arithmetic operands, and divisor thresholds.',
    levels: [1, 2, 3],
    rulesOrNotes: 'Click inside the field to enter any number (e.g., 1, 2, 3, 5, 14, 15).',
    example: '10'
  },
  {
    id: 'math_arithmetic',
    name: 'Arithmetic (+, -, ×, ÷, ^)',
    category: 'Math',
    color: '#a855f7',
    syntax: 'A + B, A - B, A * B, A / B',
    summary: 'Performs basic mathematical operations between two numbers.',
    description: 'Computes addition (+), subtraction (-), multiplication (×), division (÷), or exponentiation (^) on two numerical inputs.',
    levels: [1, 2, 3],
    rulesOrNotes: 'In Level 1, used to increment the gap step size: set `runs` to `runs + 1` after each jump.',
    example: 'runs + 1'
  },
  {
    id: 'math_modulo',
    name: 'Remainder / Modulo (%)',
    category: 'Math',
    color: '#a855f7',
    syntax: 'dividend % divisor',
    summary: 'Calculates the integer remainder after division (A % B).',
    description: 'Returns the remainder left over when dividing the first number by the second number. If the remainder of A ÷ B is 0, then A is evenly divisible by B.',
    levels: [1, 2, 3],
    rulesOrNotes: 'Crucial for Level 3 (FizzBuzz logic): remainder of i ÷ 3 == 0 denotes Fire (Jump); remainder of i ÷ 5 == 0 denotes Goblin (Attack).',
    example: 'remainder of i ÷ 3'
  },

  // ==================== VARIABLES ====================
  {
    id: 'variables_set',
    name: 'Set Variable',
    category: 'Variables',
    color: '#f43f5e',
    syntax: 'varName = value;',
    summary: 'Stores a value into a named variable.',
    description: 'Assigns a number, boolean, or expression result to a custom variable name. You can create new variables using the "Create variable..." button in the Variables toolbox.',
    levels: [1, 2, 3],
    rulesOrNotes: 'In Level 1, used to initialize `runs = 1` and update `runs = runs + 1` at each iteration.',
    example: 'set runs to 1'
  },
  {
    id: 'variables_get',
    name: 'Get Variable',
    category: 'Variables',
    color: '#f43f5e',
    syntax: 'varName',
    summary: 'Retrieves and outputs the current value stored in a variable.',
    description: 'Returns the current contents of the chosen variable. Can be connected to any compatible input socket (such as repeat count, comparison, or arithmetic).',
    levels: [1, 2, 3],
    rulesOrNotes: 'Select any created variable from the dropdown menu.',
    example: 'repeat [runs] times'
  },
  {
    id: 'math_change',
    name: 'Change Variable by',
    category: 'Variables',
    color: '#f43f5e',
    syntax: 'varName += delta;',
    summary: 'Adds a specified number to an existing variable value.',
    description: 'Convenient shorthand block to increment or decrement a numeric variable by a fixed delta (e.g., change `runs` by 1).',
    levels: [1, 2, 3],
    rulesOrNotes: 'Can also decrement by supplying a negative number.',
    example: 'change runs by 1'
  },

  // ==================== FUNCTIONS ====================
  {
    id: 'procedures_defnoreturn',
    name: 'Define Function (do)',
    category: 'Functions',
    color: '#d946ef',
    syntax: 'function name() { ... }',
    summary: 'Declares a reusable block of statements under a single named procedure.',
    description: 'Bundles a series of blocks into a reusable named function without a return value. Helps keep your workspace clean and organized, drastically reducing block clutter.',
    levels: [1, 2, 3],
    rulesOrNotes: 'Define repetitive routines (like traversing an entire zone or defeating the guardian) once, then invoke it using the Call Function block.',
    example: 'to traverse_zone: count with i from 1 to 14 ...'
  },
  {
    id: 'procedures_defreturn',
    name: 'Define Function (return)',
    category: 'Functions',
    color: '#d946ef',
    syntax: 'function name() { ...; return result; }',
    summary: 'Declares a reusable procedure that returns a computed result.',
    description: 'Bundles code into a function and outputs a return value that can be connected to input sockets.',
    levels: [1, 2, 3],
    rulesOrNotes: 'Useful for custom mathematical or boolean state helpers.',
    example: 'to check_hazard(tile): return tile % 3 == 0'
  },
  {
    id: 'procedures_callnoreturn',
    name: 'Call Function',
    category: 'Functions',
    color: '#d946ef',
    syntax: 'name();',
    summary: 'Executes a previously defined procedure.',
    description: 'Calls and runs all statements defined in the matching function block.',
    levels: [1, 2, 3],
    rulesOrNotes: 'Appears automatically in the Functions category after defining a function.',
    example: 'traverse_zone()'
  }
];

export const CUSTOM_BLOCK_TOOLTIPS: Record<string, string> = {
  action_run: 'Run(1 step): Advances 1 tile forward along solid ground or bridge. Fails if moving into a broken bridge chasm, hazard pit, or flame trap.',
  action_jump: 'Jump(1 step): Leaps forward 1 tile over a gap or fire pit. In Level 1, low-hanging overhead jungle branches prevent jumping on solid ground — you can ONLY jump across gaps!',
  action_equip: 'Equip Item: Interacts with your current tile to pick up a relic (Sword on Tile 3, Shield on Tile 5). Required before attacking or defending against the beast.',
  action_attack: 'Attack: Strikes forward with your equipped weapon. Deals damage to the Beast when its guard is dropped (Level 2), or defeats Goblins on tiles divisible by 5 (Level 3).',
  action_defend: 'Defend: Raises your equipped shield to block heavy beast smashes in Level 2. Essential when the Beast prepares to strike while guarding.',
  sensor_beast_vulnerable: 'Is beast vulnerable?: Returns TRUE if the Guardian Beast has lowered its defenses (opening to Attack). Returns FALSE if the Beast is preparing to strike or blocking (time to Defend).',
  action_activate_totem: 'Activate Totem: Awakens the ancient stone checkpoint Totem on your current tile. Activates the gate to the next zone at the end of each 14-step trial path in Level 3.'
};
