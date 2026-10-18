import React from 'react';
import { useStore } from '../store/useStore';
import { List, Button } from 'antd';

export default function Sidebar() {
  const projects = useStore((s) => s.projects);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const switchProject = useStore((s) => s.switchProject);
  const deleteProject = useStore((s) => s.deleteProject);
  const createProject = useStore((s) => s.createProject);

  return (
    <div style={{ width: 320, padding: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <Button onClick={() => createProject('New')}>新建工程</Button>
      </div>
      <div>
        <h4>工程</h4>
        <List dataSource={Object.values(projects)} renderItem={(p: any) => (
          <List.Item actions={[<Button key="switch" onClick={() => switchProject(p.id)}>切换</Button>, <Button key="del" danger onClick={() => deleteProject(p.id)}>删除</Button>] }>{p.name}</List.Item>
        )} />
      </div>
    </div>
  );
}
