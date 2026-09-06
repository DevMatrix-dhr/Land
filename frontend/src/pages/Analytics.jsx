import { useData } from "../context/DataContext.jsx";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";

export default function Analytics() {
  const { dashboardStats } = useData();

  if (!dashboardStats) return <div className="p-8 text-sm text-ink-600">Loading dashboard…</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <h1 className="font-display text-2xl mb-1">Administrator Dashboard</h1>
      <p className="text-sm text-ink-600 mb-6">State and district-wise digitization progress, accuracy metrics, and AI model performance.</p>

      {/* Metric cards */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        <Metric label="Total documents" value={dashboardStats.total_documents} icon="📄" />
        <Metric label="Digitized" value={dashboardStats.digitized} tone="moss" icon="✅" />
        <Metric label="Overall accuracy" value={`${dashboardStats.overall_accuracy}%`} tone="moss" icon="🎯" />
        <Metric label="Pending verification" value={dashboardStats.pending_verification} tone="amber" icon="🔍" />
        <Metric label="Flagged" value={dashboardStats.flagged} tone="seal" icon="🚩" />
        <Metric label="Avg. processing time" value={dashboardStats.avg_processing_time} icon="⏱️" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Digitization progress by district */}
        <div className="card p-5">
          <h2 className="text-xs font-medium text-ink-700 mb-4 uppercase tracking-wide">Digitization Progress by District</h2>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={dashboardStats.district_progress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9DFC6" vertical={false} />
                <XAxis dataKey="district_name" fontSize={11} stroke="#3A5590" />
                <YAxis fontSize={11} stroke="#3A5590" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Bar dataKey="approved_count" fill="#3A5F39" radius={[3, 3, 0, 0]} name="Approved" />
                <Bar dataKey="pending_review_count" fill="#C4872A" radius={[3, 3, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-day accuracy trend */}
        <div className="card p-5">
          <h2 className="text-xs font-medium text-ink-700 mb-4 uppercase tracking-wide">Extraction Accuracy Trend (30 days)</h2>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={dashboardStats.accuracy_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9DFC6" vertical={false} />
                <XAxis dataKey="date" fontSize={10} stroke="#3A5590" />
                <YAxis domain={[85, 100]} fontSize={10} stroke="#3A5590" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Area type="monotone" dataKey="accuracy" stroke="#3A5F39" fill="#3A5F39" fillOpacity={0.15} strokeWidth={2} name="Accuracy %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {/* Error breakdown */}
        <div className="card p-5">
          <h2 className="text-xs font-medium text-ink-700 mb-4 uppercase tracking-wide">Validation Error Breakdown</h2>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dashboardStats.error_stats}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={75}
                  dataKey="failures"
                  nameKey="label"
                  paddingAngle={2}
                >
                  {dashboardStats.error_stats.map((_, i) => (
                    <Cell key={i} fill={["#B5482E", "#C4872A", "#4E6DAD", "#3A5F39", "#9E6C1F", "#6B7280"][i % 6]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2">
            {dashboardStats.error_stats.slice(0, 4).map((e) => (
              <div key={e.rule_name} className="flex items-center justify-between text-[11px]">
                <span className="text-ink-600">{e.label}</span>
                <span className="font-mono text-ink-700">{e.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language distribution */}
        <div className="card p-5">
          <h2 className="text-xs font-medium text-ink-700 mb-4 uppercase tracking-wide">Language Distribution</h2>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dashboardStats.language_distribution}
                  cx="50%" cy="50%"
                  outerRadius={75}
                  dataKey="count"
                  nameKey="language"
                  paddingAngle={2}
                >
                  {dashboardStats.language_distribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2">
            {dashboardStats.language_distribution.map((l) => (
              <div key={l.language} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }}></span>
                  <span className="text-ink-600">{l.language}</span>
                </div>
                <span className="font-mono text-ink-700">{l.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Document type breakdown */}
        <div className="card p-5">
          <h2 className="text-xs font-medium text-ink-700 mb-4 uppercase tracking-wide">Document Type</h2>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dashboardStats.doctype_distribution}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={75}
                  dataKey="count"
                  nameKey="type"
                  paddingAngle={2}
                >
                  {dashboardStats.doctype_distribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2">
            {dashboardStats.doctype_distribution.map((l) => (
              <div key={l.type} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }}></span>
                  <span className="text-ink-600">{l.type}</span>
                </div>
                <span className="font-mono text-ink-700">{l.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Learning Curve */}
        <div className="card p-5">
          <h2 className="text-xs font-medium text-ink-700 mb-4 uppercase tracking-wide">AI Model Learning Curve</h2>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={dashboardStats.ai_learning_curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9DFC6" vertical={false} />
                <XAxis dataKey="label" fontSize={10} stroke="#3A5590" label={{ value: "Documents processed", position: "insideBottom", offset: -2, fontSize: 9, fill: "#3A5590" }} />
                <YAxis domain={[70, 100]} fontSize={10} stroke="#3A5590" label={{ value: "Accuracy %", angle: -90, position: "insideLeft", fontSize: 9, fill: "#3A5590" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                <Line type="monotone" dataKey="accuracy" stroke="#FF9933" strokeWidth={2} dot={{ r: 3, fill: "#FF9933" }} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-ink-500 mt-2">Model improves with each corrected record — continuous learning pipeline.</p>
        </div>
      </div>

      {/* District table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-parchment-100 text-ink-700 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2.5">District</th>
              <th className="text-right px-4 py-2.5">Total records</th>
              <th className="text-right px-4 py-2.5">Approved</th>
              <th className="text-right px-4 py-2.5">Pending</th>
              <th className="text-right px-4 py-2.5">Avg. confidence</th>
              <th className="px-4 py-2.5 w-40">Progress</th>
            </tr>
          </thead>
          <tbody>
            {dashboardStats.district_progress.map((d) => (
              <tr key={d.district_name} className="ledger-row">
                <td className="px-4 py-2.5 font-medium">{d.district_name}</td>
                <td className="px-4 py-2.5 text-right font-mono">{d.total_records.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right text-moss-600 font-mono">{d.approved_count.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right text-amber-600 font-mono">{d.pending_review_count.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right font-mono">{d.avg_confidence}%</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-parchment-200">
                      <div
                        className="h-2 rounded-full bg-moss-500 transition-all duration-500"
                        style={{ width: `${d.digitization_pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-ink-600 font-mono w-10 text-right">{d.digitization_pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ label, value, tone, icon }) {
  const toneClass = { moss: "text-moss-600", amber: "text-amber-600", seal: "text-seal-600" }[tone] || "text-ink-950";
  return (
    <div className="card-metric">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] text-ink-600">{label}</p>
        <span className="text-sm">{icon}</span>
      </div>
      <p className={`font-display text-xl ${toneClass}`}>{value}</p>
    </div>
  );
}
