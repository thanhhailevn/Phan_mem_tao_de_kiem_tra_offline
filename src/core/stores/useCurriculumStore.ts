import { create } from 'zustand';
import { apiGetCurriculumTree, apiSyncCurriculum } from '../api/tauri-invoke';

interface CurriculumState {
  curriculumTreeRaw: string | null;
  isLoading: boolean;
  error: string | null;

  syncCurriculum: () => Promise<void>;
  loadCurriculumTree: () => Promise<void>;
}

export const useCurriculumStore = create<CurriculumState>((set) => ({
  curriculumTreeRaw: null,
  isLoading: false,
  error: null,

  syncCurriculum: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiSyncCurriculum();
      // Sau khi sync thành công, tải lại cây
      const data = await apiGetCurriculumTree();
      set({ curriculumTreeRaw: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  loadCurriculumTree: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiGetCurriculumTree();
      set({ curriculumTreeRaw: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
