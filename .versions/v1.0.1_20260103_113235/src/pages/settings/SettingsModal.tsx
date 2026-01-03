import React from 'react';
import BottomModal from '../../components/BottomModal';

interface SettingsModalProps {
  open: boolean;
  title?: string;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
  variant?: 'desktop' | 'mobile';
  loading?: boolean;
  disabled?: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  title,
  onCancel,
  onSubmit,
  submitLabel = 'Update',
  cancelLabel = 'Cancel',
  children,
  variant = 'desktop',
  loading = false,
  disabled = false,
}) => {
  if (!open) return null;

  if (variant === 'mobile') {
    return (
      <BottomModal
        open={open}
        title={title}
        onCancel={onCancel}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
        cancelLabel={cancelLabel}
        disabled={disabled}
      >
        {children}
      </BottomModal>
    );
  }

  // Desktop modal (centered popup)
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto relative animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="mb-8">{children}</div>
          <div className="flex gap-6 justify-center">
            <button
              type="button"
              className="settings-cancel-btn"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              className="settings-gradient-btn"
              disabled={loading || disabled}
            >
              {loading ? 'Updating...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal; 