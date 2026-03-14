import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../api/axios";
import type { Category } from "../../types";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Input, Textarea } from "../../components/ui/Input";
import FileUpload from "../../components/ui/FileUpload";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await api.get("/api/sermons/categories");
      setCategories(res.data?.data ?? res.data ?? []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setImageFile(null);
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description ?? "");
    setImageFile(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      if (description) fd.append("description", description);
      if (imageFile) fd.append("image", imageFile);
      if (editing) {
        await api.put(`/api/sermons/categories/${editing._id}`, fd);
        toast.success("Category updated");
      } else {
        if (!imageFile) return toast.error("Image is required");
        await api.post("/api/sermons/categories", fd);
        toast.success("Category created");
      }
      setModalOpen(false);
      fetchCategories();
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
      await api.delete(`/api/sermons/categories/${deleteTarget._id}`);
      toast.success("Category deleted");
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Sermon Categories"
        subtitle="Organize sermons into categories"
        icon={Star}
        color="bg-yellow-500"
        count={categories.length}
        action={
          <Button
            onClick={openCreate}
            variant="light"
            className="w-full justify-center sm:w-auto"
          >
            <Plus size={16} />
            New Category
          </Button>
        }
      />

      <Table
        keyExtractor={(c) => c._id}
        loading={loading}
        data={categories}
        emptyMessage="No categories yet"
        columns={[
          {
            header: "Image",
            cell: (c) =>
              c.imageUrl ? (
                <img
                  src={c.imageUrl}
                  alt={c.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-lg" />
              ),
          },
          {
            header: "Name",
            cell: (c) => <span className="font-medium">{c.name}</span>,
          },
          {
            header: "Description",
            cell: (c) => (
              <span className="text-gray-500 truncate max-w-xs block">
                {c.description ?? "—"}
              </span>
            ),
          },
          {
            header: "Actions",
            cell: (c) => (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(c)}
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
        title={editing ? "Edit Category" : "New Category"}
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Faith & Prayer"
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
          <FileUpload
            label={editing ? "Image (leave empty to keep current)" : "Image *"}
            accept="image/*"
            onChange={setImageFile}
            current={
              imageFile?.name ??
              (editing?.imageUrl ? "Current image" : undefined)
            }
          />
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
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
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`Delete category "${deleteTarget?.name}"? This will fail if sermons are using it.`}
      />
    </div>
  );
}
