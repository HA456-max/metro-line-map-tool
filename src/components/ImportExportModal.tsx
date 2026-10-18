import React, { useState } from 'react';
import { Modal, Upload, Button, Select, message } from 'antd';
import { useStore } from '../store/useStore';

export default function ImportExportModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const exportProjectJSON = useStore((s) => s.exportProjectJSON);
  const importProjectJSON = useStore((s) => s.importProjectJSON);
  const current = useStore((s) => s.currentProjectId);
  const [strategy, setStrategy] = useState<'rename' | 'overwrite' | 'merge'>('rename');

  const handleExport = () => {
    if (!current) return message.error('没有当前工程');
    const str = exportProjectJSON(current);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${current}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File) => {
    const txt = await file.text();
    const res = importProjectJSON(txt, strategy);
    if (res.ok) { message.success(res.message); onClose(); }
    else message.error(res.message);
  };

  return (
    <Modal title="导入/导出工程" open={visible} onCancel={onClose} footer={null}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button onClick={handleExport}>导出当前工程</Button>
        <Upload beforeUpload={(file) => { handleFile(file); return false; }} showUploadList={false}><Button>导入工程 (JSON)</Button></Upload>
      </div>
      <div style={{ marginTop: 12 }}>
        <div>冲突策略：</div>
        <Select value={strategy} onChange={(v) => setStrategy(v as any)} style={{ width: 240 }}>
          <Select.Option value="rename">自动重命名导入工程</Select.Option>
          <Select.Option value="overwrite">覆盖同 ID 的工程</Select.Option>
          <Select.Option value="merge">合并（重映射 IDs）</Select.Option>
        </Select>
      </div>
    </Modal>
  );
}
