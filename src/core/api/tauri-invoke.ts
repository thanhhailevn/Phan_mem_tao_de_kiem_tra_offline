import { invoke } from '@tauri-apps/api/core';
import { AppError, ExamMatrixConfig, Question } from './types';

/**
 * Helper để extract lỗi an toàn từ Rust
 */
export const parseAppError = (err: unknown): string => {
  if (typeof err === 'string') return err;
  
  const appError = err as AppError;
  if (appError.BusinessLogic) return appError.BusinessLogic;
  if (appError.Database) return `Lỗi CSDL: ${appError.Database}`;
  if (appError.FileSystem) return `Lỗi File: ${appError.FileSystem}`;
  
  return 'Đã xảy ra lỗi không xác định từ Hệ thống';
};

// ==========================================
// EXAM COMMANDS
// ==========================================
export const apiGenerateExamAuto = async (config: ExamMatrixConfig): Promise<Question[]> => {
  try {
    return await invoke<Question[]>('cmd_generate_exam_auto', { config });
  } catch (err) {
    throw new Error(parseAppError(err));
  }
};

export const apiSwapQuestion = async (examId: string, oldQuestionId: string): Promise<Question> => {
  try {
    return await invoke<Question>('cmd_swap_question', { examId, oldQuestionId });
  } catch (err) {
    throw new Error(parseAppError(err));
  }
};

// ==========================================
// CURRICULUM COMMANDS
// ==========================================
export const apiSyncCurriculum = async (): Promise<string> => {
  try {
    return await invoke<string>('cmd_sync_curriculum');
  } catch (err) {
    throw new Error(parseAppError(err));
  }
};

export const apiGetCurriculumTree = async (): Promise<string> => {
  try {
    return await invoke<string>('cmd_get_tree');
  } catch (err) {
    throw new Error(parseAppError(err));
  }
};
