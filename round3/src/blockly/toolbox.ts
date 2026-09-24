export const toolboxXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="Actions" colour="#5b80a5">
    <block type="action_run"></block>
    <block type="action_jump"></block>
  </category>
  <category name="Logic" colour="#5b80a5">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_boolean"></block>
  </category>
  <category name="Loops" colour="#5ba55b">
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
  <category name="Math" colour="#5b67a5">
    <block type="math_number"></block>
    <block type="math_arithmetic"></block>
    <block type="math_modulo"></block>
  </category>
  <category name="Variables" colour="#a55b80" custom="VARIABLE"></category>
  <category name="Functions" colour="#995ba5" custom="PROCEDURE"></category>
</xml>
`;
