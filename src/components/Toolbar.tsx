import React from 'react';
import { Button, Space } from 'antd';
import { useStore } from '../store/useStore';

export default function Toolbar() {
  const createProject = useStore((s) => s.createProject);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  return (
    <div style={{ width: 64, display: 'flex', flexDirection: 'column', gap: 8, padding: 8 }}>
      <Space direction="vertical">
        <Button onClick={() => createProject('新项目')}>新建</Button>
        <Button onClick={() => undo()}>撤销</Button>
        <Button onClick={() => redo()}>重做</Button>
      </Space>
    </div>
  );
}
