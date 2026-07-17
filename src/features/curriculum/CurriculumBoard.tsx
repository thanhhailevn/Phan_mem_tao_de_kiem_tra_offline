import React from 'react';
import { TreeView } from './components/TreeView';

export const CurriculumBoard: React.FC = () => {
  return (
    <div className="curriculum-board animate-enter" style={{ padding: '2rem', width: '100%' }}>
      <header className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid var(--color-border)', background: 'hsl(var(--color-surface-dark))' }}>
        <h2 style={{ margin: 0, color: 'hsl(var(--color-text-light))', fontSize: '1.8rem' }}>Sàn Kiến Thức</h2>
        <p style={{ margin: '0.5rem 0 0 0', color: 'hsl(var(--color-text-muted))' }}>
          Cấu trúc khung chương trình, môn học, và chuyên đề.
        </p>
      </header>

      <div className="curriculum-content">
        <TreeView />
      </div>
    </div>
  );
};
