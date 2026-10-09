export function getToolboxXml(level: number): string {
  let actions = `
    <block type="action_run"></block>
    <block type="action_jump"></block>
  `;
  
  if (level === 2) {
    actions += `
      <block type="action_equip"></block>
      <block type="action_attack"></block>
      <block type="action_defend"></block>
    `;
  }
  if (level === 3) {
    actions += `
      <block type="action_attack"></block>
      <block type="action_activate_totem"></block>
    `;
  }

  let sensors = '';
  if (level === 2) {
    sensors = `<category name="Sensors" colour="#eab308">
      <block type="sensor_beast_vulnerable"></block>
    </category>`;
  }

  return `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="Actions" colour="#38bdf8">
    ${actions}
  </category>
  ${sensors}
  <category name="Logic" colour="#6366f1">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_boolean"></block>
  </category>
  <category name="Loops" colour="#10b981">
    <block type="controls_repeat_ext">
      <value name="TIMES">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
    </block>
    <block type="controls_whileUntil"></block>
    <block type="controls_for">
      <value name="FROM">
        <shadow type="math_number"><field name="NUM">1</field></shadow>
      </value>
      <value name="TO">
        <shadow type="math_number"><field name="NUM">10</field></shadow>
      </value>
      <value name="BY">
        <shadow type="math_number"><field name="NUM">1</field></shadow>
      </value>
    </block>
  </category>
  <category name="Math" colour="#a855f7">
    <block type="math_number"></block>
    <block type="math_arithmetic"></block>
    <block type="math_modulo"></block>
  </category>
  <category name="Variables" colour="#f43f5e" custom="VARIABLE"></category>
  <category name="Functions" colour="#d946ef" custom="PROCEDURE"></category>
</xml>
  `;
}

// Fallback for initialization
export const toolboxXml = getToolboxXml(1);
