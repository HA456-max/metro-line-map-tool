import React, { useState, useEffect } from 'react';
import { Card, Input, InputNumber, Button } from 'antd';

const STORAGE_KEY = 'metro_custom_styles_v1';

export default function StyleCustomizer() {
  const [name, setName] = useState('');
  const [accent, setAccent] = useState('#3b82f6');
  const [panelBg, setPanelBg] = useState('#ffffff');
  const [radius, setRadius] = useState(8);
  const [shadow, setShadow] = useState(0.06);
  const [saved, setSaved] = useState<any[]>([]);

  useEffect(() => { const s = localStorage.getItem(STORAGE_KEY); if (s) setSaved(JSON.parse(s)); }, []);
  const save = () => {
    const style = { name: name || `自定义${saved.length + 1}`, vars: { '--accent': accent, '--panel-bg': panelBg, '--radius': `${radius}px`, '--shadow': `rgba(0,0,0,${shadow})` } };
    const next = [...saved, style];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(next);
  };
  const apply = (style: any) => { Object.entries(style.vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v)); localStorage.setItem('uiFlavor', 'custom'); localStorage.setItem('uiCustomName', style.name); };

  return (
    <Card style={{ position: 'absolute', right: 12, top: 12, width: 280 }}>
      <h4>自定义 UI 风格</h4>
      <div>
        <div>名称</div>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <div style={{ marginTop: 8 }}>强调色</div>
        <Input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
        <div style={{ marginTop: 8 }}>面板背景</div>
        <Input type="color" value={panelBg} onChange={(e) => setPanelBg(e.target.value)} />
        <div style={{ marginTop: 8 }}>圆角 (px)</div>
        <InputNumber value={radius} onChange={(v) => setRadius(v || 0)} />
        <div style={{ marginTop: 8 }}>阴影强度 (0-0.5)</div>
        <InputNumber step={0.01} min={0} max={0.5} value={shadow} onChange={(v) => setShadow(v as number)} />
        <div style={{ marginTop: 12 }}>
          <Button type="primary" onClick={save}>保存样式</Button>
        </div>
        <div style={{ marginTop: 12 }}>
          <h5>已保存样式</h5>
          {saved.map((s) => (
            <div key={s.name} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <div style={{ flex: 1 }}>{s.name}</div>
              <Button onClick={() => apply(s)}>应用</Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
