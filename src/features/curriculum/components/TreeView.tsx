/// Component TreeView hiển thị Sàn kiến thức
import { useState, useEffect } from 'react';
import { useCurriculumStore } from '../stores/useCurriculumStore';
import { Topic, Grade } from '../types';
import { Button } from '@/components/common/Button';
import './TreeView.css';

// Định nghĩa true Inline SVGs để tránh lỗi ô vuông (tofu) do font giả lập
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const FolderIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
  </svg>
);

const FileIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    <path d="M10 9H8"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
  </svg>
);

const BookIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

interface TreeViewProps {
  onSelectTopic?: (topicId: number | null) => void;
  onSelectGrade?: (gradeId: number | null) => void;
  activeTopicId?: number | null;
  activeGradeId?: number | null;
  onSelectSubject?: (subjectId: number | null) => void;
  activeSubjectId?: number | null;
}

/// Nút hiển thị một Chủ đề (Topic)
const TopicNode = ({ 
  topic, 
  level,
  onSelectTopic,
  activeTopicId
}: { 
  topic: Topic; 
  level: number;
  onSelectTopic?: (topicId: number | null) => void;
  activeTopicId?: number | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = topic.children && topic.children.length > 0;
  const isActive = activeTopicId === topic.id;

  return (
    <div className="w-full">
      <div 
        className={`tree-node-item ${isActive ? 'active-node' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          if (onSelectTopic) onSelectTopic(topic.id);
        }}
      >
        {hasChildren ? (
          isOpen ? <ChevronDownIcon className="w-4 h-4 text-[hsl(var(--color-text-muted))]" /> : <ChevronRightIcon className="w-4 h-4 text-[hsl(var(--color-text-muted))]" />
        ) : (
          <span style={{ width: '16px', display: 'inline-block' }}></span>
        )}
        {hasChildren ? (
          <FolderIcon className="w-4 h-4 text-[hsl(var(--color-primary))]" />
        ) : (
          <FileIcon className="w-4 h-4 text-[hsl(var(--color-text-muted))]" />
        )}
        <span className="truncate">{topic.name}</span>
      </div>
      
      {isOpen && hasChildren && (
        <div className="tree-node-children">
          {topic.children!.map(child => (
            <TopicNode 
              key={child.id} 
              topic={child} 
              level={level + 1} 
              onSelectTopic={onSelectTopic}
              activeTopicId={activeTopicId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/// Nút hiển thị một Khối lớp (Grade)
const GradeNode = ({ 
  grade,
  onSelectTopic,
  activeTopicId,
  onSelectGrade,
  activeGradeId
}: { 
  grade: Grade;
  onSelectTopic?: (topicId: number | null) => void;
  activeTopicId?: number | null;
  onSelectGrade?: (gradeId: number | null) => void;
  activeGradeId?: number | null;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const isActive = activeGradeId === grade.id;

  return (
    <div className="mb-3">
      <div 
        className={`tree-node-item font-semibold ${isActive ? 'active-node' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (onSelectGrade) onSelectGrade(grade.id);
        }}
      >
        {isOpen ? <ChevronDownIcon className="w-4 h-4 text-[hsl(var(--color-text-muted))]" /> : <ChevronRightIcon className="w-4 h-4 text-[hsl(var(--color-text-muted))]" />}
        <BookIcon className="w-4 h-4 text-[hsl(var(--color-accent))]" />
        <span>{grade.name}</span>
      </div>
      
      {isOpen && (
        <div className="tree-node-children">
          {grade.topics.map(topic => (
            <TopicNode 
              key={topic.id} 
              topic={topic} 
              level={0} 
              onSelectTopic={onSelectTopic}
              activeTopicId={activeTopicId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/// Component hiển thị danh sách cây chương trình
export const TreeView = ({
  onSelectTopic,
  onSelectGrade,
  activeTopicId,
  activeGradeId,
  onSelectSubject,
  activeSubjectId
}: TreeViewProps) => {
  const { subjects, isLoading, loadMockData, fetchFromApi } = useCurriculumStore();
  const [localActiveSubject, setLocalActiveSubject] = useState<number | null>(null);

  // Tự động load mock data khi mount (do chưa có Rust Backend)
  useEffect(() => {
    loadMockData();
  }, [loadMockData]);

  // Tự động chọn môn học đầu tiên khi có dữ liệu
  useEffect(() => {
    if (subjects.length > 0 && !localActiveSubject) {
      setLocalActiveSubject(subjects[0].id);
      if (onSelectSubject) onSelectSubject(subjects[0].id);
    }
  }, [subjects, localActiveSubject, onSelectSubject]);

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-[hsl(var(--color-text-muted))]">
        <div className="w-6 h-6 border-2 border-[hsl(var(--color-primary))] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Đang tải cấu trúc...</p>
      </div>
    );
  }

  const activeSubject = activeSubjectId !== undefined ? activeSubjectId : localActiveSubject;
  const currentSubject = subjects.find(s => s.id === activeSubject);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = Number(e.target.value);
    setLocalActiveSubject(subId);
    if (onSelectSubject) onSelectSubject(subId);
  };

  return (
    <div className="tree-view-container">
      {/* Header: Chọn môn học */}
      <div className="tree-view-header">
        <div className="tree-view-header-top">
          <h3>Lọc Môn Học</h3>
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => {
              const url = window.prompt("Nhập URL API Sàn kiến thức:", "https://raw.githubusercontent.com/.../default_curriculum.json");
              if (url) fetchFromApi(url);
            }}
          >
            Đồng bộ API
          </Button>
        </div>
        <select 
          className="tree-view-select"
          value={activeSubject || ''}
          onChange={handleSubjectChange}
        >
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Danh sách Khối & Chủ đề */}
      <div className="tree-view-content custom-scrollbar">
        {currentSubject ? (
          currentSubject.grades.map(grade => (
            <GradeNode 
              key={grade.id} 
              grade={grade} 
              onSelectTopic={onSelectTopic}
              activeTopicId={activeTopicId}
              onSelectGrade={onSelectGrade}
              activeGradeId={activeGradeId}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[hsl(var(--color-text-muted))]">
            <BookIcon className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">Không có dữ liệu môn học</p>
          </div>
        )}
      </div>
    </div>
  );
};
