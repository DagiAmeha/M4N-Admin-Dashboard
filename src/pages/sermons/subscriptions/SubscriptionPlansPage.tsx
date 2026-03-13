import { useEffect, useState } from "react";
import { Plus, CreditCard } from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import api from "../../../api/axios";
import type { SubscriptionPlan } from "../../../types";
import Table from "../../../components/ui/Table";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { Input, Textarea } from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import toast from "react-hot-toast";

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [description, setDescription] = useState("");

  async function fetchPlans() {
    setLoading(true);
    try {
      const res = await api.get("/api/subscription/plans");
      setPlans(res.data?.data ?? res.data ?? []);
    } catch {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlans();
  }, []);

  function openCreate() {
    setName("");
    setPrice("");
    setDurationDays("");
    setDescription("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!name || !price || !durationDays)
      return toast.error("Name, price, and duration are required");
    setSaving(true);
    try {
      const res = await api.post("/api/subscription/plans/create", {
        name,
        price: Number(price),
        durationDays: Number(durationDays),
        ...(description ? { description } : {}),
      });
      if (res.data?.success === false)
        throw new Error(res.data?.message ?? "Failed");
      toast.success("Plan created");
      setModalOpen(false);
      fetchPlans();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create plan";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Subscription Plans"
        subtitle="Manage premium access tiers"
        icon={CreditCard}
        color="bg-purple-600"
        count={plans.length}
        action={
          <Button onClick={openCreate} variant="light">
            <Plus size={16} />
            New Plan
          </Button>
        }
      />

      <Table
        keyExtractor={(p) => p._id}
        loading={loading}
        data={plans}
        emptyMessage="No subscription plans yet"
        columns={[
          {
            header: "Name",
            cell: (p) => <span className="font-medium">{p.name}</span>,
          },
          {
            header: "Price",
            cell: (p) => `${p.currency} ${p.price.toLocaleString()}`,
          },
          { header: "Duration", cell: (p) => `${p.durationDays} days` },
          {
            header: "Description",
            cell: (p) => (
              <span className="text-gray-500">{p.description ?? "—"}</span>
            ),
          },
          {
            header: "Status",
            cell: (p) =>
              p.status === "active" ? (
                <Badge variant="green">Active</Badge>
              ) : (
                <Badge variant="red">Inactive</Badge>
              ),
          },
          {
            header: "Created",
            cell: (p) => new Date(p.createdAt).toLocaleDateString(),
          },
        ]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Subscription Plan"
      >
        <div className="space-y-4">
          <Input
            label="Plan Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Monthly Premium"
          />
          <Input
            label="Price (ETB) *"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input
            label="Duration (days) *"
            type="number"
            min="1"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            placeholder="e.g. 30"
          />
          <Textarea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
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
            {saving ? "Saving…" : "Create Plan"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
