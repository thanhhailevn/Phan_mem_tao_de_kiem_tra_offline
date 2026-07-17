import { useState } from 'react';
import { ExamGeneratorForm } from './features/exam/ExamGeneratorForm';
import { ExamPreviewBoard } from './features/exam/ExamPreviewBoard';
import { CurriculumBoard } from './features/curriculum/CurriculumBoard';
import { QuestionBankBoard } from './features/questions/QuestionBankBoard';
import { LayoutDashboard, Library, FileSignature } from 'lucide-react';
import './App.css';

type Tab = 'curriculum' | 'questions' | 'exam';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('exam');

  return (
    <div className="app-wrapper">
      {/* Thanh Điều hướng toàn cục */}
      <nav className="global-nav">
        <button 
          className={`nav-item ${activeTab === 'curriculum' ? 'active' : ''}`}
          onClick={() => setActiveTab('curriculum')}
          title="Sàn Kiến Thức"
        >
          <LayoutDashboard size={24} />
        </button>
        <button 
          className={`nav-item ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
          title="Ngân Hàng Câu Hỏi"
        >
          <Library size={24} />
        </button>
        <button 
          className={`nav-item ${activeTab === 'exam' ? 'active' : ''}`}
          onClick={() => setActiveTab('exam')}
          title="Tạo Đề Thi"
        >
          <FileSignature size={24} />
        </button>
      </nav>

      <div className="app-container">
        <header className="app-header glass-panel">
          <h1>Phần Mềm Trộn Đề Siêu Cấp</h1>
          <p>Phiên bản AntiGravity - Portable Edition</p>
        </header>

        <main className="app-main">
          {activeTab === 'curriculum' && <CurriculumBoard />}
          {activeTab === 'questions' && <QuestionBankBoard />}
          {activeTab === 'exam' && (
            <div className="layout-grid">
              {/* Cột trái: Form cấu hình */}
              <aside className="sidebar">
                <ExamGeneratorForm />
              </aside>
              
              {/* Cột phải: Bảng xem trước */}
              <section className="content-area">
                <ExamPreviewBoard />
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
