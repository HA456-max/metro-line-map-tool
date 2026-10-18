import React from 'react';
import { Modal, Button } from 'antd';

export default function ConflictModal({ visible, conflictInfo, onApply, onCancel }: { visible: boolean; conflictInfo?: any; onApply: (choice: string) => void; onCancel: () => void }) {
  return (
    <Modal title="导入冲突" open={visible} onCancel={onCancel} footer={null}>
      <div>检测到导入与本地存在冲突。请选择处理策略：</div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <Button onClick={() => onApply('rename')}>自动重命名导入</Button>
        <Button onClick={() => onApply('overwrite')}>覆盖本地</Button>
        <Button onClick={() => onApply('merge')}>合并并重映射</Button>
      </div>
    </Modal>
  );
}
