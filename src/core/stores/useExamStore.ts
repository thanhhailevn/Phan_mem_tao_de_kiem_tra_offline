import { create } from 'zustand';
import { apiGenerateExamAuto, apiSwapQuestion } from '../api/tauri-invoke';
import { ExamMatrixConfig, Question } from '../api/types';

interface ExamState {
  currentDraft: Question[];
  isGenerating: boolean;
  error: string | null;

  generateAutoExam: (config: ExamMatrixConfig) => Promise<void>;
  swapQuestionInDraft: (examId: string, oldQuestionId: string) => Promise<void>;
  clearDraft: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  currentDraft: [],
  isGenerating: false,
  error: null,

  generateAutoExam: async (config: ExamMatrixConfig) => {
    set({ isGenerating: true, error: null });
    try {
      const generatedQuestions = await apiGenerateExamAuto(config);
      set({ currentDraft: generatedQuestions, isGenerating: false });
    } catch (err: any) {
      set({ error: err.message, isGenerating: false });
    }
  },

  swapQuestionInDraft: async (examId: string, oldQuestionId: string) => {
    try {
      const newQuestion = await apiSwapQuestion(examId, oldQuestionId);
      
      const { currentDraft } = get();
      const updatedDraft = currentDraft.map((q) => 
        q.id === oldQuestionId ? newQuestion : q
      );

      set({ currentDraft: updatedDraft });
    } catch (err: any) {
      // Throw error up to UI for toast notification
      throw new Error(err.message);
    }
  },

  clearDraft: () => {
    set({ currentDraft: [], error: null });
  }
}));
