import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import * as Blockly from 'blockly';
import 'blockly/javascript';
import { setupBlocks } from '../blockly/customBlocks';
import { getToolboxXml } from '../blockly/toolbox';
import { javascriptGenerator } from 'blockly/javascript';

interface BlocklyEditorProps {
  level: number;
}

const BlocklyEditor = forwardRef<any, BlocklyEditorProps>(({ level }, ref) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  useImperativeHandle(ref, () => ({
    getGeneratedCode: () => {
      if (!workspaceRef.current) return '';
      // @ts-ignore
      return javascriptGenerator.workspaceToCode(workspaceRef.current);
    },
    highlightBlock: (id: string | null) => {
      if (workspaceRef.current) {
        workspaceRef.current.highlightBlock(id);
      }
    },
    setXml: (xmlString: string) => {
      if (!workspaceRef.current) return;
      workspaceRef.current.clear();
      const dom = Blockly.utils.xml.textToDom(xmlString);
      Blockly.Xml.domToWorkspace(dom, workspaceRef.current);
    }
  }));

  useEffect(() => {
    if (blocklyDiv.current && !workspaceRef.current) {
      setupBlocks();
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: getToolboxXml(level),
        grid: { spacing: 25, length: 3, colour: '#333', snap: true },
        trashcan: true,
        move: { scrollbars: true, drag: true, wheel: true },
        zoom: { controls: false, wheel: false, startScale: 1.0 },
        renderer: 'zelos',
      });
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (workspaceRef.current) {
      workspaceRef.current.updateToolbox(getToolboxXml(level));
    }
  }, [level]);

  return <div ref={blocklyDiv} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}></div>;
});

export default BlocklyEditor;
