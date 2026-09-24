import React from 'react';
import { useOS } from '../state/OSContext.jsx';
import { WindowFrame } from './WindowFrame.jsx';
import { APP_REGISTRY } from '../apps/registry.js';

export function WindowManager() {
  const { windows } = useOS();

  return (
    <div className="window-manager-layer">
      {windows.map(win => {
        const appDef = APP_REGISTRY[win.appId];
        if (!appDef) return null;

        const AppComponent = appDef.component;

        return (
          <WindowFrame key={win.id} windowInstance={win}>
            <AppComponent windowId={win.id} meta={win.meta} />
          </WindowFrame>
        );
      })}
    </div>
  );
}
