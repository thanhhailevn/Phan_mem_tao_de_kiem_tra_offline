/// Store quản lý trạng thái của Sàn Kiến Thức (Curriculum)
/// Sử dụng Zustand để quản lý state
import { create } from 'zustand';
import { Subject } from '../types';

interface CurriculumState {
  /// Danh sách các môn học (Sàn kiến thức)
  subjects: Subject[];
  /// Trạng thái đang tải dữ liệu
  isLoading: boolean;
  /// Hàm cập nhật danh sách môn học
  setSubjects: (subjects: Subject[]) => void;
  /// Hàm thay đổi trạng thái tải
  setLoading: (loading: boolean) => void;
  /// Hàm tải dữ liệu mẫu (mock) trong khi chờ Rust backend
  loadMockData: () => void;
  /// Hàm tải cấu trúc từ API
  fetchFromApi: (url: string) => Promise<boolean>;
}

export const useCurriculumStore = create<CurriculumState>((set) => ({
  subjects: [],
  isLoading: false,
  
  setSubjects: (subjects) => set({ subjects }),
  setLoading: (isLoading) => set({ isLoading }),
  
  fetchFromApi: async (url: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      set({ subjects: data.subjects || [], isLoading: false });
      return true;
    } catch (error) {
      console.error('Failed to fetch curriculum:', error);
      set({ isLoading: false });
      return false;
    }
  },
  
  loadMockData: () => {
    set({ isLoading: true });
    // Giả lập dữ liệu mầm để hiển thị UI
    setTimeout(() => {
      set({
        isLoading: false,
        subjects: [
          {
            id: 1,
            name: 'Toán Học',
            grades: [
              {
                id: 1,
                name: 'Lớp 3',
                topics: [
                  { id: 1, name: 'Phép cộng, phép trừ', order_index: 1, children: [] },
                  { id: 2, name: 'Bảng nhân, bảng chia', order_index: 2, children: [] },
                ],
              },
              {
                id: 2,
                name: 'Lớp 4',
                topics: [
                  { id: 3, name: 'Phân số', order_index: 1, children: [] },
                ],
              }
            ],
          },
          {
            id: 2,
            name: 'Tiếng Việt',
            grades: [
              {
                id: 3,
                name: 'Lớp 3',
                topics: [
                  { id: 4, name: 'Tập đọc', order_index: 1, children: [] },
                  { id: 5, name: 'Luyện từ và câu', order_index: 2, children: [] },
                ],
              }
            ],
          }
        ],
      });
    }, 500);
  }
}));
