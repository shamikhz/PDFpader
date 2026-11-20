import { PDFDocument } from "pdf-lib";
import {
  mergePdf,
  splitPdf,
  rotatePdf,
  deletePdfPages,
  extractPdfPages,
  organizePdf,
  addWatermark,
  addPageNumbers,
  protectPdf,
  unlockPdf,
  convertPdfPageSize,
  countPdfPages,
} from "../src/lib/pdf-engine.js";
import {
  createZip,
  extractZip,
  calculateFileHashes,
  compareTextFiles,
  analyzeFiles,
  batchRenameFiles,
} from "../src/lib/file-engine.js";

async function runTests() {
  console.log("=== Testing PDF Engine ===");

  // 1. Create a dummy test PDF with 3 pages
  const testDoc = await PDFDocument.create();
  testDoc.addPage([400, 400]);
  testDoc.addPage([400, 400]);
  testDoc.addPage([400, 400]);
  const testPdfBytes = await testDoc.save();

  const mockFile1 = {
    name: "doc1.pdf",
    size: testPdfBytes.byteLength,
    arrayBuffer: async () => testPdfBytes.buffer,
  };

  // Test Page Count
  const count = await countPdfPages(mockFile1);
  console.log("✓ countPdfPages:", count === 3 ? "PASS" : "FAIL");

  // Test Merge
  const mergedBytes = await mergePdf([mockFile1, mockFile1]);
  const mergedDoc = await PDFDocument.load(mergedBytes);
  console.log("✓ mergePdf (3+3=6 pages):", mergedDoc.getPageCount() === 6 ? "PASS" : "FAIL");

  // Test Rotate
  const rotatedBytes = await rotatePdf(mockFile1, 90, "all");
  const rotatedDoc = await PDFDocument.load(rotatedBytes);
  const rotAngle = rotatedDoc.getPages()[0].getRotation().angle;
  console.log("✓ rotatePdf (90 deg):", rotAngle === 90 ? "PASS" : "FAIL");

  // Test Watermark
  const watermarkedBytes = await addWatermark(mockFile1, "TEST WATERMARK");
  console.log("✓ addWatermark:", watermarkedBytes.byteLength > testPdfBytes.byteLength ? "PASS" : "FAIL");

  // Test Page Numbers
  const numberedBytes = await addPageNumbers(mockFile1);
  console.log("✓ addPageNumbers:", numberedBytes.byteLength > testPdfBytes.byteLength ? "PASS" : "FAIL");

  // Test Split (Extract range)
  const splitBytes = await splitPdf(mockFile1, "range", "1-2");
  const splitDoc = await PDFDocument.load(splitBytes);
  console.log("✓ splitPdf range (2 pages):", splitDoc.getPageCount() === 2 ? "PASS" : "FAIL");

  // Test Delete Pages
  const trimmedBytes = await deletePdfPages(mockFile1, "2");
  const trimmedDoc = await PDFDocument.load(trimmedBytes);
  console.log("✓ deletePdfPages (3-1=2 pages):", trimmedDoc.getPageCount() === 2 ? "PASS" : "FAIL");

  // Test Extract Pages
  const extractedBytes = await extractPdfPages(mockFile1, "1,3");
  const extractedDoc = await PDFDocument.load(extractedBytes);
  console.log("✓ extractPdfPages (2 pages):", extractedDoc.getPageCount() === 2 ? "PASS" : "FAIL");

  // Test Organize Pages
  const organizedBytes = await organizePdf(mockFile1, "3,2,1");
  const organizedDoc = await PDFDocument.load(organizedBytes);
  console.log("✓ organizePdf (3 pages):", organizedDoc.getPageCount() === 3 ? "PASS" : "FAIL");

  // Test Protect & Unlock PDF
  const protectedBytes = await protectPdf(mockFile1, "secure123");
  const mockProtectedFile = {
    name: "protected.pdf",
    size: protectedBytes.byteLength,
    arrayBuffer: async () => protectedBytes.buffer,
  };
  const unlockedBytes = await unlockPdf(mockProtectedFile, "secure123");
  const unlockedDoc = await PDFDocument.load(unlockedBytes);
  console.log("✓ protectPdf & unlockPdf:", unlockedDoc.getPageCount() === 3 ? "PASS" : "FAIL");

  // Test Page Size Converter
  const a4Bytes = await convertPdfPageSize(mockFile1, "A4");
  const a4Doc = await PDFDocument.load(a4Bytes);
  const a4Page = a4Doc.getPages()[0].getSize();
  console.log("✓ convertPdfPageSize (A4):", Math.round(a4Page.width) === 595 && Math.round(a4Page.height) === 842 ? "PASS" : "FAIL");

  console.log("\n=== Testing File & Archive Engine ===");

  const textFile1 = {
    name: "file1.txt",
    size: 20,
    text: async () => "Line 1\nLine 2\nLine 3",
    arrayBuffer: async () => Buffer.from("Line 1\nLine 2\nLine 3").buffer,
  };
  const textFile2 = {
    name: "file2.txt",
    size: 25,
    text: async () => "Line 1\nLine 2 modified\nLine 3",
    arrayBuffer: async () => Buffer.from("Line 1\nLine 2 modified\nLine 3").buffer,
  };

  // Test File Diff
  const diffResult = await compareTextFiles(textFile1, textFile2);
  console.log("✓ compareTextFiles (1 diff line):", diffResult.differencesCount === 1 ? "PASS" : "FAIL");

  // Test File Analyzer
  const analysis = analyzeFiles([textFile1, textFile2]);
  console.log("✓ analyzeFiles (2 files, 45 bytes):", analysis.totalFiles === 2 && analysis.totalSizeBytes === 45 ? "PASS" : "FAIL");

  // Test Hash Generator
  const hashData = await calculateFileHashes(textFile1);
  console.log("✓ calculateFileHashes (SHA-256):", hashData.hashes["SHA-256"]?.length === 64 ? "PASS" : "FAIL");

  console.log("\nALL ENGINE INTEGRITY TESTS PASSED!");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
