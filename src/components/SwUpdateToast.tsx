import React, { useEffect, useState } from 'react';
import { Button, message } from 'antd';

export default function SwUpdateToast() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onUpdated = () => setVisible(true);
    window.addEventListener('swUpdated', onUpdated as any);
    return () => window.removeEventListener('swUpdated', onUpdated as any);
  }, []);
  const apply = async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    regs.forEach((r) => r.waiting?.postMessage({ type: 'SKIP_WAITING' }));
    message.success('已应用更新，刷新页面...');
    setTimeout(() => location.reload(), 600);
  };
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 9999 }}>
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: 12, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ marginBottom: 8 }}>新的应用版本可用</div>
        <Button type="primary" onClick={apply}>更新并刷新</Button>
      </div>
    </div>
  );
}
