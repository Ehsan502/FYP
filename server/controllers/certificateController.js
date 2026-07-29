import PDFDocument from "pdfkit";
import SwapRequest from "../models/SwapRequest.js";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";

const generateCertNumber = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SS-${Date.now().toString(36).toUpperCase()}-${rand}`;
};

export const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(certificates);
  } catch (error) {
    next(error);
  }
};

export const getEligibleSwaps = async (req, res, next) => {
  try {
    const swaps = await SwapRequest.find({
      status: "completed",
      $or: [{ requester: req.user._id }, { receiver: req.user._id }],
    })
      .populate("requester", "name")
      .populate("receiver", "name")
      .populate("skillRequested", "title");

    const existing = await Certificate.find({ user: req.user._id }).select("swapRequest");
    const issuedSet = new Set(existing.map((c) => c.swapRequest.toString()));

    const eligible = swaps
      .filter((s) => !issuedSet.has(s._id.toString()))
      .map((s) => ({
        swapId: s._id,
        skillTitle: s.skillRequested?.title || "Skill Exchange",
        partnerName:
          s.requester._id.toString() === req.user._id.toString() ? s.receiver.name : s.requester.name,
      }));

    res.json(eligible);
  } catch (error) {
    next(error);
  }
};

export const issueCertificate = async (req, res, next) => {
  try {
    const { swapRequestId } = req.body;
    const swap = await SwapRequest.findById(swapRequestId)
      .populate("requester", "name")
      .populate("receiver", "name")
      .populate("skillRequested", "title");

    if (!swap) return res.status(404).json({ message: "Swap request not found" });
    if (swap.status !== "completed") {
      return res.status(400).json({ message: "Swap must be completed to issue a certificate" });
    }

    const isRequester = swap.requester._id.toString() === req.user._id.toString();
    const isReceiver = swap.receiver._id.toString() === req.user._id.toString();
    if (!isRequester && !isReceiver) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const existing = await Certificate.findOne({ swapRequest: swap._id, user: req.user._id });
    if (existing) return res.json(existing);

    const partnerName = isRequester ? swap.receiver.name : swap.requester.name;

    const certificate = await Certificate.create({
      swapRequest: swap._id,
      user: req.user._id,
      skillTitle: swap.skillRequested?.title || "Skill Exchange",
      partnerName,
      certificateNumber: generateCertNumber(),
    });

    res.status(201).json(certificate);
  } catch (error) {
    next(error);
  }
};

export const downloadCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ message: "Certificate not found" });
    if (certificate.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.user._id);

    const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 0 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="SkillSwap-Certificate-${certificate.certificateNumber}.pdf"`);
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc.rect(0, 0, pageWidth, pageHeight).fill("#0B0E14");
    doc.rect(24, 24, pageWidth - 48, pageHeight - 48).lineWidth(2).stroke("#00C2A8");
    doc.rect(34, 34, pageWidth - 68, pageHeight - 68).lineWidth(0.5).stroke("#FFB020");

    doc
      .fillColor("#00C2A8")
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("SKILLSWAP", 0, 70, { align: "center" });

    doc
      .fillColor("#E7E9EE")
      .font("Helvetica-Bold")
      .fontSize(36)
      .text("Certificate of Completion", 0, 110, { align: "center" });

    doc
      .fillColor("#9AA1B1")
      .font("Helvetica")
      .fontSize(13)
      .text("This certificate is proudly presented to", 0, 175, { align: "center" });

    doc
      .fillColor("#FFB020")
      .font("Helvetica-Bold")
      .fontSize(30)
      .text(user.name, 0, 200, { align: "center" });

    doc
      .fillColor("#9AA1B1")
      .font("Helvetica")
      .fontSize(13)
      .text(
        `for successfully completing a skill exchange in "${certificate.skillTitle}"`,
        100,
        250,
        { align: "center", width: pageWidth - 200 }
      );

    doc
      .fillColor("#9AA1B1")
      .fontSize(13)
      .text(`in partnership with ${certificate.partnerName}`, 0, 275, { align: "center" });

    const issueDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc
      .fillColor("#6B7280")
      .fontSize(11)
      .text(`Issued on ${issueDate}`, 0, 330, { align: "center" });

    doc
      .fillColor("#6B7280")
      .fontSize(10)
      .font("Helvetica")
      .text(`Certificate No: ${certificate.certificateNumber}`, 0, pageHeight - 90, { align: "center" });

    doc.end();
  } catch (error) {
    next(error);
  }
};
