import React from 'react';

function ResearchModal({ isOpen, onClose, ticker, pros, cons }) {
  if (!isOpen) return null;

  const prosList = pros ? pros.split(',').map((p) => p.trim()).filter(Boolean) : [];
  const consList = cons ? cons.split(',').map((c) => c.trim()).filter(Boolean) : [];

  // Close modal on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close modal on Escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Research report for ${ticker}`}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            📊 Research Report:{' '}
            <span className="underline decoration-indigo-300">{ticker}</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="hover:bg-indigo-500 rounded-full p-2 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {prosList.length === 0 && consList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-gray-500 font-medium">No research data available yet.</p>
              <p className="text-gray-400 text-sm mt-1">
                Pros and cons will appear here once added for {ticker}.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">

              {/* Pros */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 border-b border-green-100 pb-2">
                  ✅ Pros
                </h3>
                <ul className="space-y-3 text-gray-700">
                  {prosList.length > 0 ? (
                    prosList.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                        <span className="text-green-500 mt-1 shrink-0">•</span>
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="italic text-gray-400">No pros listed.</li>
                  )}
                </ul>
              </div>

              {/* Cons */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 border-b border-red-100 pb-2">
                  ❌ Cons
                </h3>
                <ul className="space-y-3 text-gray-700">
                  {consList.length > 0 ? (
                    consList.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                        <span className="text-red-500 mt-1 shrink-0">•</span>
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="italic text-gray-400">No cons listed.</li>
                  )}
                </ul>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-between items-center border-t">
          <p className="text-xs text-gray-400">
            Data shown is for reference only. Always do your own research.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition active:scale-95"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
}

export default ResearchModal;