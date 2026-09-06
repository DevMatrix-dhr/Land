import { useState } from "react";
import { SEED_RECORDS } from "../mock/seedData.js";

const COUNTRIES = ["India"];
const STATES = ["Uttar Pradesh", "Maharashtra", "Andhra Pradesh", "Karnataka", "West Bengal"];
const CITIES = ["Lucknow", "Bareilly", "Jhansi", "Kanpur", "Sitapur"];
const TEHSILS = ["Sadar", "Mohanlalganj", "Malihabad", "Kakori", "Malhour"];
const AREAS = ["Sonpur", "Ratanpur", "Devgarh", "Kharkhoda", "Bilaspur", "Mahua", "Rampur", "Chandpur"];

const CONF_COLOR = (c) =>
  c >= 90 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
  : c >= 70 ? "text-amber-600 bg-amber-50 border-amber-200"
  : "text-red-600 bg-red-50 border-red-200";

export default function SearchRecords() {
  const [form, setForm] = useState({
    country: "",
    state: "",
    city: "",
    tehsil: "",
    area: "",
    house_number: "",
  });
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  const isComplete =
    form.country && form.state && form.city && form.tehsil && form.area && form.house_number;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSearched(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    // Match records by tehsil, district (city), and village (area)
    const matches = SEED_RECORDS.filter((r) => {
      const cityMatch = r.district?.toLowerCase() === form.city.toLowerCase();
      const tehsilMatch = r.tehsil?.toLowerCase() === form.tehsil.toLowerCase();
      const areaMatch = r.village?.toLowerCase() === form.area.toLowerCase();
      return cityMatch && tehsilMatch && areaMatch;
    });
    setResults(matches);
    setSearched(true);
    setSelected(null);
  }

  function handleReset() {
    setForm({ country: "", state: "", city: "", tehsil: "", area: "", house_number: "" });
    setSearched(false);
    setResults([]);
    setSelected(null);
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-parchment-50 to-parchment-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-ink-950 flex items-center justify-center shadow">
              <span className="text-xl">🔍</span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-950">Search Land Records</h1>
              <p className="text-sm text-ink-500">Enter location details to find digitized land records</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-parchment-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-ink-700 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-saffron-100 text-saffron-600 flex items-center justify-center text-xs">📍</span>
            Location Details
            <span className="ml-auto text-xs text-ink-400 font-normal">All fields are mandatory</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {/* Country */}
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1">Country <span className="text-red-500">*</span></label>
              <select name="country" value={form.country} onChange={handleChange}
                className="w-full border border-parchment-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/20">
                <option value="">Select Country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1">State / U.T. <span className="text-red-500">*</span></label>
              <select name="state" value={form.state} onChange={handleChange}
                className="w-full border border-parchment-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/20">
                <option value="">Select State</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* City / District */}
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1">City / District <span className="text-red-500">*</span></label>
              <select name="city" value={form.city} onChange={handleChange}
                className="w-full border border-parchment-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/20">
                <option value="">Select City</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Tehsil */}
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1">Tehsil <span className="text-red-500">*</span></label>
              <select name="tehsil" value={form.tehsil} onChange={handleChange}
                className="w-full border border-parchment-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/20">
                <option value="">Select Tehsil</option>
                {TEHSILS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Area / Village */}
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1">Area / Village <span className="text-red-500">*</span></label>
              <select name="area" value={form.area} onChange={handleChange}
                className="w-full border border-parchment-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/20">
                <option value="">Select Area</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* House / Khasra Number */}
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1">House / Khasra Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="house_number"
                value={form.house_number}
                onChange={handleChange}
                placeholder="e.g. 124/2"
                className="w-full border border-parchment-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink-700/20"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              type="submit"
              disabled={!isComplete}
              className="flex-1 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>🔍</span> Search Records
            </button>
            {searched && (
              <button type="button" onClick={handleReset}
                className="px-5 py-2.5 border border-parchment-300 text-ink-600 rounded-lg text-sm hover:bg-parchment-100 transition-colors">
                Reset
              </button>
            )}
          </div>
        </form>

        {/* Results */}
        {searched && (
          <div className="animate-fade-in">
            {results.length === 0 ? (
              <div className="bg-white rounded-2xl border border-parchment-200 p-12 text-center shadow-sm">
                <div className="text-5xl mb-3">📭</div>
                <h3 className="font-semibold text-ink-800 mb-1">No Records Found</h3>
                <p className="text-sm text-ink-500">No digitized land records match the provided location details.</p>
                <p className="text-xs text-ink-400 mt-2">Please verify the details and try again, or contact your local Tehsil office.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-ink-800">{results.length} record{results.length > 1 ? "s" : ""} found</h2>
                  <span className="text-xs text-ink-400">Click a record to view details</span>
                </div>

                <div className="grid gap-3">
                  {results.map((rec) => (
                    <div key={rec.record_id}
                      onClick={() => setSelected(selected?.record_id === rec.record_id ? null : rec)}
                      className={`bg-white rounded-xl border shadow-sm p-5 cursor-pointer transition-all hover:shadow-md ${
                        selected?.record_id === rec.record_id
                          ? "border-ink-700 ring-2 ring-ink-700/20"
                          : "border-parchment-200 hover:border-parchment-300"
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-ink-900">{rec.landowner_name}</span>
                            {rec.is_duplicate && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">⚠️ Duplicate</span>
                            )}
                          </div>
                          <div className="text-xs text-ink-500">
                            Khasra: <span className="font-medium text-ink-700">{rec.khasra_number}</span>
                            &nbsp;·&nbsp; Khata: <span className="font-medium text-ink-700">{rec.khata_number}</span>
                            &nbsp;·&nbsp; {rec.village}, {rec.tehsil}, {rec.district}
                          </div>
                        </div>
                        <div className={`text-sm font-bold px-3 py-1 rounded-lg border ${CONF_COLOR(rec.overall_confidence)}`}>
                          {rec.overall_confidence}%
                          <div className="text-xs font-normal text-center opacity-70">confidence</div>
                        </div>
                      </div>

                      {/* Summary chips */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 bg-parchment-100 rounded-md text-ink-600">{rec.land_classification}</span>
                        <span className="text-xs px-2 py-1 bg-parchment-100 rounded-md text-ink-600">{rec.ownership_type}</span>
                        <span className="text-xs px-2 py-1 bg-parchment-100 rounded-md text-ink-600">{rec.plot_area_value} {rec.plot_area_unit}</span>
                        <span className={`text-xs px-2 py-1 rounded-md ${
                          rec.mutation_status === "Completed" ? "bg-emerald-50 text-emerald-700"
                          : rec.mutation_status === "Pending" ? "bg-amber-50 text-amber-700"
                          : "bg-parchment-100 text-ink-600"
                        }`}>Mutation: {rec.mutation_status}</span>
                      </div>

                      {/* Expanded Detail */}
                      {selected?.record_id === rec.record_id && (
                        <div className="mt-4 pt-4 border-t border-parchment-100 animate-fade-in">
                          <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">Full Record Details</h4>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
                            <Detail label="Record ID" value={rec.record_id} />
                            <Detail label="Landowner" value={rec.landowner_name} />
                            <Detail label="Guardian / Father" value={rec.landowner_guardian_name} />
                            <Detail label="Khasra No." value={rec.khasra_number} />
                            <Detail label="Khata No." value={rec.khata_number} />
                            <Detail label="Survey No." value={rec.survey_number} />
                            <Detail label="Plot Area" value={`${rec.plot_area_value} ${rec.plot_area_unit}`} />
                            <Detail label="Land Classification" value={rec.land_classification} />
                            <Detail label="Ownership Type" value={rec.ownership_type} />
                            <Detail label="Village" value={rec.village} />
                            <Detail label="Tehsil" value={rec.tehsil} />
                            <Detail label="District" value={rec.district} />
                            <Detail label="Mutation Status" value={rec.mutation_status} />
                            {rec.registration_number && <Detail label="Registration No." value={rec.registration_number} />}
                            <Detail label="Document Language" value={rec.detected_language} />
                            <Detail label="Uploaded By" value={rec.uploaded_by} />
                          </div>
                          {rec.dilrmp_sync && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                              <span>✅</span>
                              <span>Synced to DILRMP — ID: <strong>{rec.dilrmp_sync.sync_id}</strong></span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info footer */}
        {!searched && (
          <div className="bg-white/60 rounded-xl border border-parchment-200 p-4 text-center">
            <p className="text-xs text-ink-400">
              🔒 Records are displayed as per the digitized data in the Bhoomi Setu system. 
              For disputes or corrections, contact your local Tehsil office.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink-400">{label}</p>
      <p className="text-ink-800 font-medium">{value || "—"}</p>
    </div>
  );
}
