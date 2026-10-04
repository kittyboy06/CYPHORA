import re

with open('src/blockly/solutions.ts', 'r', encoding='utf-8') as f:
    code = f.read()

sol2 = r'''<xml>
  <block type="action_run"><next>
  <block type="action_run"><next>
  <block type="action_equip"><next>
  <block type="action_run"><next>
  <block type="action_run"><next>
  <block type="action_equip"><next>
  <block type="action_run"><next>
  <block type="action_run"><next>
  <block type="action_run"><next>
  <block type="controls_repeat_ext">
    <value name="TIMES"><block type="math_number"><field name="NUM">10</field></block></value>
    <statement name="DO">
      <block type="controls_if">
        <mutation else="1"></mutation>
        <value name="IF0">
          <block type="sensor_beast_vulnerable"></block>
        </value>
        <statement name="DO0">
          <block type="action_attack"></block>
        </statement>
        <statement name="ELSE">
          <block type="action_defend"></block>
        </statement>
      </block>
    </statement>
  </block>
  </next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</xml>'''

# Replace the 2: <xml> ... </xml> block
code = re.sub(r'2: <xml>.*?</xml>,', f'2: {sol2},', code, flags=re.DOTALL)

with open('src/blockly/solutions.ts', 'w', encoding='utf-8') as f:
    f.write(code)
