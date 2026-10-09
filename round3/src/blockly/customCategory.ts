import * as Blockly from 'blockly';

const CATEGORY_ICONS: Record<string, string> = {
  Actions: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  Sensors: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  Logic: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>`,
  Loops: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="m7 22-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>`,
  Math: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`,
  Variables: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>`,
  Functions: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`
};

export class TempleToolboxCategory extends Blockly.ToolboxCategory {
  protected addColourBorder_(colour: string): void {
    if (this.rowDiv_) {
      this.rowDiv_.style.borderLeft = 'none';
      this.rowDiv_.style.setProperty('--cat-color', colour);
      const categoryName = (this.name_ || '').toLowerCase();
      this.rowDiv_.classList.add(`cat-${categoryName}`);
    }
  }

  setSelected(isSelected: boolean): void {
    super.setSelected(isSelected);
    if (this.rowDiv_) {
      this.rowDiv_.style.backgroundColor = '';
      if (isSelected) {
        this.rowDiv_.classList.add('blocklyTreeSelected');
      } else {
        this.rowDiv_.classList.remove('blocklyTreeSelected');
      }
    }
  }

  protected createIconDom_(): Element {
    const iconSpan = document.createElement('span');
    iconSpan.className = 'blocklyTreeIcon temple-category-icon';
    iconSpan.setAttribute('role', 'presentation');
    const svg = CATEGORY_ICONS[this.name_] || `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`;
    iconSpan.innerHTML = svg;
    return iconSpan;
  }
}

export function registerTempleCategory() {
  try {
    Blockly.registry.register(
      Blockly.registry.Type.TOOLBOX_ITEM,
      Blockly.ToolboxCategory.registrationName,
      TempleToolboxCategory,
      true
    );
  } catch (err) {
    console.warn('[Blockly] Failed to register custom TempleToolboxCategory:', err);
  }
}
