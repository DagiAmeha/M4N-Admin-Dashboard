import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users, Calendar, Eye } from "lucide-react";
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

interface RegisteredUserItem {
  _id: string;
  username: string;
  email?: string;
  phone_number?: string;
  profile_image?: string;
  registeredAt?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

function pickString(
  source: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function normalizeRegisteredUsers(value: unknown): RegisteredUserItem[] {
  if (!Array.isArray(value)) return [];

  const users: RegisteredUserItem[] = [];

  value.forEach((item, index) => {
    const itemRecord = asRecord(item);
    if (!itemRecord) return;

    const nestedUser = asRecord(itemRecord.user);
    const source = nestedUser ?? itemRecord;

    const normalized: RegisteredUserItem = {
      _id:
        pickString(source, ["_id", "id"]) ??
        pickString(itemRecord, ["_id", "id"]) ??
        `user-${index}`,
      username:
        pickString(source, ["username", "name"]) ??
        pickString(itemRecord, ["username", "name"]) ??
        "Unknown user",
    };

    const email =
      pickString(source, ["email"]) ?? pickString(itemRecord, ["email"]);
    const phoneNumber =
      pickString(source, ["phone_number", "phone", "phoneNumber"]) ??
      pickString(itemRecord, ["phone_number", "phone", "phoneNumber"]);
    const profileImage =
      pickString(source, ["profile_image", "avatar", "profileImage"]) ??
      pickString(itemRecord, ["profile_image", "avatar", "profileImage"]);
    const registeredAt =
      pickString(itemRecord, [
        "registeredAt",
        "register_at",
        "registered_at",
        "createdAt",
      ]) ??
      pickString(source, [
        "registeredAt",
        "register_at",
        "registered_at",
        "createdAt",
      ]);

    if (email) normalized.email = email;
    if (phoneNumber) normalized.phone_number = phoneNumber;
    if (profileImage) normalized.profile_image = profileImage;
    if (registeredAt) normalized.registeredAt = registeredAt;

    users.push(normalized);
  });

  return users;
}

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
  const [registrationsOpen, setRegistrationsOpen] = useState(false);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsEvent, setRegistrationsEvent] = useState<Event | null>(
    null,
  );
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserItem[]>(
    [],
  );

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

  async function openRegistrations(ev: Event) {
    setRegistrationsEvent(ev);
    setRegistrationsOpen(true);
    setRegistrationsLoading(true);
    setRegisteredUsers([]);

    try {
      const res = await api.get(`/api/events/${ev._id}/registrations`);
      console.log("Registrations response:", res.data);
      const payload: unknown = res.data?.data ?? res.data;
      const payloadRecord = asRecord(payload);

      const usersPayload: unknown = Array.isArray(payload)
        ? payload
        : payloadRecord && Array.isArray(payloadRecord.registrations)
          ? payloadRecord.registrations
          : payloadRecord && Array.isArray(payloadRecord.users)
            ? payloadRecord.users
            : [];

      setRegisteredUsers(normalizeRegisteredUsers(usersPayload));
    } catch {
      toast.error("Failed to load registrations");
    } finally {
      setRegistrationsLoading(false);
    }
  }

  function closeRegistrationsModal() {
    setRegistrationsOpen(false);
    setRegistrationsEvent(null);
    setRegisteredUsers([]);
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
            header: "Cover",
            cell: (e) =>
              e.cover_image ? (
                <img
                  src={e.cover_image}
                  alt={e.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-lg" />
              ),
          },
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
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-gray-400" />
                  <span>{e.registration_count}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-indigo-600 hover:text-indigo-700"
                  onClick={() => openRegistrations(e)}
                >
                  <Eye size={14} />
                  View
                </Button>
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
        open={registrationsOpen}
        onClose={closeRegistrationsModal}
        title={
          registrationsEvent
            ? `Registered Users - ${registrationsEvent.title}`
            : "Registered Users"
        }
        size="xl"
      >
        {registrationsLoading ? (
          <div className="py-10 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <span className="text-sm">Loading registrations...</span>
            </div>
          </div>
        ) : registeredUsers.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No users registered for this event yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Registered At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {registeredUsers.map((u) => (
                    <tr key={u._id} className="bg-white">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-3">
                          {u.profile_image ? (
                            <img
                              src={u.profile_image}
                              alt={u.username}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                              {(
                                u.username.trim().charAt(0) || "U"
                              ).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">
                            {u.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {u.email ?? <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {u.phone_number ?? (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {u.registeredAt ? (
                          new Date(u.registeredAt).toLocaleString()
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={closeRegistrationsModal}>
            Close
          </Button>
        </div>
      </Modal>

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
