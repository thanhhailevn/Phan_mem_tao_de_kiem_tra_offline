import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { ExcelImportDialog } from './ExcelImportDialog';
import { QuestionEditorDialog } from './QuestionEditorDialog';
import { PlusCircle, UploadCloud, Search, Trash2, Book, FileText, BarChart2 } from 'lucide-react';
import './QuestionBankBoard.css';

interface QuestionItem {
  id: string;
  content: string;
  options: string[] | null;
  correct_answer: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic_id: number;
  explanation: string | null;
  q_type: 'MCQ' | 'ESSAY' | 'MATCHING' | 'READING';
  subject: string;
  grade: string;
  passage_content?: string;
  matching_left?: string;
  matching_right?: string;
  matching_mapping?: string;
}

export const QuestionBankBoard: React.FC = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // State quản lý danh sách câu hỏi (Tải/Lưu localStorage)
  const [questions, setQuestions] = useState<QuestionItem[]>(() => {
    const saved = localStorage.getItem('quiz_questions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Chuẩn hóa các trường
        return parsed.map((q: any) => ({
          ...q,
          subject: q.subject || 'Toán',
          grade: q.grade || 'Lớp 3',
          difficulty: q.difficulty || 'EASY'
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // State bộ lọc và điều hướng
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedGr, setSelectedGr] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const saveQuestions = (newQuestions: QuestionItem[]) => {
    setQuestions(newQuestions);
    localStorage.setItem('quiz_questions', JSON.stringify(newQuestions));
  };

  const handleImport = (validRows: any[]) => {
    const newQuestions: QuestionItem[] = validRows.map((r, index) => ({
      id: `imported-${Date.now()}-${index}`,
      content: r.content,
      options: r.options,
      correct_answer: r.correct_answer,
      difficulty: r.difficulty,
      topic_id: r.topic_id,
      explanation: r.explanation,
      q_type: r.q_type,
      subject: r.subject || 'Toán',
      grade: r.grade || 'Lớp 3',
      passage_content: r.passage_content,
      matching_left: r.matching_left,
      matching_right: r.matching_right,
      matching_mapping: r.matching_mapping
    }));

    const updated = [...questions, ...newQuestions];
    saveQuestions(updated);
    setIsImportOpen(false);
    alert(`Đã nhập thành công ${newQuestions.length} câu hỏi mới!`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng câu hỏi?")) {
      const updated = questions.filter(q => q.id !== id);
      saveQuestions(updated);
    }
  };

  // Cấu trúc cây tự dựng dựa trên dữ liệu câu hỏi thực tế trong localStorage
  const buildClassificationTree = () => {
    const treeMap: Record<string, Record<string, number>> = {};
    
    questions.forEach(q => {
      const sub = q.subject;
      const gr = q.grade;
      if (!treeMap[sub]) {
        treeMap[sub] = {};
      }
      if (!treeMap[sub][gr]) {
        treeMap[sub][gr] = 0;
      }
      treeMap[sub][gr]++;
    });

    const subjectsOrdered = ['Toán', 'Tiếng Việt', 'Hỗn hợp', ...Object.keys(treeMap).filter(k => k !== 'Toán' && k !== 'Tiếng Việt' && k !== 'Hỗn hợp')];

    return subjectsOrdered
      .filter(sub => treeMap[sub])
      .map(sub => {
        const gradesMap = treeMap[sub];
        const gradesList = Object.keys(gradesMap)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
          .map(gr => ({
            name: gr,
            count: gradesMap[gr]
          }));

        const totalCount = gradesList.reduce((acc, curr) => acc + curr.count, 0);

        return {
          name: sub,
          count: totalCount,
          grades: gradesList
        };
      });
  };

  const treeData = buildClassificationTree();

  // Logic đệ quy lọc danh sách câu hỏi
  const filteredQuestions = questions.filter(q => {
    // Lọc theo từ khóa tìm kiếm
    const matchesSearch = q.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (q.passage_content && q.passage_content.toLowerCase().includes(searchQuery.toLowerCase()));

    // Lọc theo Tab loại câu hỏi
    const matchesType = filterType === 'ALL' || q.q_type === filterType;

    // Lọc theo độ khó (chọn nhiều)
    const matchesDiff = selectedDifficulties.length === 0 || selectedDifficulties.includes(q.difficulty);

    // Lọc theo cây phân loại Môn học & Lớp
    const matchesSub = !selectedSub || q.subject === selectedSub;
    const matchesGr = !selectedGr || q.grade === selectedGr;

    return matchesSearch && matchesType && matchesDiff && matchesSub && matchesGr;
  });

  // Đếm động số câu hỏi cho từng Tab Loại câu hỏi dựa trên bộ lọc Môn/Lớp hiện tại
  const getTabCount = (type: string) => {
    return questions.filter(q => {
      const matchesSub = !selectedSub || q.subject === selectedSub;
      const matchesGr = !selectedGr || q.grade === selectedGr;
      const matchesType = type === 'ALL' || q.q_type === type;
      return matchesSub && matchesGr && matchesType;
    }).length;
  };

  // Đếm động số câu cho dải Pill Độ khó
  const getDiffCount = (diff: string) => {
    return questions.filter(q => {
      const matchesSub = !selectedSub || q.subject === selectedSub;
      const matchesGr = !selectedGr || q.grade === selectedGr;
      const matchesType = filterType === 'ALL' || q.q_type === filterType;
      const matchesDiff = q.difficulty === diff;
      return matchesSub && matchesGr && matchesType && matchesDiff;
    }).length;
  };

  const toggleDifficulty = (diff: string) => {
    if (selectedDifficulties.includes(diff)) {
      setSelectedDifficulties(selectedDifficulties.filter(d => d !== diff));
    } else {
      setSelectedDifficulties([...selectedDifficulties, diff]);
    }
  };

  const getQTypeName = (type: string) => {
    switch (type) {
      case 'MCQ': return 'Trắc nghiệm';
      case 'ESSAY': return 'Tự luận';
      case 'READING': return 'Đọc hiểu';
      case 'MATCHING': return 'Nối từ';
      default: return 'Khác';
    }
  };

  const getDiffName = (diff: string) => {
    switch (diff) {
      case 'EASY': return 'Dễ';
      case 'MEDIUM': return 'Trung bình';
      case 'HARD': return 'Khó';
      default: return 'Dễ';
    }
  };

  // Thống kê tổng quan trong toàn bộ kho lưu trữ
  const totalAll = questions.length;
  const totalMcq = questions.filter(q => q.q_type === 'MCQ').length;
  const totalEssay = questions.filter(q => q.q_type === 'ESSAY').length;
  const totalReading = questions.filter(q => q.q_type === 'READING').length;
  const totalMatching = questions.filter(q => q.q_type === 'MATCHING').length;

  // Render tiêu đề cột dynamic dựa theo Tab loại câu hỏi sếp đang chọn
  const renderMasterTableHeader = () => {
    switch (filterType) {
      case 'MCQ':
        return (
          <tr>
            <th style={{ width: '60px' }}>STT</th>
            <th>Môn Học</th>
            <th>Lớp</th>
            <th>Độ Khó</th>
            <th style={{ minWidth: '280px' }}>Nội dung câu hỏi</th>
            <th>Đáp án A</th>
            <th>Đáp án B</th>
            <th>Đáp án C</th>
            <th>Đáp án D</th>
            <th>Đáp án đúng</th>
            <th style={{ minWidth: '200px' }}>Giải thích</th>
            <th style={{ width: '80px', textAlign: 'center' }}>Xóa</th>
          </tr>
        );
      case 'ESSAY':
        return (
          <tr>
            <th style={{ width: '60px' }}>STT</th>
            <th>Môn Học</th>
            <th>Lớp</th>
            <th>Độ Khó</th>
            <th style={{ minWidth: '380px' }}>Nội dung câu hỏi</th>
            <th style={{ minWidth: '280px' }}>Gợi ý lời giải</th>
            <th style={{ width: '80px', textAlign: 'center' }}>Xóa</th>
          </tr>
        );
      case 'READING':
        return (
          <tr>
            <th style={{ width: '60px' }}>STT</th>
            <th>Môn Học</th>
            <th>Lớp</th>
            <th>Độ Khó</th>
            <th style={{ minWidth: '300px' }}>Đoạn văn đọc hiểu</th>
            <th style={{ minWidth: '250px' }}>Câu hỏi phụ</th>
            <th>Đáp án A</th>
            <th>Đáp án B</th>
            <th>Đáp án C</th>
            <th>Đáp án D</th>
            <th>Đáp án đúng</th>
            <th style={{ minWidth: '200px' }}>Giải thích</th>
            <th style={{ width: '80px', textAlign: 'center' }}>Xóa</th>
          </tr>
        );
      case 'MATCHING':
        return (
          <tr>
            <th style={{ width: '60px' }}>STT</th>
            <th>Môn Học</th>
            <th>Lớp</th>
            <th>Độ Khó</th>
            <th style={{ minWidth: '280px' }}>Yêu cầu câu hỏi</th>
            <th>Vế trái (Column A)</th>
            <th>Vế phải (Column B)</th>
            <th>Kết nối đúng</th>
            <th style={{ width: '80px', textAlign: 'center' }}>Xóa</th>
          </tr>
        );
      default: // ALL
        return (
          <tr>
            <th style={{ width: '60px' }}>STT</th>
            <th>Môn Học</th>
            <th>Lớp</th>
            <th>Thể Loại</th>
            <th>Độ Khó</th>
            <th style={{ minWidth: '350px' }}>Nội dung / Câu hỏi</th>
            <th style={{ minWidth: '280px' }}>Đáp án đúng / Gợi ý</th>
            <th style={{ width: '80px', textAlign: 'center' }}>Xóa</th>
          </tr>
        );
    }
  };

  // Render từng hàng dữ liệu của Bảng Master
  const renderMasterTableRow = (q: QuestionItem, idx: number) => {
    const diffLabel = getDiffName(q.difficulty);
    const typeLabel = getQTypeName(q.q_type);
    const stt = idx + 1;

    const actionCell = (
      <td style={{ textAlign: 'center' }}>
        <button 
          className="card-trash-btn" 
          title="Xóa câu hỏi này"
          onClick={() => handleDelete(q.id)}
          style={{ margin: '0 auto' }}
        >
          <Trash2 size={16} />
        </button>
      </td>
    );

    const subBadge = <span className="qb-table-badge sub">{q.subject}</span>;
    const gradeBadge = <span className="qb-table-badge grade">{q.grade}</span>;
    const diffBadge = <span className={`qb-table-badge diff-${q.difficulty.toLowerCase()}`}>{diffLabel}</span>;
    const typeBadge = <span className={`qb-table-badge type-${q.q_type.toLowerCase()}`}>{typeLabel}</span>;

    switch (filterType) {
      case 'MCQ':
        return (
          <tr key={q.id} className="qb-table-row">
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{stt}</td>
            <td>{subBadge}</td>
            <td>{gradeBadge}</td>
            <td>{diffBadge}</td>
            <td><div className="qb-table-html" dangerouslySetInnerHTML={{ __html: q.content }} /></td>
            <td className={q.correct_answer === 'A' ? 'correct-cell' : ''}>{q.options?.[0] || '-'}</td>
            <td className={q.correct_answer === 'B' ? 'correct-cell' : ''}>{q.options?.[1] || '-'}</td>
            <td className={q.correct_answer === 'C' ? 'correct-cell' : ''}>{q.options?.[2] || '-'}</td>
            <td className={q.correct_answer === 'D' ? 'correct-cell' : ''}>{q.options?.[3] || '-'}</td>
            <td className="correct-cell" style={{ fontWeight: 'bold', textAlign: 'center' }}>{q.correct_answer}</td>
            <td>{q.explanation || '-'}</td>
            {actionCell}
          </tr>
        );
      case 'ESSAY':
        return (
          <tr key={q.id} className="qb-table-row">
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{stt}</td>
            <td>{subBadge}</td>
            <td>{gradeBadge}</td>
            <td>{diffBadge}</td>
            <td><div className="qb-table-html" dangerouslySetInnerHTML={{ __html: q.content }} /></td>
            <td>{q.explanation || '-'}</td>
            {actionCell}
          </tr>
        );
      case 'READING':
        return (
          <tr key={q.id} className="qb-table-row">
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{stt}</td>
            <td>{subBadge}</td>
            <td>{gradeBadge}</td>
            <td>{diffBadge}</td>
            <td style={{ fontStyle: 'italic', color: 'hsl(var(--color-text-muted))' }}>{q.passage_content || '-'}</td>
            <td><div className="qb-table-html" dangerouslySetInnerHTML={{ __html: q.content }} /></td>
            <td className={q.correct_answer === 'A' ? 'correct-cell' : ''}>{q.options?.[0] || '-'}</td>
            <td className={q.correct_answer === 'B' ? 'correct-cell' : ''}>{q.options?.[1] || '-'}</td>
            <td className={q.correct_answer === 'C' ? 'correct-cell' : ''}>{q.options?.[2] || '-'}</td>
            <td className={q.correct_answer === 'D' ? 'correct-cell' : ''}>{q.options?.[3] || '-'}</td>
            <td className="correct-cell" style={{ fontWeight: 'bold', textAlign: 'center' }}>{q.correct_answer}</td>
            <td>{q.explanation || '-'}</td>
            {actionCell}
          </tr>
        );
      case 'MATCHING':
        return (
          <tr key={q.id} className="qb-table-row">
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{stt}</td>
            <td>{subBadge}</td>
            <td>{gradeBadge}</td>
            <td>{diffBadge}</td>
            <td><div className="qb-table-html" dangerouslySetInnerHTML={{ __html: q.content }} /></td>
            <td>{q.matching_left || '-'}</td>
            <td>{q.matching_right || '-'}</td>
            <td className="correct-cell" style={{ fontWeight: 'bold', fontFamily: 'monospace', textAlign: 'center' }}>{q.correct_answer}</td>
            {actionCell}
          </tr>
        );
      default: { // ALL
        let answerText = "";
        if (q.q_type === 'MCQ') {
          answerText = `Đáp án: ${q.correct_answer}`;
        } else if (q.q_type === 'ESSAY') {
          answerText = q.explanation || '-';
        } else if (q.q_type === 'READING') {
          answerText = `Đáp án: ${q.correct_answer}`;
        } else if (q.q_type === 'MATCHING') {
          answerText = `Kết nối: ${q.correct_answer}`;
        }
        return (
          <tr key={q.id} className="qb-table-row">
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{stt}</td>
            <td>{subBadge}</td>
            <td>{gradeBadge}</td>
            <td>{typeBadge}</td>
            <td>{diffBadge}</td>
            <td>
              {q.q_type === 'READING' && q.passage_content && (
                <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))', marginBottom: '4px' }}>
                  Đoạn văn: {q.passage_content.substring(0, 80)}...
                </div>
              )}
              <div className="qb-table-html" dangerouslySetInnerHTML={{ __html: q.content }} />
            </td>
            <td>{answerText}</td>
            {actionCell}
          </tr>
        );
      }
    }
  };

  return (
    <div className="qb-dashboard-container animate-enter">
      {/* Cột trái: Cây phân loại Ngân hàng câu hỏi (Subject > Grade) - Luôn hiển thị Lớp */}
      <div className="qb-left-panel">
        <div className="qb-tree-header">
          <BarChart2 size={16} />
          <span>PHÂN LOẠI NGÂN HÀNG</span>
        </div>
        <div className="qb-tree-scroll custom-scrollbar">
          {treeData.length === 0 ? (
            <div className="qb-tree-empty">Chưa có dữ liệu phân loại.</div>
          ) : (
            treeData.map(subNode => {
              const isSubSelected = selectedSub === subNode.name;
              return (
                <div key={subNode.name} className="qb-tree-subject-group">
                  <div 
                    className={`qb-tree-node ${isSubSelected && !selectedGr ? 'active' : ''}`}
                    onClick={() => {
                      if (selectedSub === subNode.name && !selectedGr) {
                        setSelectedSub(null); // Bỏ chọn môn
                      } else {
                        setSelectedSub(subNode.name);
                        setSelectedGr(null);
                      }
                    }}
                  >
                    <Book size={16} className="node-icon-sub" />
                    <span className="node-label">{subNode.name}</span>
                    <span className="node-badge">{subNode.count}</span>
                  </div>

                  {/* Luôn hiển thị Lớp con trực tiếp */}
                  <div className="qb-tree-grades-list">
                    {subNode.grades.map(grNode => {
                      const isGrSelected = selectedSub === subNode.name && selectedGr === grNode.name;
                      return (
                        <div 
                          key={grNode.name}
                          className={`qb-tree-subnode ${isGrSelected ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isGrSelected) {
                              setSelectedGr(null);
                            } else {
                              setSelectedSub(subNode.name);
                              setSelectedGr(grNode.name);
                            }
                          }}
                        >
                          <FileText size={14} className="node-icon-grade" />
                          <span className="node-label">{grNode.name}</span>
                          <span className="node-badge-sub">{grNode.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cột phải: Dữ liệu chính */}
      <div className="qb-right-panel">
        <header className="board-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, color: 'hsl(var(--color-text-light))', fontSize: '1.8rem' }}>Ngân Hàng Câu Hỏi</h2>
            <p style={{ margin: '0.5rem 0 0 0', color: 'hsl(var(--color-text-muted))' }}>Lập và quản lý ngân hàng câu hỏi đa hệ.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="secondary" leftIcon={<UploadCloud size={18} />} onClick={() => setIsImportOpen(true)}>
              Import Excel
            </Button>
            <Button variant="primary" leftIcon={<PlusCircle size={18} />} onClick={() => setIsEditorOpen(true)}>
              Tạo Câu Hỏi
            </Button>
          </div>
        </header>

        {/* Thanh thống kê tổng quan của toàn kho */}
        <div className="qb-summary-bar">
          <div className="summary-item">Tổng kho: <strong>{totalAll}</strong></div>
          <div className="summary-divider">|</div>
          <div className="summary-item">Trắc nghiệm: <strong>{totalMcq}</strong></div>
          <div className="summary-divider">|</div>
          <div className="summary-item">Tự luận: <strong>{totalEssay}</strong></div>
          <div className="summary-divider">|</div>
          <div className="summary-item">Đọc hiểu: <strong>{totalReading}</strong></div>
          <div className="summary-divider">|</div>
          <div className="summary-item">Nối từ: <strong>{totalMatching}</strong></div>
        </div>

        {/* Hệ thống Tab phân loại loại câu hỏi */}
        <div className="qb-tabs-container">
          <button className={`qb-tab-button ${filterType === 'ALL' ? 'active' : ''}`} onClick={() => setFilterType('ALL')}>
            Tất cả <span className="tab-badge">{getTabCount('ALL')}</span>
          </button>
          <button className={`qb-tab-button ${filterType === 'MCQ' ? 'active' : ''}`} onClick={() => setFilterType('MCQ')}>
            Trắc nghiệm <span className="tab-badge">{getTabCount('MCQ')}</span>
          </button>
          <button className={`qb-tab-button ${filterType === 'ESSAY' ? 'active' : ''}`} onClick={() => setFilterType('ESSAY')}>
            Tự luận <span className="tab-badge">{getTabCount('ESSAY')}</span>
          </button>
          <button className={`qb-tab-button ${filterType === 'READING' ? 'active' : ''}`} onClick={() => setFilterType('READING')}>
            Đọc hiểu <span className="tab-badge">{getTabCount('READING')}</span>
          </button>
          <button className={`qb-tab-button ${filterType === 'MATCHING' ? 'active' : ''}`} onClick={() => setFilterType('MATCHING')}>
            Nối từ <span className="tab-badge">{getTabCount('MATCHING')}</span>
          </button>
        </div>

        {/* Khung tìm kiếm và bộ lọc độ khó */}
        <div className="qb-filters-grid">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nội dung câu hỏi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="qb-pills-row">
            <button 
              className={`qb-pill-button pill-easy ${selectedDifficulties.includes('EASY') ? 'active' : ''}`}
              onClick={() => toggleDifficulty('EASY')}
            >
              🟢 Dễ <span className="pill-badge">{getDiffCount('EASY')}</span>
            </button>
            <button 
              className={`qb-pill-button pill-medium ${selectedDifficulties.includes('MEDIUM') ? 'active' : ''}`}
              onClick={() => toggleDifficulty('MEDIUM')}
            >
              🟡 TB <span className="pill-badge">{getDiffCount('MEDIUM')}</span>
            </button>
            <button 
              className={`qb-pill-button pill-hard ${selectedDifficulties.includes('HARD') ? 'active' : ''}`}
              onClick={() => toggleDifficulty('HARD')}
            >
              🔴 Khó <span className="pill-badge">{getDiffCount('HARD')}</span>
            </button>
          </div>
        </div>

        {/* Mô tả bộ lọc đang hoạt động */}
        {(selectedSub || selectedGr || selectedDifficulties.length > 0) && (
          <div className="qb-active-filters-info">
            <span>
              Đang lọc theo:{' '}
              <strong>
                {[
                  selectedSub && `Môn ${selectedSub}`,
                  selectedGr && selectedGr,
                  selectedDifficulties.length > 0 && `Độ khó: ${selectedDifficulties.map(getDiffName).join(', ')}`
                ].filter(Boolean).join(' > ')}
              </strong>
            </span>
            <button 
              onClick={() => {
                setSelectedSub(null);
                setSelectedGr(null);
                setSelectedDifficulties([]);
              }}
              className="qb-clear-filters-btn"
            >
              Xóa lọc
            </button>
          </div>
        )}

        {/* Bảng tính Master lớn chứa toàn bộ danh sách câu hỏi */}
        {filteredQuestions.length === 0 ? (
          <div className="ui-card" style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--color-text-muted))' }}>
            {questions.length === 0 ? (
              <>
                <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Kho câu hỏi trống.</p>
                <p>Vui lòng click Import Excel hoặc Tạo Câu Hỏi để bắt đầu nạp câu hỏi.</p>
              </>
            ) : (
              <p style={{ fontSize: '1.2rem' }}>Không có câu hỏi nào khớp với các bộ lọc.</p>
            )}
          </div>
        ) : (
          <div className="qb-master-table-wrapper custom-scrollbar">
            <table className="qb-master-table">
              <thead>
                {renderMasterTableHeader()}
              </thead>
              <tbody>
                {filteredQuestions.map((q, idx) => renderMasterTableRow(q, idx))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QuestionEditorDialog
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={(data) => {
          const letterCorrect = ['A', 'B', 'C', 'D'][data.correct_answer];
          const newQ: QuestionItem = {
            id: `manual-${Date.now()}`,
            content: data.content,
            options: data.options,
            correct_answer: letterCorrect,
            difficulty: data.difficulty,
            topic_id: data.topic_id,
            explanation: null,
            q_type: 'MCQ',
            subject: data.subject,
            grade: data.grade
          };
          saveQuestions([...questions, newQ]);
          setIsEditorOpen(false);
          alert('Tạo câu hỏi trắc nghiệm thành công!');
        }}
      />

      <ExcelImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
};
