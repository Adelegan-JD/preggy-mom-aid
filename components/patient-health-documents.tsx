"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";
import { useConfirmations } from "@/contexts/confirmations-provider";
import { ComboBox } from "@/components/combo-box";

type DocumentRow = {
  id: string;
  object_path: string;
  display_name: string;
  mime_type: string;
  file_size_bytes: number;
  document_category: string;
  notes: string | null;
  created_at: string;
};

const maxBytes = 10 * 1024 * 1024;
const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PatientHealthDocuments({ initialDocuments }: { initialDocuments: DocumentRow[] }) {
  const { t, language } = useLanguage();
 const { openConfirmModal } = useConfirmations();
  const [documents, setDocuments] = useState(initialDocuments);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("other");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setError("");
    setMessage("");
  }

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) { setError(t("chooseDocumentError")); return; }
    if (!allowedTypes.includes(file.type)) { setError(t("fileTypeError")); return; }
    if (file.size < 1 || file.size > maxBytes) { setError(t("fileSizeError")); return; }
    setBusy(true);
    setError("");
    setMessage("");
    const supabase = createClient();
    let uploadedPath = "";
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t("documentSessionError"));
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-140) || "health-record";
      uploadedPath = `${user.id}/${crypto.randomUUID()}-${safeFileName}`;
      const { error: uploadError } = await supabase.storage.from("patient-health-records").upload(uploadedPath, file, {
        contentType: file.type,
        upsert: false
      });
      if (uploadError) throw uploadError;
      const { data, error: insertError } = await supabase.from("patient_health_documents").insert({
        user_id: user.id,
        object_path: uploadedPath,
        display_name: file.name.slice(0, 180),
        mime_type: file.type,
        file_size_bytes: file.size,
        document_category: category,
        notes: notes.trim() || null
      }).select("id,object_path,display_name,mime_type,file_size_bytes,document_category,notes,created_at").single();
      if (insertError) {
        await supabase.storage.from("patient-health-records").remove([uploadedPath]);
        uploadedPath = "";
        throw insertError;
      }
      setDocuments(current => [data, ...current]);
      setFile(null);
      setNotes("");
      setCategory("other");
      const input = document.getElementById("patientDocumentFile") as HTMLInputElement | null;
      if (input) input.value = "";
      setMessage(t("documentUploaded"));
    } catch (cause) {
      if (uploadedPath) {
        await supabase.storage.from("patient-health-records").remove([uploadedPath]);
      }
      setError(cause instanceof Error ? cause.message : t("documentUploadError"));
    } finally {
      setBusy(false);
    }
  }

  async function openDocument(item: DocumentRow) {
    setError("");
    const supabase = createClient();
    const { data, error: signedError } = await supabase.storage.from("patient-health-records").createSignedUrl(item.object_path, 60);
    if (signedError || !data?.signedUrl) { setError(t("documentOpenError")); return; }
    window.location.assign(data.signedUrl);
  }

  function deleteDocument(item: DocumentRow) {
    openConfirmModal(<>The file <b>{item.display_name}</b> will be permanently removed and cannot be recovered.</>, () => performDeleteDocument(item), { title: "Delete this document?", confirmText: t("delete"), isDelete: true });
  }

  async function performDeleteDocument(item: DocumentRow) {
    setError("");
    setMessage("");
    const supabase = createClient();
    const { error: storageError } = await supabase.storage.from("patient-health-records").remove([item.object_path]);
    if (storageError) { setError(t("documentDeleteError")); return; }
    const { error: rowError } = await supabase.from("patient_health_documents").delete().eq("id", item.id);
    if (rowError) { setError(t("documentRowDeleteError")); return; }
    setDocuments(current => current.filter(document => document.id !== item.id));
    setMessage(t("documentDeleted"));
  }

  const categoryLabel = (value: string) => {
    const keys: Record<string, Parameters<typeof t>[0]> = { antenatal_record: "antenatalRecord", scan_result: "scanResult", laboratory_result: "laboratoryResult", prescription: "prescription", discharge_summary: "dischargeSummary", other: "other" };
    return keys[value] ? t(keys[value]) : value.replaceAll("_", " ");
  };
  const locale = language === "yo" ? "yo-NG" : language === "ha" ? "ha-NG" : language === "ig" ? "ig-NG" : "en-NG";

  return (
    <div className="ds-split">
      <form className="ds-panel ds-form ds-sticky" onSubmit={uploadDocument} aria-labelledby="document-form-title">
        <div className="ds-stack" style={{ gap: "var(--ds-2)" }}>
          <h2 className="ds-h2" id="document-form-title">{t("addHealthDocument")}</h2>
          <p className="ds-muted ds-small">{t("documentIntro")}</p>
        </div>
        <div className="ds-field">
          <label className="ds-label" htmlFor="patientDocumentFile">{t("chooseFile")}</label>
          <input className="ds-input" id="patientDocumentFile" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={chooseFile} aria-describedby="documentFileHint" />
          <p className="ds-hint" id="documentFileHint">{t("fileLimit")}</p>
        </div>
        <div className="ds-field">
          <label className="ds-label" htmlFor="documentCategory">{t("documentType")}</label>
          <ComboBox id="documentCategory" value={category} onValueChange={setCategory} options={[{ value: "antenatal_record", label: t("antenatalRecord") }, { value: "scan_result", label: t("scanResult") }, { value: "laboratory_result", label: t("laboratoryResult") }, { value: "prescription", label: t("prescription") }, { value: "discharge_summary", label: t("dischargeSummary") }, { value: "other", label: t("other") }]} />
        </div>
        <div className="ds-field">
          <label className="ds-label" htmlFor="documentNotes">{t("notes")} <span className="ds-optional">{t("optional")}</span></label>
          <textarea className="ds-input" id="documentNotes" rows={3} maxLength={500} value={notes} onChange={event => setNotes(event.target.value)} placeholder={t("documentNotePlaceholder")} />
        </div>
        <div className="ds-form-actions"><button className="ds-btn ds-btn-primary" disabled={busy || !file}>{busy ? t("uploading") : t("uploadDocument")}</button></div>
        {error && <p className="ds-message ds-message-error" role="alert">{error}</p>}
        {message && <p className="ds-message ds-message-success" role="status">{message}</p>}
      </form>
      <section className="ds-panel" aria-labelledby="documents-title">
        <div className="ds-panel-header"><h2 className="ds-h2" id="documents-title">{t("healthRecords")}</h2>{documents.length > 0 && <span className="ds-badge">{documents.length}</span>}</div>
        {documents.length ? <ul className="ds-list">{documents.map(item => <li className="ds-list-item" key={item.id}>
          <div className="ds-list-main">
            <span className="ds-list-title">{item.display_name}</span>
            <span className="ds-list-meta">{categoryLabel(item.document_category)} · {formatSize(item.file_size_bytes)} · {new Date(item.created_at).toLocaleDateString(locale, { dateStyle: "medium" })}</span>
            {item.notes && <span className="ds-list-meta">{item.notes}</span>}
          </div>
          <div className="ds-list-actions"><button type="button" className="ds-btn ds-btn-sm" onClick={() => openDocument(item)}>{t("openFile")}</button><button type="button" className="ds-btn ds-btn-sm ds-btn-danger" onClick={() => deleteDocument(item)}>{t("delete")}</button></div>
        </li>)}</ul> : <div className="ds-empty"><b>{t("noDocuments")}</b></div>}
      </section>
    </div>
  );
}
