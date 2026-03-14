import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Heart,
  MessageCircle,
  Eye,
  MessageSquareHeart,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../api/axios";
import type { Testimony } from "../../types";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Input, Textarea } from "../../components/ui/Input";
import FileUpload from "../../components/ui/FileUpload";
import Pagination from "../../components/ui/Pagination";
import toast from "react-hot-toast";

export default function TestimoniesPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimony | null>(null);
  const [viewTarget, setViewTarget] = useState<Testimony | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimony | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [verse, setVerse] = useState("");
  const [postedBy, setPostedBy] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  async function fetchTestimonies(p = 1) {
    setLoading(true);
    try {
      const res = await api.get(`/api/testimonies?page=${p}&limit=10`);
      const body = res.data;
      console.log("Fetched testimonies:", body);
      // backend returns { success, data: [...], pagination: {...} }
      setTestimonies(body.data ?? []);
      if (body.pagination) {
        setPages(body.pagination.pages ?? 1);
        setTotal(body.pagination.total ?? 0);
      }
    } catch {
      toast.error("Failed to load testimonies");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTestimonies(page);
  }, [page]);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setTextContent("");
    setVerse("");
    setPostedBy("");
    setYoutubeId("");
    setImageFiles([]);
    setModalOpen(true);
  }

  function openEdit(t: Testimony) {
    setEditing(t);
    setTitle(t.title);
    setTextContent(t.text_content);
    setVerse(t.verse ?? "");
    setPostedBy(t.posted_by);
    setYoutubeId(t.youtube_video_id ?? "");
    setImageFiles([]);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!title || !textContent || !postedBy)
      return toast.error("Title, content, and posted_by are required");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("text_content", textContent);
      fd.append("posted_by", postedBy);
      if (verse) fd.append("verse", verse);
      if (youtubeId) fd.append("youtube_video_id", youtubeId);
      imageFiles.forEach((f) => fd.append("images", f));

      if (editing) {
        await api.put(`/api/testimonies/${editing.id}`, fd);
        toast.success("Testimony updated");
      } else {
        await api.post("/api/testimonies", fd);
        toast.success("Testimony created");
      }
      setModalOpen(false);
      fetchTestimonies(page);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/testimonies/${deleteTarget.id}`);
      toast.success("Testimony deleted");
      setDeleteTarget(null);
      fetchTestimonies(page);
    } catch {
      toast.error("Failed to delete testimony");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Testimonies"
        subtitle="Review and manage community testimonies"
        icon={MessageSquareHeart}
        color="bg-pink-500"
        count={total}
        action={
          <Button
            onClick={openCreate}
            variant="light"
            className="w-full justify-center sm:w-auto"
          >
            <Plus size={16} />
            New Testimony
          </Button>
        }
      />

      <Table
        keyExtractor={(t) => String(t.id)}
        loading={loading}
        data={testimonies}
        emptyMessage="No testimonies yet"
        columns={[
          {
            header: "Title",
            cell: (t) => <span className="font-medium">{t.title}</span>,
          },
          { header: "Posted by", cell: (t) => t.posted_by },
          {
            header: "Stats",
            cell: (t) => (
              <div className="flex items-center gap-3 text-gray-500 text-xs">
                <span className="flex items-center gap-1">
                  <Heart size={12} />
                  {t.like_count ?? t.likes?.length ?? 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={12} />
                  {t.comment_count ?? t.comments?.length ?? 0}
                </span>
              </div>
            ),
          },
          {
            header: "Images",
            cell: (t) =>
              t.images?.length > 0 ? (
                <span className="text-xs text-gray-500">
                  {t.images.length} image(s)
                </span>
              ) : (
                <span className="text-xs text-gray-400">None</span>
              ),
          },
          {
            header: "Date",
            cell: (t) => new Date(t.createdAt).toLocaleDateString(),
          },
          {
            header: "Actions",
            cell: (t) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewTarget(t)}
                >
                  <Eye size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(t)}
                >
                  <Trash2 size={14} className="text-red-500" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Pagination page={page} pages={pages} total={total} onChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Testimony" : "New Testimony"}
        size="xl"
      >
        <div className="space-y-4">
          <Input
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Posted By *"
            value={postedBy}
            onChange={(e) => setPostedBy(e.target.value)}
            placeholder="Name of the person"
          />
          <Textarea
            label="Content *"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />
          <Input
            label="Bible Verse (optional)"
            value={verse}
            onChange={(e) => setVerse(e.target.value)}
            placeholder="e.g. John 3:16"
          />
          <Input
            label="YouTube Video ID (optional)"
            value={youtubeId}
            onChange={(e) => setYoutubeId(e.target.value)}
            placeholder="e.g. dQw4w9WgXcQ"
          />
          <FileUpload
            label="Images (up to 10)"
            accept="image/*"
            multiple
            onChange={() => {}}
            onMultipleChange={setImageFiles}
            current={
              imageFiles.length > 0
                ? `${imageFiles.length} file(s) selected`
                : undefined
            }
          />
        </div>
        <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            variant="secondary"
            onClick={() => setModalOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={viewTarget?.title ?? ""}
        size="xl"
      >
        {viewTarget && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Posted by: <strong>{viewTarget.posted_by}</strong>
              </p>
              {viewTarget.verse && (
                <p className="text-sm italic text-indigo-600">
                  "{viewTarget.verse}"
                </p>
              )}
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {viewTarget.text_content}
            </p>
            {viewTarget.images?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {viewTarget.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
            {viewTarget.youtube_video_id && (
              <a
                href={`https://youtube.com/watch?v=${viewTarget.youtube_video_id}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 underline"
              >
                Watch on YouTube
              </a>
            )}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Comments ({viewTarget.comments?.length ?? 0})
              </p>
              {viewTarget.comments?.length === 0 && (
                <p className="text-sm text-gray-400">No comments</p>
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {viewTarget.comments?.map((c, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <p className="font-medium text-gray-800">{c.posted_by}</p>
                    <p className="text-gray-600 mt-0.5">{c.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`Delete testimony "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
