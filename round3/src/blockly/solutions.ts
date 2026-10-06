export const SOLUTIONS: Record<number, string> = {
  1: `<xml>
  <block type="variables_set">
    <field name="VAR">runs</field>
    <value name="VALUE">
      <block type="math_number"><field name="NUM">1</field></block>
    </value>
    <next>
      <block type="controls_whileUntil">
        <field name="MODE">WHILE</field>
        <value name="BOOL">
          <block type="logic_compare">
            <field name="OP">LTE</field>
            <value name="A"><block type="variables_get"><field name="VAR">runs</field></block></value>
            <value name="B"><block type="math_number"><field name="NUM">5</field></block></value>
          </block>
        </value>
        <statement name="DO">
          <block type="controls_repeat_ext">
            <value name="TIMES"><block type="variables_get"><field name="VAR">runs</field></block></value>
            <statement name="DO">
              <block type="action_run"></block>
            </statement>
            <next>
              <block type="action_jump">
                <next>
                  <block type="variables_set">
                    <field name="VAR">runs</field>
                    <value name="VALUE">
                      <block type="math_arithmetic">
                        <field name="OP">ADD</field>
                        <value name="A"><block type="variables_get"><field name="VAR">runs</field></block></value>
                        <value name="B"><block type="math_number"><field name="NUM">1</field></block></value>
                      </block>
                    </value>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </next>
  </block>
</xml>`,
  2: `<xml>
  <block type="controls_repeat_ext">
    <value name="TIMES"><block type="math_number"><field name="NUM">2</field></block></value>
    <statement name="DO"><block type="action_run"></block></statement>
    <next>
      <block type="action_equip"><next>
        <block type="controls_repeat_ext">
          <value name="TIMES"><block type="math_number"><field name="NUM">2</field></block></value>
          <statement name="DO"><block type="action_run"></block></statement>
          <next>
            <block type="action_equip"><next>
              <block type="controls_repeat_ext">
                <value name="TIMES"><block type="math_number"><field name="NUM">14</field></block></value>
                <statement name="DO"><block type="action_run"></block></statement>
                <next>
                  <block type="controls_repeat_ext">
                    <value name="TIMES"><block type="math_number"><field name="NUM">11</field></block></value>
                    <statement name="DO">
                      <block type="controls_if">
                        <mutation else="1"></mutation>
                        <value name="IF0"><block type="sensor_beast_vulnerable"></block></value>
                        <statement name="DO0"><block type="action_attack"></block></statement>
                        <statement name="ELSE"><block type="action_defend"></block></statement>
                      </block>
                    </statement>
                  </block>
                </next>
              </block>
            </next></block>
          </next>
        </block>
      </next></block>
    </next>
  </block>
</xml>`,
  3: `<xml>
  <block type="controls_repeat_ext">
    <value name="TIMES"><block type="math_number"><field name="NUM">3</field></block></value>
    <statement name="DO">
      <block type="controls_for">
        <field name="VAR">i</field>
        <value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value>
        <value name="TO"><block type="math_number"><field name="NUM">14</field></block></value>
        <value name="BY"><block type="math_number"><field name="NUM">1</field></block></value>
        <statement name="DO">
          <block type="controls_if">
            <mutation elseif="2" else="1"></mutation>
            <value name="IF0">
              <block type="logic_compare">
                <field name="OP">EQ</field>
                <value name="A">
                  <block type="math_modulo">
                    <value name="DIVIDEND"><block type="variables_get"><field name="VAR">i</field></block></value>
                    <value name="DIVISOR"><block type="math_number"><field name="NUM">15</field></block></value>
                  </block>
                </value>
                <value name="B"><block type="math_number"><field name="NUM">0</field></block></value>
              </block>
            </value>
            <statement name="DO0"><block type="action_run"></block></statement>
            <value name="IF1">
              <block type="logic_compare">
                <field name="OP">EQ</field>
                <value name="A">
                  <block type="math_modulo">
                    <value name="DIVIDEND"><block type="variables_get"><field name="VAR">i</field></block></value>
                    <value name="DIVISOR"><block type="math_number"><field name="NUM">3</field></block></value>
                  </block>
                </value>
                <value name="B"><block type="math_number"><field name="NUM">0</field></block></value>
              </block>
            </value>
            <statement name="DO1"><block type="action_jump"></block></statement>
            <value name="IF2">
              <block type="logic_compare">
                <field name="OP">EQ</field>
                <value name="A">
                  <block type="math_modulo">
                    <value name="DIVIDEND"><block type="variables_get"><field name="VAR">i</field></block></value>
                    <value name="DIVISOR"><block type="math_number"><field name="NUM">5</field></block></value>
                  </block>
                </value>
                <value name="B"><block type="math_number"><field name="NUM">0</field></block></value>
              </block>
            </value>
            <statement name="DO2"><block type="action_attack"></block></statement>
            <statement name="ELSE"><block type="action_run"></block></statement>
          </block>
        </statement>
        <next>
          <block type="action_activate_totem"></block>
        </next>
      </block>
    </statement>
  </block>
</xml>`
};
