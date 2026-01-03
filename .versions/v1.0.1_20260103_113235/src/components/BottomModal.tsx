import React from 'react';
import ModalCloseButton from './ModalCloseButton';

interface BottomModalProps {
  open: boolean;
  title?: string;
  onCancel: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const BottomModal: React.FC<BottomModalProps> = ({
  open,
  title,
  onCancel,
  onSubmit,
  submitLabel = 'Apply',
  cancelLabel = 'Cancel',
  children,
  disabled = false,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black bg-opacity-40">
      <div className="rounded-t-2xl bg-white w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b relative">
          {title && <div className="font-semibold text-lg flex-1 text-center">{title}</div>}
          <ModalCloseButton onClick={onCancel} ariaLabel="Close" className="absolute right-4 top-4" />
        </div>
        <div className="px-2 py-2">{children}</div>
        {onSubmit && (
          <div className="flex gap-2 px-4 py-3 border-t">
            <button onClick={onCancel} className="flex-1 py-2 rounded bg-gray-100 font-semibold text-gray-700">{cancelLabel}</button>
            <button onClick={onSubmit} disabled={disabled} className="flex-1 py-2 rounded gradient-btn-equal text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed">{submitLabel}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomModal; 