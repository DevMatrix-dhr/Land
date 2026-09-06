import { useState, useEffect } from "react";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import DocumentViewer from "../components/DocumentViewer.jsx";

export default function Repository() {
  const { records, searchRecords } = useData();
  const [results, setResults] = useState(records);
  const [query, setQuery] = useState("");
  const [filterLang, setFilterLang] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    searchRecords({ query, language: filterLang, status: filterStatus }).then(setResults);
  }, [query, filterLang, filterStatus, records, searchRecords]);

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <h1 className="font-display text-2xl mb-1">Document Repository</h1>
      <p className="text-sm text-ink-600 mb-6">Search, filter, and view digitized land records.</p>
      
      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search by owner, Khasra, village..." 
          className="border border-parchment-200 rounded px-4 py-2 text-sm flex-1 bg-white focus:outline-none focus:border-ink-500"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select className="border border-parchment-200 rounded px-4 py-2 text-sm bg-white" value={filterLang} onChange={e => setFilterLang(e.target.value)}>
          <option value="">All Languages</option>
          <option value="Hindi">Hindi</option>
          <option value="English">English</option>
          <option value="Marathi">Marathi</option>
          <option value="Telugu">Telugu</option>
        </select>
        <select className="border border-parchment-200 rounded px-4 py-2 text-sm bg-white" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="auto_approved">Auto Approved</option>
          <option value="needs_review">Needs Review</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-parchment-100 text-ink-700 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 border-b border-parchment-200">ID / Khasra</th>
              <th className="text-left px-4 py-3 border-b border-parchment-200">Owner / Guardian</th>
              <th className="text-left px-4 py-3 border-b border-parchment-200">Location</th>
              <th className="text-left px-4 py-3 border-b border-parchment-200">Language</th>
              <th className="text-left px-4 py-3 border-b border-parchment-200">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.record_id} className="ledger-row">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.khasra_number}</div>
                  <div className="text-[10px] text-ink-500 font-mono">{r.record_id}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{r.landowner_name}</div>
                  <div className="text-[10px] text-ink-500">c/o {r.landowner_guardian_name}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{r.village}</div>
                  <div className="text-[10px] text-ink-500">{r.tehsil}, {r.district}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`lang-badge lang-${r.detected_language}`}>{r.detected_language}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`status-pill status-${r.validation_status}`}>
                    {r.validation_status.replace(/_/g, " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {results.length === 0 && (
          <div className="p-8 text-center text-ink-500 text-sm">No records found matching criteria.</div>
        )}
      </div>
    </div>
  );
}
