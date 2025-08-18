// データベース操作の統一エクスポート
export * from './customers';
export * from './messages';
export * from './notes';
export * from './analytics';
export * from './profile';

// 後方互換性のため、既存の関数名をエクスポート
export { customerOperations as customers } from './customers';
export { messageOperations as messages } from './messages';
export { noteOperations as notes } from './notes';
export { analyticsOperations as analytics } from './analytics';
export { profileOperations as profile } from './profile';

// 個別の関数も直接エクスポート（既存コードとの互換性）
export { customerOperations } from './customers';
export { messageOperations } from './messages';
export { noteOperations } from './notes';
export { analyticsOperations } from './analytics';
export { profileOperations } from './profile';

// 従来の関数名での再エクスポート
import { customerOperations } from './customers';
import { messageOperations } from './messages';
import { noteOperations } from './notes';
import { analyticsOperations } from './analytics';
import { profileOperations } from './profile';

export const getOrCreateCustomer = customerOperations.getOrCreateCustomer;
export const getAllCustomers = customerOperations.getAllCustomers;
export const updateCustomer = customerOperations.updateCustomer;
export const deleteCustomer = customerOperations.deleteCustomer;

export const saveMessageHistory = messageOperations.saveMessageHistory;
export const getMessageHistory = messageOperations.getMessageHistory;
export const saveMessageRating = messageOperations.saveMessageRating;

export const saveCustomerNote = noteOperations.saveCustomerNote;
export const getCustomerNotes = noteOperations.getCustomerNotes;
export const getSelectedNotes = noteOperations.getSelectedNotes;

export const getStats = analyticsOperations.getStats;
export const getUserToneAnalysis = analyticsOperations.getUserToneAnalysis;
export const getUserTonePreferences = analyticsOperations.getUserTonePreferences;
export const saveUserTonePreference = analyticsOperations.saveUserTonePreference;
export const updateToneUsageCount = analyticsOperations.updateToneUsageCount;
export const calculateToneSuccessRate = analyticsOperations.calculateToneSuccessRate;

export const getUserProfile = profileOperations.getUserProfile;
export const saveUserProfile = profileOperations.saveUserProfile;
export const updateUserProfile = profileOperations.updateUserProfile;
