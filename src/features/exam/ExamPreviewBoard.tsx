import React from 'react';
import { useExamStore } from '../../core/stores/useExamStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RefreshCw, FileText, Printer } from 'lucide-react';
import { saveAs } from 'file-saver';
import './ExamPreviewBoard.css';

export const ExamPreviewBoard: React.FC = () => {
  const { currentDraft, swapQuestionInDraft, isGenerating } = useExamStore();

  if (isGenerating) {
    return (
      <div className="preview-board-empty glass-panel animate-enter">
        <div className="spinner-large" />
        <p>Hệ thống đang nặn đề thi...</p>
      </div>
    );
  }

  if (currentDraft.length === 0) {
    return (
      <div className="preview-board-empty glass-panel animate-enter">
        <p>Bảng nháp trống. Hãy cấu hình và sinh đề để xem trước tại đây.</p>
      </div>
    );
  }

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportWord = () => {
    const element = document.getElementById('printable-exam');
    if (!element) return;
    
    // Clone HTML
    const clonedHtml = element.innerHTML;
    const htmlString = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>DeThi</title></head>
      <body>${clonedHtml}</body>
      </html>
    `;
    
    try {
      const blob = new Blob(['\ufeff', htmlString], { type: 'application/msword' });
      saveAs(blob, 'DeThi_AntiGravity.doc');
    } catch (err) {
      console.error('Lỗi xuất Word:', err);
      alert('Không thể xuất file Word.');
    }
  };

  return (
    <div className="preview-board animate-enter">
      <div className="board-header">
        <h3>Bản Nháp Đề Thi ({currentDraft.length} Câu)</h3>
        <div className="export-actions hide-on-print">
          <Button variant="secondary" size="sm" leftIcon={<Printer size={16} />} onClick={handleExportPDF}>
            In PDF
          </Button>
          <Button variant="primary" size="sm" leftIcon={<FileText size={16} />} onClick={handleExportWord}>
            Xuất Word
          </Button>
        </div>
      </div>
      
      <div className="question-list" id="printable-exam">
        {currentDraft.map((q, index) => (
          <Card key={q.id} className="question-card" glass>
            <div className="question-header">
              <span className="question-number">Câu {index + 1}</span>
              <div className="question-badges hide-on-print">
                <span className={`badge diff-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                <span className="badge type">{q.q_type}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                leftIcon={<RefreshCw size={16} />}
                onClick={() => swapQuestionInDraft('temp_exam_id', q.id)}
                className="swap-btn hide-on-print"
              >
                Đổi
              </Button>
            </div>
            
            <div className="question-content" dangerouslySetInnerHTML={{ __html: q.content }} />
            
            {q.options && (
              <div className="question-options">
                {/* Tạm thời parse JSON giả định là array string */}
                {(() => {
                  try {
                    const opts = JSON.parse(q.options) as string[];
                    return opts.map((opt, i) => (
                      <div key={i} className="option-item">
                        <span className="option-letter">{String.fromCharCode(65 + i)}.</span>
                        <span dangerouslySetInnerHTML={{ __html: opt }} />
                      </div>
                    ));
                  } catch {
                    return <div>{q.options}</div>;
                  }
                })()}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
