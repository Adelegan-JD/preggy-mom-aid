"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";

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

  async function deleteDocument(item: DocumentRow) {
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

  return (
    <div className="patient-documents-layout">
      <form className="account-card patient-profile-form" onSubmit={uploadDocument}>
        <div className="account-kicker">{t("privateFiles")}</div>
        <h2>{t("addHealthDocument")}</h2>
        <p className="account-intro">{t("documentIntro")}</p>
        <label htmlFor="patientDocumentFile">{t("chooseFile")}</label>
        <input id="patientDocumentFile" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={chooseFile} />
        <p className="account-footnote">{t("fileLimit")}</p>
        <label htmlFor="documentCategory">{t("documentType")}</label>
        <select id="documentCategory" value={category} onChange={event => setCategory(event.target.value)}>
          <option value="antenatal_record">{t("antenatalRecord")}</option>
          <option value="scan_result">{t("scanResult")}</option>
          <option value="laboratory_result">{t("laboratoryResult")}</option>
          <option value="prescription">{t("prescription")}</option>
          <option value="discharge_summary">{t("dischargeSummary")}</option>
          <option value="other">{t("other")}</option>
        </select>
        <label htmlFor="documentNotes">{t("notes")} <span>({t("optional")})</span></label>
        <textarea id="documentNotes" rows={3} maxLength={500} value={notes} onChange={event => setNotes(event.target.value)} placeholder={t("documentNotePlaceholder")} />
        <button className="account-submit" disabled={busy || !file}>{busy ? t("uploading") : t("uploadDocument")}</button>
        {error && <p className="account-error" role="alert">{error}</p>}
        {message && <p className="account-success" role="status">{message}</p>}
      </form>
      <section className="patient-recent-panel">
        <div className="account-kicker">{t("yourFiles")}</div>
        <h2>{t("healthRecords")}</h2>
        {documents.length ? <ul>{documents.map(item => <li className="patient-document-item" key={item.id}>
          <div><strong>{item.display_name}</strong><span>{item.document_category.replaceAll("_", " ")} · {formatSize(item.file_size_bytes)}</span><span>Added {new Date(item.created_at).toLocaleDateString(language === "yo" ? "yo-NG" : language === "ha" ? "ha-NG" : language === "ig" ? "ig-NG" : "en-NG")}</span>{item.notes && <span>{item.notes}</span>}</div>
          <div className="patient-document-actions"><button type="button" onClick={() => openDocument(item)}>{t("openFile")}</button><button type="button" onClick={() => deleteDocument(item)}>Delete</button></div>
        </li>)}</ul> : <p>{t("noDocuments")}</p>}
      </section>
    </div>
  );
}
