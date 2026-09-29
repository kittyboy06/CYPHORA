import React, { useState } from 'react';
import {
  BatteryCharging,
  Check,
  Clock,
  Compass,
  Cpu,
  FileSearch,
  Gauge,
  Info,
  Laptop,
  Network,
  Power,
  Radio,
  ScanSearch,
  Settings,
  ShieldCheck,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import './SettingsApp.css';

const NETWORKS = [
  { name: 'EXPEDITION-NETWORK', detail: 'Protected expedition relay', signal: 'Strong', secured: true },
  { name: 'CYPHORA-GUEST', detail: 'Limited access', signal: 'Medium', secured: false },
  { name: 'FIELD-ARCHIVE', detail: 'Out of range', signal: 'Weak', secured: true }
];

const POWER_PROFILES = [
  { id: 'BALANCED', name: 'Balanced', detail: 'Automatic balance between battery life and performance.', icon: Gauge },
  { id: 'EXPEDITION_FIELD_MODE', name: 'Expedition Field Mode', detail: 'Prioritize relay power and field equipment readiness.', icon: BatteryCharging },
  { id: 'PERFORMANCE', name: 'High performance', detail: 'Maximum simulated workstation performance.', icon: Power }
];

const EXPEDITION_CLOCK = 'CYPHORA-EXPEDITION-02-17-1985-22:41';

export function SettingsApp({ meta = {} }) {
  const { eventBus } = useOS();
  const [section, setSection] = useState(meta.settingsSection || 'system');
  const [connectedNetwork, setConnectedNetwork] = useState(null);
  const [powerProfile, setPowerProfile] = useState('BALANCED');
  const [clockValue, setClockValue] = useState(EXPEDITION_CLOCK);
  const [clockApplied, setClockApplied] = useState(false);
  const [systemVerified, setSystemVerified] = useState(false);

  const connectNetwork = (network) => {
    setConnectedNetwork(network.name);
    eventBus.emit('WIFI_ENABLED', { enabled: true });
    eventBus.emit('NETWORK_SELECTED', { network: network.name });
    eventBus.emit('NETWORK_CONNECTED', { connected: true, network: network.name });
  };

  const changePowerProfile = (profile) => {
    setPowerProfile(profile.id);
    eventBus.emit('POWER_PROFILE_CHANGED', { powerProfile: profile.id });
  };

  const applyClock = (value = clockValue) => {
    if (value !== EXPEDITION_CLOCK) {
      setClockApplied(false);
      return;
    }

    setClockValue(value);
    setClockApplied(true);
    eventBus.emit('CLOCK_CHANGED', { clock: value });
  };

  const verifySystemInfo = () => {
    setSystemVerified(true);
    eventBus.emit('SYSTEM_INFO_VIEWED', { machineId: 'EXPEDITION-7G-ALPHA' });
  };

  const completeExpeditionTool = (eventName, payload) => {
    eventBus.emit(eventName, payload);
  };

  return (
    <div className="settings-app">
      <aside className="settings-sidebar">
        <div className="settings-sidebar-heading">
          <Settings size={18} />
          <span>System settings</span>
        </div>
        <button className={`settings-nav-item ${section === 'system' ? 'active' : ''}`} onClick={() => setSection('system')}>
          <Laptop size={17} /> <span>System</span>
        </button>
        <button className={`settings-nav-item ${section === 'network' ? 'active' : ''}`} onClick={() => setSection('network')}>
          <Network size={17} /> <span>Network &amp; Wi-Fi</span>
          <span className={`settings-nav-status ${connectedNetwork ? 'ready' : ''}`} />
        </button>
        <button className={`settings-nav-item ${section === 'power' ? 'active' : ''}`} onClick={() => setSection('power')}>
          <BatteryCharging size={17} /> <span>Power &amp; battery</span>
        </button>
        <button className={`settings-nav-item ${section === 'clock' ? 'active' : ''}`} onClick={() => setSection('clock')}>
          <Clock size={17} /> <span>Chronometer</span>
        </button>
        <button className={`settings-nav-item ${section === 'expedition' ? 'active' : ''}`} onClick={() => setSection('expedition')}>
          <Compass size={17} /> <span>Expedition tools</span>
        </button>
        <div className="settings-sidebar-footer">
          <ShieldCheck size={15} />
          <span>Protected expedition workstation</span>
        </div>
      </aside>

      <main className="settings-main">
        {section === 'system' && (
          <section className="settings-section">
            <div className="settings-title-row">
              <div><span className="settings-eyebrow">SYSTEM</span><h2>About this workstation</h2></div>
              <Cpu size={28} className="settings-title-icon" />
            </div>
            <p className="settings-lede">Review the virtual machine identity and expedition environment status.</p>
            <div className="settings-info-grid">
              <div className="settings-info-card"><span>DEVICE</span><strong>CYPHORA-NAVIGATOR</strong></div>
              <div className="settings-info-card"><span>FIELD NODE</span><strong>EXPEDITION-7G-ALPHA</strong></div>
              <div className="settings-info-card"><span>SYSTEM</span><strong className="settings-status-good"><Check size={15} /> Ready</strong></div>
              <div className="settings-info-card"><span>SYSTEM BUILD</span><strong>Navigator 1.0.4</strong></div>
              <div className="settings-info-card"><span>NETWORK</span><strong>EXPEDITION RELAY</strong></div>
              <div className="settings-info-card"><span>SECURITY</span><strong>ENCLAVE VERIFIED</strong></div>
            </div>
            <button type="button" className="settings-verify-button" onClick={verifySystemInfo}>
              {systemVerified ? <><Check size={15} /> Machine ID verified</> : 'VERIFY MACHINE ID'}
            </button>
            <div className="settings-callout"><Info size={17} /><span>This is a simulated workstation. Changes here control the expedition environment and do not affect the host computer.</span></div>
          </section>
        )}

        {section === 'network' && (
          <section className="settings-section">
            <div className="settings-title-row">
              <div><span className="settings-eyebrow">NETWORK</span><h2>Wi-Fi</h2></div>
              {connectedNetwork ? <Wifi size={28} className="settings-title-icon connected" /> : <WifiOff size={28} className="settings-title-icon" />}
            </div>
            <div className="settings-network-summary">
              <div><strong>{connectedNetwork || 'Not connected'}</strong><span>{connectedNetwork ? 'Connected and ready for relay traffic' : 'Choose a network below to connect'}</span></div>
              <span className={`settings-pill ${connectedNetwork ? 'connected' : ''}`}>{connectedNetwork ? 'CONNECTED' : 'OFFLINE'}</span>
            </div>
            <div className="settings-list-heading">AVAILABLE NETWORKS</div>
            <div className="settings-network-list">
              {NETWORKS.map(network => (
                <button key={network.name} className={`settings-network-row ${connectedNetwork === network.name ? 'selected' : ''}`} onClick={() => connectNetwork(network)}>
                  <Wifi size={19} />
                  <span className="settings-network-copy"><strong>{network.name}</strong><small>{network.detail} · {network.signal} signal</small></span>
                  {network.secured && <ShieldCheck size={15} className="network-secure" />}
                  {connectedNetwork === network.name ? <Check size={18} className="network-check" /> : <span className="network-connect-label">Connect</span>}
                </button>
              ))}
            </div>
          </section>
        )}

        {section === 'power' && (
          <section className="settings-section">
            <div className="settings-title-row">
              <div><span className="settings-eyebrow">POWER</span><h2>Power &amp; battery</h2></div>
              <Power size={28} className="settings-title-icon" />
            </div>
            <div className="settings-battery-card"><BatteryCharging size={25} /><div><strong>Expedition battery</strong><span>100% · Simulated external power connected</span></div><span className="battery-ready">READY</span></div>
            <div className="settings-list-heading">POWER MODE</div>
            <div className="settings-power-list">
              {POWER_PROFILES.map(profile => {
                const Icon = profile.icon;
                return <button key={profile.id} className={`settings-power-row ${powerProfile === profile.id ? 'selected' : ''}`} onClick={() => changePowerProfile(profile)}><span className="settings-power-icon"><Icon size={20} /></span><span className="settings-network-copy"><strong>{profile.name}</strong><small>{profile.detail}</small></span>{powerProfile === profile.id && <Check size={19} className="network-check" />}</button>;
              })}
            </div>
          </section>
        )}

        {section === 'clock' && (
          <section className="settings-section">
            <div className="settings-title-row">
              <div><span className="settings-eyebrow">TIME</span><h2>Expedition chronometer</h2></div>
              <Clock size={28} className="settings-title-icon" />
            </div>
            <p className="settings-lede">Set the simulated workstation clock using the recovered expedition timestamp.</p>
            <div className="settings-clock-card">
              <label htmlFor="expedition-clock">RECOVERED TIMESTAMP</label>
              <input id="expedition-clock" value={clockValue} onChange={(event) => { setClockValue(event.target.value); setClockApplied(false); }} placeholder="CYPHORA-EXPEDITION-02-17-1985-22:41" />
              <div className="settings-clock-actions">
                <button type="button" onClick={() => applyClock(EXPEDITION_CLOCK)}>USE RECOVERED TIME</button>
                <button type="button" className="settings-clock-secondary" onClick={applyClock}>APPLY TIME</button>
              </div>
              {clockApplied && <span className="settings-clock-success"><Check size={15} /> Chronometer synchronized</span>}
            </div>
          </section>
        )}

        {section === 'expedition' && (
          <section className="settings-section">
            <div className="settings-title-row">
              <div><span className="settings-eyebrow">FIELD SYSTEMS</span><h2>Expedition tools</h2></div>
              <Compass size={28} className="settings-title-icon" />
            </div>
            <p className="settings-lede">Inspect and restore the expedition systems from this workstation control panel.</p>
            <div className="settings-expedition-tools">
              <button onClick={() => completeExpeditionTool('PROCESS_SELECTED', { processName: 'TELEMETRY_BRIDGE', publisher: 'Unknown' })}><ScanSearch size={19} /><span><strong>Inspect running processes</strong><small>Find the process that does not belong (TELEMETRY BRIDGE).</small></span></button>
              <button onClick={() => completeExpeditionTool('DISTRESS_LOG_FOUND', { filePath: '/Documents/.distress_log.txt', query: 'distress_log' })}><FileSearch size={19} /><span><strong>Search field records</strong><small>Recover the message the machine remembers.</small></span></button>
              <button onClick={() => completeExpeditionTool('TRAIL_ROUTE_RESOLVED', { route: 'EASTNORTHSOUTH' })}><Compass size={19} /><span><strong>Decode trail markers</strong><small>Resolve the route toward the light.</small></span></button>
              <button onClick={() => completeExpeditionTool('FILE_EXTRACTED', { archived: true, fileName: 'expedition_archive.zip', accessKey: 'EXPEDITION-7G-ALPHA|EASTNORTHSOUTH|MARA-VALE' })}><FileSearch size={19} /><span><strong>Unlock expedition archive</strong><small>Prove the evidence belongs to this expedition.</small></span></button>
              <button onClick={() => completeExpeditionTool('NAVIGATION_ACTIVATED', { route: 'EASTNORTHSOUTH', activated: true })}><Radio size={19} /><span><strong>Activate navigation</strong><small>Lock in the recovered route.</small></span></button>
              <button onClick={() => completeExpeditionTool('BEACON_ACTIVATED', { beacon: true, ready: true })}><Power size={19} /><span><strong>Trigger the beacon</strong><small>Send the final signal.</small></span></button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}