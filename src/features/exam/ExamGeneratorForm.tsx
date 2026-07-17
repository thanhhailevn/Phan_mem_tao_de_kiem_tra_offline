import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useExamStore } from '../../core/stores/useExamStore';
import { ExamMatrixConfig } from '../../core/api/types';
import './ExamGeneratorForm.css';

export const ExamGeneratorForm: React.FC = () => {
  const { generateAutoExam, isGenerating, error } = useExamStore();
  
  const [config, setConfig] = useState<ExamMatrixConfig>({
    subject: 'Toán',
    grade_id: 3,
    week_start: 1,
    week_end: 18,
    mcq_count: 10,
    essay_count: 2,
    advanced_ratio: 0.2, // 20%
    require_geometry: true,
    require_reading: false,
    shuffle_options: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setConfig(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'range' || type === 'number') {
      setConfig(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setConfig(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateAutoExam(config);
  };

  return (
    <Card glass className="exam-generator-form animate-enter">
      <h2 className="form-title">Tạo Đề Thi Tự Động</h2>
      {error && <div className="form-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Môn Học</label>
            <select name="subject" value={config.subject} onChange={handleChange}>
              <option value="Toán">Toán</option>
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="Hỗn hợp">Hỗn hợp</option>
            </select>
          </div>
          <div className="form-group">
            <label>Khối Lớp</label>
            <select name="grade_id" value={config.grade_id} onChange={handleChange}>
              <option value={1}>Lớp 1</option>
              <option value={2}>Lớp 2</option>
              <option value={3}>Lớp 3</option>
              <option value={4}>Lớp 4</option>
              <option value={5}>Lớp 5</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Từ Tuần</label>
            <input type="number" name="week_start" min={1} max={35} value={config.week_start} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Đến Tuần</label>
            <input type="number" name="week_end" min={1} max={35} value={config.week_end} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Số câu Trắc nghiệm</label>
            <input type="number" name="mcq_count" min={0} max={50} value={config.mcq_count} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Số câu Tự luận</label>
            <input type="number" name="essay_count" min={0} max={20} value={config.essay_count} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group slider-group">
          <label>
            Tỉ lệ Nâng Cao: <span>{(config.advanced_ratio * 100).toFixed(0)}%</span>
          </label>
          <input 
            type="range" 
            name="advanced_ratio" 
            min="0" max="1" step="0.1" 
            value={config.advanced_ratio} 
            onChange={handleChange} 
            className="styled-slider"
          />
        </div>

        <div className="form-group checkboxes">
          <label className="checkbox-label">
            <input type="checkbox" name="require_geometry" checked={config.require_geometry} onChange={handleChange} />
            Bắt buộc có Hình học
          </label>
          <label className="checkbox-label">
            <input type="checkbox" name="shuffle_options" checked={config.shuffle_options} onChange={handleChange} />
            Trộn đáp án (A,B,C,D)
          </label>
        </div>

        <Button type="submit" variant="primary" size="lg" isLoading={isGenerating} className="submit-btn">
          🚀 Sinh Đề Ngay
        </Button>
      </form>
    </Card>
  );
};
