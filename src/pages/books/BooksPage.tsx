import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../api/axios";
import type { Book } from "../../types";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Input, Textarea } from "../../components/ui/Input";
import FileUpload from "../../components/ui/FileUpload";
import Badge from "../../components/ui/Badge";
import toast from "react-hot-toast";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);

  async function fetchBooks() {
    setLoading(true);
    try {
      const res = await api.get("/api/books");
      setBooks(res.data?.data ?? res.data ?? []);
    } catch {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setAuthor("");
    setPrice("");
    setCategory("");
    setDescription("");
    setCoverFile(null);
    setBookFile(null);
    setModalOpen(true);
  }

  function openEdit(b: Book) {
    setEditing(b);
    setTitle(b.title);
    setAuthor(b.author);
    setPrice(String(b.price));
    setCategory(b.category);
    setDescription(b.description);
    setCoverFile(null);
    setBookFile(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!title || !author || !price || !category || !description) {
      return toast.error("Fill all required fields");
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("author", author);
      fd.append("price", price);
      fd.append("category", category);
      fd.append("description", description);
      if (coverFile) fd.append("coverImage", coverFile);
      if (bookFile) fd.append("file", bookFile);

      if (editing) {
        await api.put(`/api/books/update/${editing._id}`, fd);
        toast.success("Book updated");
      } else {
        if (!coverFile || !bookFile)
          return toast.error("Cover image and book file are required");
        await api.post("/api/books/create", fd);
        toast.success("Book created");
      }
      setModalOpen(false);
      fetchBooks();
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
      await api.delete(`/api/books/delete/${deleteTarget._id}`);
      toast.success("Book deleted");
      setDeleteTarget(null);
      fetchBooks();
    } catch {
      toast.error("Failed to delete book");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Books"
        subtitle="Manage book library and digital content"
        icon={BookOpen}
        color="bg-blue-600"
        count={books.length}
        action={
          <Button onClick={openCreate} variant="light">
            <Plus size={16} />
            New Book
          </Button>
        }
      />

      <Table
        keyExtractor={(b) => b._id}
        loading={loading}
        data={books}
        emptyMessage="No books yet"
        columns={[
          {
            header: "Cover",
            cell: (b) =>
              b.coverImage ? (
                <img
                  src={b.coverImage}
                  alt={b.title}
                  className="w-10 h-14 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-14 bg-gray-100 rounded" />
              ),
          },
          {
            header: "Title",
            cell: (b) => <span className="font-medium">{b.title}</span>,
          },
          { header: "Author", cell: (b) => b.author },
          { header: "Category", cell: (b) => b.category },
          { header: "Price", cell: (b) => `ETB ${b.price.toLocaleString()}` },
          // {
          //   header: 'Status',
          //   cell: (b) => b.isActive ? <Badge variant="green">Active</Badge> : <Badge variant="red">Inactive</Badge>,
          // },
          {
            header: "Actions",
            cell: (b) => (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(b)}
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
        title={editing ? "Edit Book" : "New Book"}
        size="xl"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="col-span-2"
          />
          <Input
            label="Author *"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <Input
            label="Price (ETB) *"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input
            label="Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Theology"
          />
          <Textarea
            label="Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="col-span-2"
          />
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
          <FileUpload
            label={
              editing ? "PDF File (leave empty to keep current)" : "PDF File *"
            }
            accept=".pdf,application/pdf"
            onChange={setBookFile}
            current={bookFile?.name}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
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
        message={`Delete book "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
