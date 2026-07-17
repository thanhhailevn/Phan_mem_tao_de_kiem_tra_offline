import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import './ExcelImportDialog.css';

interface ExcelImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (validRows: any[]) => void;
}

interface ParsedRow {
  content: string;
  options: string[] | null;
  correct_answer: string | null;
  difficulty: string;
  topic_id: number;
  explanation: string | null;
  q_type: 'MCQ' | 'ESSAY' | 'MATCHING' | 'READING';
  subject: string;
  grade: string;
  
  // Extra fields for display/preview
  passage_content?: string;
  matching_left?: string;
  matching_right?: string;
  matching_mapping?: string;

  _isValid: boolean;
  _errorMsg?: string;
}

export const ExcelImportDialog: React.FC<ExcelImportDialogProps> = ({ isOpen, onClose, onImport }) => {
  const [importType, setImportType] = useState<'MCQ' | 'ESSAY' | 'READING' | 'MATCHING'>('MCQ');
  const [rows, setRows] = useState<ParsedRow[]>([]);

  // Tải file mẫu tĩnh tương ứng với loại câu hỏi được yêu cầu (Có thêm cột Môn học, Lớp và Độ khó)
  const downloadTemplate = (type: 'MCQ' | 'ESSAY' | 'READING' | 'MATCHING') => {
    let sampleData: any[] = [];
    let filename = "";

    if (type === 'MCQ') {
      filename = "Mau_Trac_Nghiem.xlsx";
      sampleData = [
        {
          "STT": 1,
          "MonHoc": "Toán",
          "Lop": "Lớp 3",
          "DoKho": "EASY",
          "CauHoi": "Phép nhân 8 x 5 bằng bao nhiêu?",
          "DapAnA": "35",
          "DapAnB": "40",
          "DapAnC": "45",
          "DapAnD": "50",
          "DapAnDung": "B",
          "GiaiThich": "Vì 8 x 5 = 40"
        },
        {
          "STT": 2,
          "MonHoc": "Toán",
          "Lop": "Lớp 3",
          "DoKho": "MEDIUM",
          "CauHoi": "Một năm có bao nhiêu tháng?",
          "DapAnA": "10 tháng",
          "DapAnB": "11 tháng",
          "DapAnC": "12 tháng",
          "DapAnD": "13 tháng",
          "DapAnDung": "C",
          "GiaiThich": "Một năm có 12 tháng từ tháng 1 đến tháng 12"
        }
      ];
    } else if (type === 'ESSAY') {
      filename = "Mau_Tu_Luan.xlsx";
      sampleData = [
        {
          "STT": 1,
          "MonHoc": "Toán",
          "Lop": "Lớp 3",
          "DoKho": "MEDIUM",
          "CauHoi": "Một cửa hàng có 5 hộp bút, mỗi hộp có 12 bút. Hỏi cửa hàng có tất cả bao nhiêu bút? Giải chi tiết.",
          "GoiY": "Lời giải: Cửa hàng có tất cả số bút là: 12 x 5 = 60 (bút). Đáp số: 60 bút."
        },
        {
          "STT": 2,
          "MonHoc": "Tiếng Việt",
          "Lop": "Lớp 4",
          "DoKho": "HARD",
          "CauHoi": "Viết đoạn văn ngắn (3-5 câu) kể về một người thân của em.",
          "GoiY": ""
        }
      ];
    } else if (type === 'READING') {
      filename = "Mau_Doc_Hieu.xlsx";
      sampleData = [
        {
          "STT": 1,
          "MonHoc": "Tiếng Việt",
          "Lop": "Lớp 3",
          "DoKho": "EASY",
          "DoanVan": "Hôm nay là ngày khai trường. Trời thu trong xanh, gió thổi nhẹ mang hương cốm mới. Các bạn học sinh tíu tít mặc quần áo mới, tay cầm cờ hoa rực rỡ đi tới trường.",
          "CauHoiPhu": "Thời tiết ngày khai trường được miêu tả như thế nào?",
          "DapAnA": "Trời mưa tầm tã",
          "DapAnB": "Trời âm u, lạnh lẽo",
          "DapAnC": "Trời thu trong xanh, gió thổi nhẹ",
          "DapAnD": "Trời nắng gắt, oi bức",
          "DapAnDung": "C",
          "GiaiThich": "Xem câu thứ hai trong đoạn văn."
        },
        {
          "STT": 2,
          "MonHoc": "",
          "Lop": "",
          "DoKho": "",
          "DoanVan": "",
          "CauHoiPhu": "Các bạn học sinh cầm gì đi tới trường?",
          "DapAnA": "Cầm cờ hoa rực rỡ",
          "DapAnB": "Cầm sách vở và đồ chơi",
          "DapAnC": "Cầm balo học sinh",
          "DapAnD": "Cầm cặp sách và mũ",
          "DapAnDung": "A",
          "GiaiThich": "Xem câu cuối cùng trong đoạn văn."
        }
      ];
    } else if (type === 'MATCHING') {
      filename = "Mau_Noi_Tu.xlsx";
      sampleData = [
        {
          "STT": 1,
          "MonHoc": "Toán",
          "Lop": "Lớp 3",
          "DoKho": "EASY",
          "YeuCau": "Nối tên con vật ở vế trái với tiếng kêu tương ứng ở vế phải:",
          "VeTrai": "Con chó | Con mèo | Con gà trống",
          "VePhai": "Kêu meo meo | Gáy ó o | Sủa gâu gâu",
          "KetNoi": "0-2 | 1-0 | 2-1"
        }
      ];
    }

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, filename);
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawJson = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        let lastPassage = "";
        let lastSubject = "";
        let lastGrade = "";
        let lastDifficulty = "EASY";
        const parsed: ParsedRow[] = [];

        for (const row of rawJson) {
          // Helper to fetch value from row regardless of casing/spacing/accents
          const getVal = (row: any, keys: string[]): string => {
            for (const k of keys) {
              if (row[k] !== undefined && row[k] !== null) {
                return row[k].toString().trim();
              }
            }
            return "";
          };

          // Chỉ import dòng có STT
          const stt = getVal(row, ['STT', 'stt', 'Số thứ tự', 'SoThuTu', 'Số Thứ Tự']);
          if (!stt) {
            continue; // Bỏ qua dòng trống không có STT
          }

          let isValid = true;
          let errorMsg = '';
          
          // Đọc Môn Học, Lớp & Độ khó, thừa kế từ dòng trước nếu để trống
          const subject = getVal(row, ['MonHoc', 'Môn học', 'Môn Học', 'Subject', 'subject']);
          const grade = getVal(row, ['Lop', 'Lớp', 'Lớp Học', 'Grade', 'grade']);
          const diff = getVal(row, ['DoKho', 'Độ Khó', 'Độ khó', 'Difficulty', 'difficulty']);
          
          if (subject) lastSubject = subject;
          if (grade) lastGrade = grade;
          if (diff) lastDifficulty = diff;

          const topicId = parseInt(getVal(row, ['TopicID', 'topic_id', 'Chủ đề ID', 'ChuDeID']) || '1');
          const difficultyMapped = lastDifficulty.toUpperCase() === 'HARD' ? 'HARD' : 
                                   (lastDifficulty.toUpperCase() === 'MEDIUM' ? 'MEDIUM' : 'EASY');

          let content = "";
          let options: string[] | null = null;
          let correct_answer: string | null = null;
          let explanation: string | null = null;
          
          let passage_content: string | undefined = undefined;
          let matching_left: string | undefined = undefined;
          let matching_right: string | undefined = undefined;
          let matching_mapping: string | undefined = undefined;

          // Xác thực thông tin Môn học và Lớp
          if (!lastSubject) { isValid = false; errorMsg = 'Thiếu thông tin Môn học'; }
          else if (!lastGrade) { isValid = false; errorMsg = 'Thiếu thông tin Lớp'; }

          if (isValid) {
            if (importType === 'MCQ') {
              content = getVal(row, ['CauHoi', 'Câu hỏi', 'Câu Hỏi', 'NoiDung', 'Nội Dung', 'Nội dung', 'Content']);
              const optA = getVal(row, ['DapAnA', 'Đáp án A', 'Đáp Án A', 'A', 'Option A']);
              const optB = getVal(row, ['DapAnB', 'Đáp án B', 'Đáp Án B', 'B', 'Option B']);
              const optC = getVal(row, ['DapAnC', 'Đáp án C', 'Đáp Án C', 'C', 'Option C']);
              const optD = getVal(row, ['DapAnD', 'Đáp án D', 'Đáp Án D', 'D', 'Option D']);
              const correct = getVal(row, ['DapAnDung', 'Đáp án đúng', 'Đáp Án Đúng', 'Đáp án Đúng', 'CorrectAnswer', 'Correct Answer', 'DapAn']);
              explanation = getVal(row, ['GiaiThich', 'Giải thích', 'Giải Thích', 'Gợi ý', 'GoiY', 'Explanation']);

              if (!content) { isValid = false; errorMsg = 'Thiếu nội dung câu hỏi'; }
              else if (!optA) { isValid = false; errorMsg = 'Thiếu đáp án A'; }
              else if (!optB) { isValid = false; errorMsg = 'Thiếu đáp án B'; }
              else if (!correct) { isValid = false; errorMsg = 'Thiếu đáp án đúng (A, B, C, D)'; }
              else if (!['A', 'B', 'C', 'D'].includes(correct.toUpperCase())) { isValid = false; errorMsg = 'Đáp án đúng phải là A, B, C hoặc D'; }
              else if (correct.toUpperCase() === 'C' && !optC) { isValid = false; errorMsg = 'Đáp án đúng là C nhưng cột Đáp án C trống'; }
              else if (correct.toUpperCase() === 'D' && !optD) { isValid = false; errorMsg = 'Đáp án đúng là D nhưng cột Đáp án D trống'; }

              options = [optA, optB, optC, optD].filter(Boolean);
              correct_answer = correct.toUpperCase();
            } 
            else if (importType === 'ESSAY') {
              content = getVal(row, ['CauHoi', 'Câu hỏi', 'Câu Hỏi', 'NoiDung', 'Nội Dung', 'Nội dung', 'Content']);
              explanation = getVal(row, ['GoiY', 'Gợi ý', 'Gợi Ý', 'Đáp án mẫu', 'DapAnMau', 'Explanation']);

              if (!content) { isValid = false; errorMsg = 'Thiếu nội dung câu hỏi'; }
            }
            else if (importType === 'READING') {
              const passage = getVal(row, ['DoanVan', 'Đoạn văn', 'Đoạn Văn', 'DoanVanDocHieu', 'Passage']);
              if (passage) {
                lastPassage = passage;
              }
              passage_content = lastPassage;

              content = getVal(row, ['CauHoiPhu', 'Câu hỏi phụ', 'Câu Hỏi Phụ', 'NoiDungPhu', 'Nội dung phụ', 'CauHoi', 'Câu hỏi']);
              const optA = getVal(row, ['DapAnA', 'Đáp án A', 'Đáp Án A', 'A', 'Option A']);
              const optB = getVal(row, ['DapAnB', 'Đáp án B', 'Đáp Án B', 'B', 'Option B']);
              const optC = getVal(row, ['DapAnC', 'Đáp án C', 'Đáp Án C', 'C', 'Option C']);
              const optD = getVal(row, ['DapAnD', 'Đáp án D', 'Đáp Án D', 'D', 'Option D']);
              const correct = getVal(row, ['DapAnDung', 'Đáp án đúng', 'Đáp Án Đúng', 'Đáp án Đúng', 'CorrectAnswer', 'Correct Answer', 'DapAn']);
              explanation = getVal(row, ['GiaiThich', 'Giải thích', 'Giải Thích', 'Gợi ý', 'GoiY', 'Explanation']);

              if (!lastPassage) { isValid = false; errorMsg = 'Thiếu đoạn văn đọc hiểu (dòng hiện tại hoặc dòng trước)'; }
              else if (!content) { isValid = false; errorMsg = 'Thiếu câu hỏi phụ'; }
              else if (!optA) { isValid = false; errorMsg = 'Thiếu đáp án A'; }
              else if (!optB) { isValid = false; errorMsg = 'Thiếu đáp án B'; }
              else if (!correct) { isValid = false; errorMsg = 'Thiếu đáp án đúng (A, B, C, D)'; }
              else if (!['A', 'B', 'C', 'D'].includes(correct.toUpperCase())) { isValid = false; errorMsg = 'Đáp án đúng phải là A, B, C hoặc D'; }
              else if (correct.toUpperCase() === 'C' && !optC) { isValid = false; errorMsg = 'Đáp án đúng là C nhưng cột Đáp án C trống'; }
              else if (correct.toUpperCase() === 'D' && !optD) { isValid = false; errorMsg = 'Đáp án đúng là D nhưng cột Đáp án D trống'; }

              options = [optA, optB, optC, optD].filter(Boolean);
              correct_answer = correct.toUpperCase();
            }
            else if (importType === 'MATCHING') {
              content = getVal(row, ['YeuCau', 'Yêu cầu', 'Yêu Cầu', 'Content', 'NoiDung', 'Nội dung']);
              const left = getVal(row, ['VeTrai', 'Vế trái', 'Vế Trái', 'ColumnA', 'Left']);
              const right = getVal(row, ['VePhai', 'Vế phải', 'Vế Phải', 'ColumnB', 'Right']);
              const mapping = getVal(row, ['KetNoi', 'Kết nối', 'Kết Nối', 'Mapping', 'Answer']);

              matching_left = left;
              matching_right = right;
              matching_mapping = mapping;

              if (!content) { isValid = false; errorMsg = 'Thiếu yêu cầu câu hỏi'; }
              else if (!left) { isValid = false; errorMsg = 'Thiếu danh sách vế trái'; }
              else if (!right) { isValid = false; errorMsg = 'Thiếu danh sách vế phải'; }
              else if (!mapping) { isValid = false; errorMsg = 'Thiếu dữ liệu kết nối'; }
              else {
                const leftItems = left.split('|').map(x => x.trim()).filter(Boolean);
                const rightItems = right.split('|').map(x => x.trim()).filter(Boolean);
                const pairs = mapping.split('|').map(x => x.trim()).filter(Boolean);

                for (const pair of pairs) {
                  const parts = pair.split('-');
                  if (parts.length !== 2) {
                    isValid = false;
                    errorMsg = 'Định dạng kết nối sai (phải là số-số, ví dụ: 0-0 | 1-2)';
                    break;
                  }
                  const lIdx = parseInt(parts[0]);
                  const rIdx = parseInt(parts[1]);
                  if (isNaN(lIdx) || isNaN(rIdx)) {
                    isValid = false;
                    errorMsg = 'Chỉ số kết nối phải là số nguyên';
                    break;
                  }
                  if (lIdx < 0 || lIdx >= leftItems.length) {
                    isValid = false;
                    errorMsg = `Chỉ số vế trái ${lIdx} vượt giới hạn (${leftItems.length} mục)`;
                    break;
                  }
                  if (rIdx < 0 || rIdx >= rightItems.length) {
                    isValid = false;
                    errorMsg = `Chỉ số vế phải ${rIdx} vượt giới hạn (${rightItems.length} mục)`;
                    break;
                  }
                }
              }

              options = left ? left.split('|').map(x => x.trim()) : null;
              correct_answer = mapping;
            }
          }

          parsed.push({
            content,
            options,
            correct_answer,
            difficulty: difficultyMapped,
            topic_id: topicId,
            explanation,
            q_type: importType,
            subject: lastSubject,
            grade: lastGrade,
            passage_content,
            matching_left,
            matching_right,
            matching_mapping,
            _isValid: isValid,
            _errorMsg: errorMsg
          });
        }

        setRows(parsed);
      } catch (err) {
        console.error(err);
        alert('Lỗi đọc file Excel!');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const handleConfirm = () => {
    const validRows = rows.filter(r => r._isValid);
    onImport(validRows);
  };

  const getDiffLabel = (d: string) => {
    if (d === 'HARD') return '🔴 Khó';
    if (d === 'MEDIUM') return '🟡 Trung bình';
    return '🟢 Dễ';
  };

  const renderTableHeader = () => {
    if (importType === 'MCQ') {
      return (
        <tr>
          <th>STT</th>
          <th>Phân loại</th>
          <th>Độ khó</th>
          <th>Câu hỏi</th>
          <th>Đáp án đúng</th>
          <th>Trạng thái</th>
        </tr>
      );
    } else if (importType === 'ESSAY') {
      return (
        <tr>
          <th>STT</th>
          <th>Phân loại</th>
          <th>Độ khó</th>
          <th>Câu hỏi</th>
          <th>Trạng thái</th>
        </tr>
      );
    } else if (importType === 'READING') {
      return (
        <tr>
          <th>STT</th>
          <th>Phân loại</th>
          <th>Độ khó</th>
          <th>Đoạn văn & Câu hỏi phụ</th>
          <th>Đáp án đúng</th>
          <th>Trạng thái</th>
        </tr>
      );
    } else {
      return (
        <tr>
          <th>STT</th>
          <th>Phân loại</th>
          <th>Độ khó</th>
          <th>Yêu cầu nối từ</th>
          <th>Cặp nối (Trái | Phải)</th>
          <th>Kết nối đúng</th>
          <th>Trạng thái</th>
        </tr>
      );
    }
  };

  const renderTableRow = (r: ParsedRow, index: number) => {
    const statusCell = (
      <td>
        {r._isValid ? (
          <span className="status-badge valid">✔️ Hợp lệ</span>
        ) : (
          <span className="status-badge invalid" title={r._errorMsg}>❌ {r._errorMsg}</span>
        )}
      </td>
    );

    const classificationCell = (
      <td>
        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--color-accent))', fontWeight: 600 }}>{r.subject}</span>
        <br />
        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))' }}>{r.grade}</span>
      </td>
    );

    const diffCell = (
      <td>
        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{getDiffLabel(r.difficulty)}</span>
      </td>
    );

    if (importType === 'MCQ') {
      return (
        <tr key={index} className={r._isValid ? 'row-valid' : 'row-invalid'}>
          <td>{index + 1}</td>
          {classificationCell}
          {diffCell}
          <td className="truncate">{r.content}</td>
          <td style={{ fontWeight: 'bold', color: 'hsl(var(--color-primary))' }}>{r.correct_answer}</td>
          {statusCell}
        </tr>
      );
    } else if (importType === 'ESSAY') {
      return (
        <tr key={index} className={r._isValid ? 'row-valid' : 'row-invalid'}>
          <td>{index + 1}</td>
          {classificationCell}
          {diffCell}
          <td className="truncate">{r.content}</td>
          {statusCell}
        </tr>
      );
    } else if (importType === 'READING') {
      return (
        <tr key={index} className={r._isValid ? 'row-valid' : 'row-invalid'}>
          <td>{index + 1}</td>
          {classificationCell}
          {diffCell}
          <td>
            {r.passage_content && (
              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))', fontStyle: 'italic', marginBottom: '4px' }}>
                Đoạn văn: {r.passage_content.substring(0, 50)}...
              </div>
            )}
            <div className="truncate">{r.content}</div>
          </td>
          <td style={{ fontWeight: 'bold', color: 'hsl(var(--color-primary))' }}>{r.correct_answer}</td>
          {statusCell}
        </tr>
      );
    } else {
      return (
        <tr key={index} className={r._isValid ? 'row-valid' : 'row-invalid'}>
          <td>{index + 1}</td>
          {classificationCell}
          {diffCell}
          <td className="truncate">{r.content}</td>
          <td>
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'hsl(var(--color-accent))' }}>Trái:</span> {r.matching_left?.split('|').length || 0} mục | <span style={{ color: 'hsl(var(--color-primary))' }}>Phải:</span> {r.matching_right?.split('|').length || 0} mục
            </div>
          </td>
          <td style={{ fontFamily: 'monospace' }}>{r.correct_answer}</td>
          {statusCell}
        </tr>
      );
    }
  };

  if (!isOpen) return null;

  const validCount = rows.filter(r => r._isValid).length;

  return (
    <div className="dialog-overlay animate-enter">
      <Card className="dialog-content import-dialog" glass>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
          <h2 className="dialog-title" style={{ margin: 0, border: 'none', padding: 0 }}>Nhập Liệu Từ Excel</h2>
          <Button variant="ghost" onClick={onClose} style={{ minWidth: 'auto', padding: '6px 12px' }}>Đóng</Button>
        </div>

        {/* Khu vực chọn loại câu hỏi để Import */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label>Loại câu hỏi muốn nhập:</label>
          <select 
            value={importType} 
            onChange={(e) => {
              setImportType(e.target.value as any);
              setRows([]); // Xóa preview cũ khi đổi loại câu hỏi
            }}
          >
            <option value="MCQ">Trắc nghiệm (MCQ)</option>
            <option value="ESSAY">Tự luận (Bài giải)</option>
            <option value="READING">Đọc hiểu (Tiếng Việt)</option>
            <option value="MATCHING">Nối từ (MATCHING)</option>
          </select>
        </div>

        {/* Khu vực tải File Mẫu Tĩnh */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))' }}>Tải file mẫu Excel (.xlsx):</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Button variant="secondary" size="sm" onClick={() => downloadTemplate('MCQ')}>Mẫu Trắc Nghiệm</Button>
            <Button variant="secondary" size="sm" onClick={() => downloadTemplate('ESSAY')}>Mẫu Tự Luận</Button>
            <Button variant="secondary" size="sm" onClick={() => downloadTemplate('READING')}>Mẫu Đọc Hiểu</Button>
            <Button variant="secondary" size="sm" onClick={() => downloadTemplate('MATCHING')}>Mẫu Nối Từ</Button>
          </div>
        </div>

        {/* Khu vực kéo thả Excel */}
        {rows.length === 0 ? (
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <div className="dropzone-content">
              <span className="icon">📄</span>
              {isDragActive ? (
                <p>Thả file vào đây...</p>
              ) : (
                <p>Kéo thả file Excel (.xlsx) chứa câu hỏi vào đây, hoặc click để chọn file</p>
              )}
            </div>
          </div>
        ) : (
          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                {renderTableHeader()}
              </thead>
              <tbody>
                {rows.map((r, i) => renderTableRow(r, i))}
              </tbody>
            </table>
          </div>
        )}

        <div className="dialog-actions">
          <Button variant="secondary" onClick={() => setRows([])} disabled={rows.length === 0}>
            Chọn file khác
          </Button>
          {rows.length > 0 && (
            <Button variant="primary" onClick={handleConfirm} disabled={validCount === 0}>
              Nhập {validCount} câu hợp lệ
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
