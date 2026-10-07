import React from 'react';
import { useOS } from '../state/OSContext.jsx';
import { WindowFrame } from './WindowFrame.jsx';
import { APP_REGISTRY } from '../apps/registry.js';

const ROUND3_APP_IDS = ['round3', 'jungle-code', 'temple-trials'];

export function WindowManager() {
  const { windows } = useOS();

  return (
    <div className="window-manager-layer">
      {windows.map(win => {
        // Round 3 is rendered as full-screen kiosk mode directly in OSContainer
        if (ROUND3_APP_IDS.includes(win.appId)) {
          return null;
        }

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
