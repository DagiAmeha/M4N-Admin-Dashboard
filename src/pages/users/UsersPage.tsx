import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../api/axios";
import type { User } from "../../types";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  async function fetchUsers(p = 1) {
    setLoading(true);
    try {
      const res = await api.get(`/api/users?page=${p}&limit=20`);
      const data = res.data;
      setUsers(data.data);
      if (data.pagination) {
        setPages(data.pagination.pages);
        setTotal(data.pagination.total);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Registered members and accounts"
        icon={Users}
        color="bg-orange-500"
        count={total}
      />

      <Table
        keyExtractor={(u) => u._id}
        loading={loading}
        data={users}
        emptyMessage="No users found"
        columns={[
          {
            header: "Avatar",
            cell: (u) =>
              u.profile_image ? (
                <img
                  src={u.profile_image}
                  alt={u.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 text-sm font-semibold">
                    {u.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              ),
          },
          {
            header: "Username",
            cell: (u) => (
              <div>
                <p className="font-medium text-gray-900">{u.username}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
            ),
          },
          { header: "Phone", cell: (u) => u.phone_number },
          {
            header: "Role",
            cell: (u) => (
              <div className="flex gap-1">
                {u.role === "admin" || u.is_admin ? (
                  <Badge variant="purple">Admin</Badge>
                ) : (
                  <Badge variant="gray">User</Badge>
                )}
              </div>
            ),
          },
          {
            header: "Premium",
            cell: (u) =>
              u.is_premium ? (
                <div>
                  <Badge variant="blue">Premium</Badge>
                  {/* {u.premium_until && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Until {new Date(u.premium_until).toLocaleDateString()}
                    </p>
                  )} */}
                </div>
              ) : (
                <Badge variant="gray">Free</Badge>
              ),
          },
          {
            header: "Donations",
            cell: (u) =>
              u.total_donations > 0 ? (
                <span className="text-green-600 font-medium">
                  ETB {u.total_donations.toLocaleString()}
                </span>
              ) : (
                <span className="text-gray-400">—</span>
              ),
          },
          {
            header: "Joined",
            cell: (u) => new Date(u.createdAt).toLocaleDateString(),
          },
        ]}
      />

      <Pagination page={page} pages={pages} total={total} onChange={setPage} />
    </div>
  );
}
