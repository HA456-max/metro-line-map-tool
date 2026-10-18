import React from 'react';
import { Card } from 'antd';
import { useStore } from '../store/useStore';

const icons = [
  { key: 'dot', url: '/assets/icons/dot.svg' },
  { key: 'transfer', url: '/assets/icons/transfer.svg' },
  { key: 'star', url: '/assets/icons/star.svg' }
];

export default function IconPicker({ stationId }: { stationId: string }) {
  const updateStation = useStore((s) => s.updateStation);
  return (
    <Card>
      <h4>选择站点图标</h4>
      <div style={{ display: 'flex', gap: 8 }}>
        {icons.map((ic) => (
          <div key={ic.key} onClick={() => updateStation(stationId, { icon: ic.key })} style={{ cursor: 'pointer' }}>
            <img src={ic.url} width={28} height={28} alt={ic.key} />
          </div>
        ))}
      </div>
    </Card>
  );
}
