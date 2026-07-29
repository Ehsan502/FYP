import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

const AICompatibilityCard = ({ targetUserId, token }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompatibility = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "/api/ai/compatibility",
        { targetUserId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to calculate AI match score"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetUserId) {
      fetchCompatibility();
    }
  }, [targetUserId]);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 animate-pulse flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
        <span className="text-sm text-slate-400">
          AI is analyzing compatibility...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchCompatibility}
          className="p-1 hover:bg-rose-900/40 rounded transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { compatibilityScore, directMatches, reverseMatches, aiSummary } = data;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-indigo-400 border-indigo-500/30 bg-indigo-500/10";
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">
            AI Compatibility Match
          </h4>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(
            compatibilityScore
          )}`}
        >
          {compatibilityScore}% Match
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{aiSummary}</p>

      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        {directMatches?.length > 0 && (
          <div className="flex items-start gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              <strong>They can teach you:</strong> {directMatches.join(", ")}
            </span>
          </div>
        )}

        {reverseMatches?.length > 0 && (
          <div className="flex items-start gap-2 text-xs text-indigo-300">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              <strong>You can teach them:</strong> {reverseMatches.join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICompatibilityCard;