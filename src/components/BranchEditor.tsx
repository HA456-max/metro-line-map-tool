import React from 'react';
import { Card, List, Button, Popconfirm } from 'antd';
import { useStore } from '../store/useStore';

export default function BranchEditor({ lineId }: { lineId: string }) {
  const projects = useStore((s) => s.projects);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const removeBranch = useStore((s) => s.removeBranch);
  const project = currentProjectId ? projects[currentProjectId] : undefined;
  if (!project) return null;
  const line = project.lines[lineId];
  if (!line || !line.branches) return <Card>该线路暂无分支</Card>;
  return (
    <Card title="分支列表">
      <List dataSource={line.branches} renderItem={(b: any) => (
        <List.Item actions={[
          <Popconfirm title="删除该分支?" onConfirm={() => removeBranch(lineId, b.id)} okText="删除" cancelText="取消"><Button danger>删除</Button></Popconfirm>
        ]}>{b.id}</List.Item>
      )} />
    </Card>
  );
}
