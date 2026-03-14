import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users, Calendar } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../api/axios";
import type { Event } from "../../types";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Input, Textarea } from "../../components/ui/Input";
import FileUpload from "../../components/ui/FileUpload";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import toast from "react-hot-toast";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [allowsRegistration, setAllowsRegistration] = useState(true);
  const [isFull, setIsFull] = useState(false);

  async function fetchEvents(p = 1) {
    setLoading(true);
    try {
      const res = await api.get(`/api/events?page=${p}&limit=10`);
      // backend returns { success, data: [...], pagination: {...} }
      setEvents(res.data?.data ?? []);
      if (res.data?.pagination) {
        setPages(res.data.pagination.pages ?? 1);
        setTotal(res.data.pagination.total ?? 0);
      }
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents(page);
  }, [page]);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setDateTime("");
    setLocation("");
    setCoverFile(null);
    setAllowsRegistration(true);
    setIsFull(false);
    setModalOpen(true);
  }

  function openEdit(ev: Event) {
    setEditing(ev);
    setTitle(ev.title);
    setDescription(ev.description);
    setDateTime(ev.date_time.slice(0, 16));
    setLocation(ev.location);
    setCoverFile(null);
    setAllowsRegistration(ev.allows_registration);
    setIsFull(ev.is_full);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!title || !description || !dateTime || !location) {
      return toast.error("Fill all required fields");
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("date_time", new Date(dateTime).toISOString());
      fd.append("location", location);
      fd.append("allows_registration", String(allowsRegistration));
      if (editing) fd.append("is_full", String(isFull));
      if (coverFile) fd.append("cover_image", coverFile);

      if (editing) {
        await api.put(`/api/events/${editing._id}`, fd);
        toast.success("Event updated");
      } else {
        await api.post("/api/events", fd);
        toast.success("Event created");
      }
      setModalOpen(false);
      fetchEvents(page);
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
      await api.delete(`/api/events/${deleteTarget._id}`);
      toast.success("Event deleted");
      setDeleteTarget(null);
      fetchEvents(page);
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Schedule and manage church events"
        icon={Calendar}
        color="bg-green-600"
        count={total}
        action={
          <Button
            onClick={openCreate}
            variant="light"
            className="w-full justify-center sm:w-auto"
          >
            <Plus size={16} />
            New Event
          </Button>
        }
      />

      <Table
        keyExtractor={(e) => e._id}
        loading={loading}
        data={events}
        emptyMessage="No events yet"
        columns={[
          {
            header: "Title",
            cell: (e) => <span className="font-medium">{e.title}</span>,
          },
          {
            header: "Date & Time",
            cell: (e) => new Date(e.date_time).toLocaleString(),
          },
          { header: "Location", cell: (e) => e.location },
          {
            header: "Registrations",
            cell: (e) => (
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-gray-400" />
                <span>{e.registration_count}</span>
              </div>
            ),
          },
          {
            header: "Status",
            cell: (e) => (
              <div className="flex gap-1">
                {e.is_full ? (
                  <Badge variant="red">Full</Badge>
                ) : (
                  <Badge variant="green">Open</Badge>
                )}
                {!e.allows_registration && (
                  <Badge variant="yellow">No Reg.</Badge>
                )}
              </div>
            ),
          },
          {
            header: "Actions",
            cell: (e) => (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(e)}>
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(e)}
                >
                  <Trash2 size={14} className="text-red-500" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Pagination page={page} pages={pages} total={total} onChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Event" : "New Event"}
        size="xl"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="md:col-span-2"
          />
          <Textarea
            label="Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="md:col-span-2"
          />
          <Input
            label="Date & Time *"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
          <Input
            label="Location *"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <FileUpload
            label={
              editing
                ? "Cover Image (leave empty to keep current)"
                : "Cover Image (optional)"
            }
            accept="image/*"
            onChange={setCoverFile}
            current={
              coverFile?.name ??
              (editing?.cover_image ? "Current image already uploaded" : "")
            }
          />
          <div className="flex items-center gap-3">
            <input
              id="allows_reg"
              type="checkbox"
              checked={allowsRegistration}
              onChange={(e) => setAllowsRegistration(e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
            <label
              htmlFor="allows_reg"
              className="text-sm font-medium text-gray-700"
            >
              Allow Registration
            </label>
          </div>
          {editing && (
            <div className="flex items-center gap-3">
              <input
                id="is_full"
                type="checkbox"
                checked={isFull}
                onChange={(e) => setIsFull(e.target.checked)}
                className="w-4 h-4 accent-red-600"
              />
              <label
                htmlFor="is_full"
                className="text-sm font-medium text-gray-700"
              >
                Mark as Full
              </label>
            </div>
          )}
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
        message={`Delete event "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
