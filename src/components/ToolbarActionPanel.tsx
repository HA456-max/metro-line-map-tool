import React, { useState } from 'react';
import { Button, Modal, Upload, Select, message } from 'antd';
import { useStore } from '../store/useStore';

/**
 * ToolbarActionPanel
 * Toolbar 入口：导入/导出、冲突策略设置、快速工具入口
 */
export default function ToolbarActionPanel() {
  const exportProjectJSON = useStore((s) => s.exportProjectJSON);
  const importProjectJSON = useStore((s) => s.importProjectJSON);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const [visible, setVisible] = useState(false);
  const [strategy, setStrategy] = useState<'rename' | 'overwrite' | 'merge'>('rename');

  const handleExport = () => {
    if (!currentProjectId) return message.error('没有当前工程');
    const json = exportProjectJSON(currentProjectId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${currentProjectId}.json`; a.click();
    URL.revokeObjectURL(url);
    message.success('工程已导出');
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const result = importProjectJSON(text, strategy);
    if (result.ok) message.success(result.message);
    else message.error(result.message);
    setVisible(false);
    return false;
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button onClick={handleExport}>导出 JSON</Button>
        <Button onClick={() => setVisible(true)}>导入 JSON</Button>
      </div>

      <Modal title="工程导入/导出" open={visible} onCancel={() => setVisible(false)} footer={null}>
        <div style={{ marginBottom: 12 }}>
          <span>冲突策略：</span>
          <Select value={strategy} onChange={(v) => setStrategy(v)} style={{ width: 220, marginLeft: 8 }}>
            <Select.Option value="rename">自动重命名</Select.Option>
            <Select.Option value="overwrite">覆盖本地</Select.Option>
            <Select.Option value="merge">合并并重映射</Select.Option>
          </Select>
        </div>

        <Upload beforeUpload={handleImport} showUploadList={false}>
          <Button type="primary">选择 JSON 文件导入</Button>
        </Upload>
      </Modal>
    </>
  );
}
