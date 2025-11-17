
import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface CopyButtonProps {
  textToCopy: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 disabled:opacity-50"
      title={isCopied ? "تم النسخ!" : "نسخ"}
      disabled={isCopied}
    >
      {isCopied ? (
        <CheckIcon className="w-5 h-5 text-green-400" />
      ) : (
        <CopyIcon className="w-5 h-5" />
      )}
    </button>
  );
};
