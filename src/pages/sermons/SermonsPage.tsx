import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Mic2 } from "lucide-react";
import api from "../../api/axios";
import type { Sermon, Category } from "../../types";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Input, Select } from "../../components/ui/Input";
import FileUpload from "../../components/ui/FileUpload";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";
import toast from "react-hot-toast";

function categoryName(c: Category | string) {
  return typeof c === "string" ? c : c.name;
}

export default function SermonsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sermon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sermon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [pastorName, setPastorName] = useState("");
  const [date, setDate] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    api.get("/api/sermons/categories").then((r) => {
      const cats = r.data?.data ?? r.data ?? [];
      setCategories(cats);
      if (cats.length > 0) setSelectedCategory(cats[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    fetchSermons(selectedCategory);
  }, [selectedCategory]);

  async function fetchSermons(catId: string) {
    setLoading(true);
    try {
      console.log("Fetching sermons for category:", catId);
      const res = await api.get(`/api/sermons?categoryId=${catId}`);
      console.log("Fetched sermons:", res.data);
      setSermons(res.data?.data ?? res.data ?? []);
    } catch {
      toast.error("Failed to load sermons");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setTitle("");
    setPastorName("");
    setDate("");
    setCategoryInput(categories[0]?.name ?? "");
    setIsPremium(false);
    setCoverFile(null);
    setAudioFile(null);
    setModalOpen(true);
  }

  function openEdit(s: Sermon) {
    setEditing(s);
    setTitle(s.title);
    setPastorName(s.pastor_name);
    setDate(s.date.slice(0, 10));
    setCategoryInput(categoryName(s.category));
    setIsPremium(s.is_premium);
    setCoverFile(null);
    setAudioFile(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!title || !pastorName || !date || !categoryInput)
      return toast.error("Fill all required fields");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("pastor_name", pastorName);
      fd.append("date", date);
      fd.append("category", categoryInput);
      fd.append("is_premium", String(isPremium));
      if (coverFile) fd.append("cover_image", coverFile);
      if (audioFile) fd.append("audio_file", audioFile);

      if (editing) {
        await api.put(`/api/sermons/update/${editing.slug}`, fd);
        toast.success("Sermon updated");
      } else {
        if (!coverFile) return toast.error("Cover image is required");
        await api.post("/api/sermons/create", fd);
        toast.success("Sermon created");
      }
      setModalOpen(false);
      if (selectedCategory) fetchSermons(selectedCategory);
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
      await api.delete(`/api/sermons/delete/${deleteTarget.slug}`);
      toast.success("Sermon deleted");
      setDeleteTarget(null);
      if (selectedCategory) fetchSermons(selectedCategory);
    } catch {
      toast.error("Failed to delete sermon");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Sermons"
        subtitle="Manage and publish sermon content"
        icon={Mic2}
        color="bg-indigo-600"
        count={sermons.length}
        action={
          <Button
            onClick={openCreate}
            variant="light"
            className="w-full justify-center sm:w-auto"
          >
            <Plus size={16} />
            New Sermon
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="text-sm font-medium text-gray-700">Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto"
        >
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Table
        keyExtractor={(s) => s._id}
        loading={loading}
        data={sermons}
        emptyMessage="No sermons in this category"
        columns={[
          {
            header: "Cover",
            cell: (s) =>
              s.cover_image ? (
                <img
                  src={s.cover_image}
                  alt={s.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-lg" />
              ),
          },
          {
            header: "Title",
            cell: (s) => <span className="font-medium">{s.title}</span>,
          },
          { header: "Pastor", cell: (s) => s.pastor_name },
          {
            header: "Date",
            cell: (s) => new Date(s.date).toLocaleDateString(),
          },
          {
            header: "Premium",
            cell: (s) =>
              s.is_premium ? (
                <Badge variant="purple">Premium</Badge>
              ) : (
                <Badge variant="gray">Free</Badge>
              ),
          },
          {
            header: "Audio",
            cell: (s) =>
              s.audio_file ? (
                <Badge variant="green">Yes</Badge>
              ) : (
                <Badge variant="gray">No</Badge>
              ),
          },
          {
            header: "Actions",
            cell: (s) => (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(s)}
                >
                  <Trash2 size={14} className="text-red-500" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Sermon" : "New Sermon"}
        size="xl"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="md:col-span-2"
          />
          <Input
            label="Pastor Name *"
            value={pastorName}
            onChange={(e) => setPastorName(e.target.value)}
          />
          <Input
            label="Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Select
            label="Category *"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
          <div className="flex items-center gap-3 self-end pb-1">
            <input
              id="premium"
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
            <label
              htmlFor="premium"
              className="text-sm font-medium text-gray-700"
            >
              Premium content
            </label>
          </div>
          <div className="md:col-span-2">
            <FileUpload
              label={
                editing
                  ? "Cover Image (leave empty to keep current)"
                  : "Cover Image *"
              }
              accept="image/*"
              onChange={setCoverFile}
              current={coverFile?.name}
            />
          </div>
          <div className="md:col-span-2">
            <FileUpload
              label="Audio File (optional)"
              accept="audio/*"
              onChange={setAudioFile}
              current={audioFile?.name}
            />
          </div>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`Delete sermon "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
