import React from 'react';
import { X } from 'lucide-react';

type ModalCloseButtonProps = {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
  title?: string;
};

const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClick,
  className = '',
  ariaLabel = 'Close',
  title = 'Close',
}) => {
  return (
    // <button
    //   type="button"
    //   onClick={onClick}
    //   aria-label={ariaLabel}
    //   title={title}
    //   className={[
    //     'inline-flex items-center justify-center',
    //     'w-11 h-11 rounded-full',
    //     'border border-black/10 bg-white/95 shadow-md backdrop-blur',
    //     'hover:bg-white',
    //     'focus:outline-none focus:ring-2 focus:ring-[#007E67] focus:ring-offset-2',
    //     className,
    //   ].join(' ')}
    // >
    //   <X className="w-5 h-5 text-[#004236]" strokeWidth={2.5} />
    // </button>

    <div className="relative">
      {/* Grid View Icon */}
      <button
            onClick={onClick}
            className={`text-black absolute top-4 right-4 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all duration-200 shadow-sm`}
            title="Grid View"
          >
          <svg
  className="w-5 h-5"
  fill="none"
  viewBox="0 0 24 24"
  stroke="#000000"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2.8}
    d="M6 18L18 6M6 6l12 12"
  />
</svg>

          </button>
    </div>
  );
};

export default ModalCloseButton;


