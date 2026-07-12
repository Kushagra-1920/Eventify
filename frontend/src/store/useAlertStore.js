import { create } from 'zustand';

export const useAlertStore = create((set) => ({
  isOpen: false,
  title: '',
  message: '',
  type: 'alert', // 'alert' | 'confirm'
  confirmText: 'OK',
  cancelText: 'Cancel',
  onConfirm: null,
  onCancel: null,

  showAlert: (title, message, confirmText = 'OK') => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        title,
        message,
        type: 'alert',
        confirmText,
        onConfirm: () => {
          set({ isOpen: false });
          resolve(true);
        },
        onCancel: null
      });
    });
  },

  showConfirm: (title, message, confirmText = 'Confirm', cancelText = 'Cancel') => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        title,
        message,
        type: 'confirm',
        confirmText,
        cancelText,
        onConfirm: () => {
          set({ isOpen: false });
          resolve(true);
        },
        onCancel: () => {
          set({ isOpen: false });
          resolve(false);
        }
      });
    });
  },

  close: () => set({ isOpen: false })
}));
