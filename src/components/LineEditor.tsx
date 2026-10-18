import React, { useState } from 'react';
import { Card, Select, Button, Input } from 'antd';
import { useStore } from '../store/useStore';

export default function LineEditor() {
  const projects = useStore((s) => s.projects);
  const pid = useStore((s) => s.currentProjectId);
  const addLine = useStore((s) => s.addLine);
  const addStation = useStore((s) => s.addStation);
  const updateLine = useStore((s) => s.updateLine);
  const removeLine = useStore((s) => s.removeLine);

  const project = pid ? projects[pid] : undefined;
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [newLineName, setNewLineName] = useState('');

  return (
    <div style={{ position: 'absolute', left: 80, top: 12, width: 320 }}>
      <Card className="panel">
        <h4>线路编辑</h4>
        <div style={{ marginBottom: 8 }}>
          <Input placeholder="新线路名称" value={newLineName} onChange={(e) => setNewLineName(e.target.value)} />
          <Button style={{ marginTop: 6 }} onClick={() => { addLine({ name: newLineName || '新线路' }); setNewLineName(''); }}>新建线路</Button>
        </div>
        <div>
          <Select style={{ width: '100%' }} value={selectedLine} onChange={(v) => setSelectedLine(v)}>
            {project && Object.values(project.lines).map((l) => <Select.Option key={l.id} value={l.id}>{l.name}</Select.Option>)}
          </Select>
        </div>
        {selectedLine && (
          <div style={{ marginTop: 8 }}>
            <Button danger onClick={() => { removeLine(selectedLine); setSelectedLine(null); }}>删除线路</Button>
            <div style={{ marginTop: 8 }}>
              <Button onClick={() => {
                const sId = addStation({ name: '新站', pos: { x: 0, y: 0 } });
                const line = project!.lines[selectedLine];
                updateLine(selectedLine, { stationIds: [...line.stationIds, sId] });
              }}>在线路末尾添加站点</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
