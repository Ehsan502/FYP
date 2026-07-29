import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Download } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { API_ORIGIN } from "../config.js";
import EmptyState from "../components/EmptyState.jsx";
import { SkeletonRow } from "../components/Skeleton.jsx";

const Certificates = () => {
  const [eligible, setEligible] = useState([]);
  const [issued, setIssued] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuingId, setIssuingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [eligibleRes, issuedRes] = await Promise.all([
        api.get("/certificates/eligible"),
        api.get("/certificates/mine"),
      ]);
      setEligible(eligibleRes.data);
      setIssued(issuedRes.data);
    } catch (err) {
      toast.error("Could not load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const issue = async (swapId) => {
    setIssuingId(swapId);
    try {
      await api.post("/certificates", { swapRequestId: swapId });
      toast.success("Certificate generated!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not generate certificate");
    } finally {
      setIssuingId(null);
    }
  };

  const download = async (cert) => {
    try {
      const token = localStorage.getItem("skillswap_token");
      const res = await fetch(`${API_ORIGIN}/api/certificates/${cert._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SkillSwap-Certificate-${cert.certificateNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Could not download certificate");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Award size={26} />
        </div>
        <h1 className="font-display text-3xl font-bold">Certificates</h1>
        <p className="mt-1 text-muted-light dark:text-muted-dark">Proof of the skills you've exchanged.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : (
        <>
          {eligible.length > 0 && (
            <div className="mb-10">
              <h2 className="mb-4 font-display text-lg font-semibold">Ready to Generate</h2>
              <div className="flex flex-col gap-3">
                {eligible.map((e) => (
                  <motion.div key={e.swapId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card flex items-center justify-between p-5">
                    <div>
                      <p className="font-medium">{e.skillTitle}</p>
                      <p className="text-sm text-muted-light dark:text-muted-dark">with {e.partnerName}</p>
                    </div>
                    <button onClick={() => issue(e.swapId)} disabled={issuingId === e.swapId} className="btn-primary !px-4 !py-2 text-sm">
                      {issuingId === e.swapId ? "Generating..." : "Generate Certificate"}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <h2 className="mb-4 font-display text-lg font-semibold">Your Certificates</h2>
          {issued.length === 0 ? (
            <EmptyState icon={Award} title="No certificates yet" description="Complete a swap and generate your first certificate above." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {issued.map((cert) => (
                <motion.div key={cert._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card relative overflow-hidden p-6">
                  <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-accent/10" />
                  <Award size={22} className="text-accent" />
                  <h3 className="mt-3 font-display font-semibold">{cert.skillTitle}</h3>
                  <p className="text-sm text-muted-light dark:text-muted-dark">with {cert.partnerName}</p>
                  <p className="mt-2 text-xs font-mono text-muted-light dark:text-muted-dark">{cert.certificateNumber}</p>
                  <p className="text-xs text-muted-light dark:text-muted-dark">{format(new Date(cert.issuedAt), "MMM d, yyyy")}</p>
                  <button onClick={() => download(cert)} className="btn-secondary mt-4 w-full !py-2 text-sm">
                    <Download size={15} /> Download PDF
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Certificates;
