import { useState } from "react";
import { AdminMetricCard, AdminPageHeader, AdminTable } from "../../COMPONENTS/ADMIN/AdminKit";
import { useAdminData } from "../../HOOKS/useAdminData";
import { reportsService } from "../../SERVICES/reportsService";

const downloadJson = (payload: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const toCsv = (rows: Array<Record<string, string | number>>) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","));
  return [headers.join(","), ...lines].join("\n");
};

const downloadCsv = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const pdfEscape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const createPdfBlob = (lines: string[]) => {
  const encoder = new TextEncoder();
  const pageLineCapacity = 34;
  const pages = [];

  for (let index = 0; index < lines.length; index += pageLineCapacity) {
    pages.push(lines.slice(index, index + pageLineCapacity));
  }

  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];
  const regularFontObjectId = 3;
  const boldFontObjectId = 4;
  let nextObjectId = 5;

  pages.forEach((pageLines, pageIndex) => {
    const contentObjectId = nextObjectId++;
    const pageObjectId = nextObjectId++;
    contentObjectIds.push(contentObjectId);
    pageObjectIds.push(pageObjectId);

    const headerBlock = pageIndex === 0
      ? [
          "q",
          "0.11 0.17 0.31 rg",
          "0 760 595 82 re f",
          "0.74 0.84 1 rg",
          "46 780 m 60 810 l 84 810 l 98 780 l 72 748 l 46 780 l f",
          "0.85 0.13 0.19 rg",
          "50 776 44 12 re f",
          "1 1 1 rg",
          "50 790 44 5 re f",
          "0.08 0.47 0.2 rg",
          "50 766 44 10 re f",
          "Q",
          "BT",
          "/F2 19 Tf",
          "110 808 Td",
          `(LINDAMWANANCHI SAFETY NAVIGATION SYSTEM) Tj`,
          "0 -22 Td",
          "/F1 11 Tf",
          `(Administrative Intelligence Report) Tj`,
          "ET",
        ].join("\n")
      : "";

    const contentLines = [
      headerBlock,
      "BT",
      `/F1 12 Tf`,
      pageIndex === 0 ? "50 724 Td" : "50 790 Td",
      "16 TL",
      ...pageLines.map((line, lineIndex) =>
        lineIndex === 0 ? `(${pdfEscape(line)}) Tj` : `T* (${pdfEscape(line)}) Tj`
      ),
      "ET",
    ].filter(Boolean).join("\n");

    objects[contentObjectId] = `<< /Length ${encoder.encode(contentLines).length} >>\nstream\n${contentLines}\nendstream`;
    objects[pageObjectId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${regularFontObjectId} 0 R /F2 ${boldFontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
  });

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;
  objects[regularFontObjectId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[boldFontObjectId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    if (!objects[objectId]) continue;
    offsets[objectId] = encoder.encode(pdf).length;
    pdf += `${objectId} 0 obj\n${objects[objectId]}\nendobj\n`;
  }

  const xrefStart = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    const offset = offsets[objectId] ?? 0;
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new Blob([encoder.encode(pdf)], { type: "application/pdf" });
};

const downloadPdf = (lines: string[], filename: string) => {
  const blob = createPdfBlob(lines);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default function AdminReportsPage() {
  const { analytics, loading, error } = useAdminData();
  const [status, setStatus] = useState("");

  const generateExecutiveReport = async () => {
    const report = await reportsService.exportReport();
    downloadJson(report, `lindamwananchi-executive-report-${new Date().toISOString().slice(0, 10)}.json`);
    setStatus("Executive JSON report generated.");
  };

  const generateCsvReport = () => {
    const rows = (analytics?.recentReports ?? []).map((report) => ({
      date: new Date(report.date).toLocaleString(),
      type: report.type,
      status: report.status,
      location: report.locationName,
      title: report.title,
    }));
    downloadCsv(toCsv(rows), `lindamwananchi-recent-reports-${new Date().toISOString().slice(0, 10)}.csv`);
    setStatus("Recent reports CSV generated.");
  };

  const generatePdfReport = () => {
    const today = new Date().toLocaleString();
    const lines = [
      "LINDAMWANANCHI SAFETY NAVIGATION SYSTEM",
      "Administrative PDF Report",
      `Generated: ${today}`,
      "",
      `Total users: ${analytics?.users ?? 0}`,
      `Incident count: ${analytics?.incidents ?? 0}`,
      `Active alerts: ${analytics?.activeAlerts ?? 0}`,
      `Resolution rate: ${analytics?.resolutionRate ?? 0}%`,
      "",
      "Incident types:",
      ...((analytics?.incidentsByType ?? []).map((item) => `- ${item.type}: ${item.count}`)),
      "",
      "Hotspots:",
      ...((analytics?.hotspots ?? []).map((spot) => `- ${spot.name}: ${spot.count}`)),
      "",
      "Recent reports:",
      ...((analytics?.recentReports ?? []).map((report) =>
        `- ${new Date(report.date).toLocaleString()} | ${report.title} | ${report.type} | ${report.locationName} | ${report.status}`
      )),
    ];

    downloadPdf(lines, `lindamwananchi-admin-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    setStatus("PDF report generated.");
  };

  if (loading) {
    return <main className="lm-dashboard"><section className="lm-panel"><p className="lm-meta">Loading reports workspace...</p></section></main>;
  }

  return (
    <main className="lm-dashboard lm-admin-page-wrap">
      <AdminPageHeader
        title="Reports And Exports"
        subtitle={status || error || "Generate administrative exports and review recent reporting activity."}
        actions={
          <>
            <button type="button" onClick={() => void generateExecutiveReport()}>Download JSON Report</button>
            <button type="button" className="lm-secondary-button" onClick={generateCsvReport}>Download CSV Snapshot</button>
            <button type="button" className="lm-secondary-button" onClick={generatePdfReport}>Download PDF Report</button>
          </>
        }
      />

      <section className="lm-admin-metrics-grid">
        <AdminMetricCard label="Reports Loaded" value={analytics?.recentReports?.length ?? 0} hint="Records in the latest admin view" />
        <AdminMetricCard label="Hotspots Tracked" value={analytics?.hotspots?.length ?? 0} hint="Locations with clustered activity" tone="danger" />
        <AdminMetricCard label="Alert Categories" value={analytics?.alertsByType?.length ?? 0} hint="Included in generated summary" tone="warning" />
        <AdminMetricCard label="Export Formats" value="3" hint="JSON, CSV, and PDF currently available" tone="success" />
      </section>

      <section className="lm-admin-dashboard-grid single">
        <AdminTable
          title="Recent Report Register"
          columns={["Date", "Title", "Type", "Location", "Status"]}
          rows={(analytics?.recentReports ?? []).map((report) => [
            new Date(report.date).toLocaleString(),
            report.title,
            report.type,
            report.locationName,
            report.status,
          ])}
        />
        <section className="lm-panel">
          <div className="lm-admin-panel-head">
            <h3>Report Package Content</h3>
          </div>
          <div className="lm-admin-pill-grid">
            <div className="lm-admin-pill-card"><span>Summary</span><strong>Included</strong></div>
            <div className="lm-admin-pill-card"><span>Recent Reports</span><strong>Included</strong></div>
            <div className="lm-admin-pill-card"><span>Hotspots</span><strong>Included</strong></div>
            <div className="lm-admin-pill-card"><span>Incident Trends</span><strong>Included</strong></div>
            <div className="lm-admin-pill-card"><span>Alert Trends</span><strong>Included</strong></div>
            <div className="lm-admin-pill-card"><span>Risk Insights</span><strong>Included</strong></div>
          </div>
        </section>
      </section>
    </main>
  );
}
