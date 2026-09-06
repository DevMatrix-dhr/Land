import React from 'react';
import { Link } from 'react-router-dom';

export default function DuplicateWarning({ warning, onDismiss }) {
  const { file, matchedRecord } = warning;
  
  return (
    <div className="bg-seal-500/10 border border-seal-500/30 rounded-lg p-4 flex items-start gap-4 animate-fade-in shadow-sm">
      <div className="text-2xl mt-0.5">⚠️</div>
      <div className="flex-1">
        <h4 className="text-seal-600 font-semibold text-sm mb-1">Duplicate Document Detected</h4>
        <p className="text-xs text-ink-700 mb-2">
          The file <span className="font-mono bg-white/50 px-1 rounded">{file}</span> appears to be a duplicate of an already processed document.
        </p>
        
        {matchedRecord && (
          <div className="bg-white/60 rounded p-2 text-xs mb-3 flex gap-4">
            <div>
              <span className="text-ink-500 block text-[10px] uppercase">Matched Record ID</span>
              <span className="font-medium">{matchedRecord.record_id}</span>
            </div>
            <div>
              <span className="text-ink-500 block text-[10px] uppercase">Khasra Number</span>
              <span className="font-medium">{matchedRecord.khasra_number}</span>
            </div>
            <div>
              <span className="text-ink-500 block text-[10px] uppercase">Uploaded At</span>
              <span className="font-medium">{new Date(matchedRecord.uploaded_at).toLocaleDateString()}</span>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mt-2">
          {matchedRecord && (
            <Link 
              to="/repository" 
              className="text-xs bg-white border border-parchment-200 px-3 py-1.5 rounded hover:bg-parchment-50 transition-colors"
            >
              View original
            </Link>
          )}
          <button 
            onClick={onDismiss}
            className="text-xs bg-seal-600 text-white px-3 py-1.5 rounded hover:bg-seal-500 transition-colors"
          >
            Dismiss warning
          </button>
        </div>
      </div>
    </div>
  );
}
