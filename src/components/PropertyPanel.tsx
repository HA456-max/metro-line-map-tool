import React from 'react';
import { Card, Form, Input, InputNumber, Select, Radio, Button, Divider } from 'antd';
import { useStore } from '../store/useStore';

export default function PropertyPanel() {
  const selection = useStore((s) => s.selectionIds);
  const projects = useStore((s) => s.projects);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const updateStation = useStore((s) => s.updateStation);
  const clearSelection = useStore((s) => s.clearSelection);

  const project = currentProjectId ? projects[currentProjectId] : undefined;
  const selectedStation = selection && selection.length === 1 ? project?.stations[selection[0]] : undefined;

  return (
    <div style={{ position: 'absolute', right: 340, top: 12, width: 280 }}>
      <Card className="panel">
        <h4>属性面板</h4>
        {selectedStation ? (
          <Form layout="vertical" initialValues={{ ...selectedStation }} onFinish={(vals) => updateStation(selectedStation.id, vals)}>
            <Form.Item label="站名" name="name"><Input /></Form.Item>
            <Form.Item label="编号" name="code"><Input /></Form.Item>
            <Form.Item label="类型" name="type">
              <Select>
                <Select.Option value="normal">普通</Select.Option>
                <Select.Option value="transfer">换乘</Select.Option>
                <Select.Option value="terminal">终点</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="标签位置" name="labelPosition">
              <Radio.Group>
                <Radio value="top">上</Radio>
                <Radio value="bottom">下</Radio>
                <Radio value="left">左</Radio>
                <Radio value="right">右</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">应用</Button>
              <Button style={{ marginLeft: 8 }} onClick={() => clearSelection()}>取消选择</Button>
            </Form.Item>
          </Form>
        ) : (
          <div>请选择单个站点进行编辑</div>
        )}
        <Divider />
        <div>
          <h4>线路属性（示例）</h4>
          <p>选中线路时在这里编辑颜色/宽度/线型/环线/支线</p>
        </div>
      </Card>
    </div>
  );
}
