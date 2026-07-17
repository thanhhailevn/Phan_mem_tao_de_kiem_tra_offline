/// Định nghĩa các kiểu dữ liệu cho Sàn Kiến Thức
/// Bắt buộc comment tiếng Việt

export interface Topic {
  id: number;
  name: string;
  order_index: number;
  children?: Topic[];
}

export interface Grade {
  id: number;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: number;
  name: string;
  grades: Grade[];
}
