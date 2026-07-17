import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RichTextEditor } from './RichTextEditor';
import './QuestionEditorDialog.css';

// Schema Validation
const questionSchema = z.object({
  subject: z.enum(['Toán', 'Tiếng Việt', 'Hỗn hợp']),
  grade: z.enum(['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5']),
  content: z.string().min(5, "Nội dung câu hỏi quá ngắn"),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  topic_id: z.number().min(1, "Vui lòng chọn 1 chủ đề"),
  options: z.array(z.string().min(1, "Không được để trống đáp án")).length(4),
  correct_answer: z.number().min(0).max(3),
});

export type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: QuestionFormData) => void;
}

export const QuestionEditorDialog: React.FC<QuestionEditorDialogProps> = ({ isOpen, onClose, onSave }) => {
  const { control, handleSubmit, register, formState: { errors } } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      subject: 'Toán',
      grade: 'Lớp 3',
      content: '',
      difficulty: 'EASY',
      topic_id: 1,
      options: ['', '', '', ''],
      correct_answer: 0,
    }
  });

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay animate-enter">
      <Card className="dialog-content" glass>
        <h2 className="dialog-title">Thêm Câu Hỏi Trắc Nghiệm Mới</h2>
        
        <form onSubmit={handleSubmit(onSave)}>
          {/* Hàng chọn Môn Học và Lớp */}
          <div className="form-row">
            <div className="form-group">
              <label>Môn học *</label>
              <select {...register('subject')}>
                <option value="Toán">Toán</option>
                <option value="Tiếng Việt">Tiếng Việt</option>
                <option value="Hỗn hợp">Hỗn hợp</option>
              </select>
              {errors.subject && <p className="error-text">{errors.subject.message}</p>}
            </div>
            <div className="form-group">
              <label>Lớp học *</label>
              <select {...register('grade')}>
                <option value="Lớp 1">Lớp 1</option>
                <option value="Lớp 2">Lớp 2</option>
                <option value="Lớp 3">Lớp 3</option>
                <option value="Lớp 4">Lớp 4</option>
                <option value="Lớp 5">Lớp 5</option>
              </select>
              {errors.grade && <p className="error-text">{errors.grade.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label>Nội dung Câu hỏi *</label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
            />
            {errors.content && <p className="error-text">{errors.content.message}</p>}
          </div>

          <div className="options-grid">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="option-item">
                <input 
                  type="radio" 
                  value={idx} 
                  {...register('correct_answer', { valueAsNumber: true })} 
                  className="correct-radio"
                />
                <div className="option-input-wrapper">
                  <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                  <input 
                    {...register(`options.${idx}` as const)} 
                    placeholder={`Nhập đáp án ${String.fromCharCode(65 + idx)}...`}
                    className="option-input"
                  />
                </div>
                {errors.options?.[idx] && <p className="error-text">{errors.options[idx]?.message}</p>}
              </div>
            ))}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Độ khó</label>
              <select {...register('difficulty')}>
                <option value="EASY">Cơ bản</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Nâng cao</option>
              </select>
            </div>
            <div className="form-group">
              <label>Thuộc Topic ID</label>
              <input type="number" {...register('topic_id', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="dialog-actions">
            <Button type="button" variant="secondary" onClick={onClose}>Hủy Bỏ</Button>
            <Button type="submit" variant="primary">💾 Lưu Câu Hỏi</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
