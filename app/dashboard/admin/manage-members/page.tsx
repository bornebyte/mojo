"use client"

import { useEffect, useState } from "react";
import { getAllUsers } from "@/app/dashboard/admin/manage-members/actions";
import { ManageMembersTable } from "./managemembers"
import { UserPayload } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getFromCache, saveToCache } from "@/lib/cache-utils";

const AdminManageMembers = () => {
  const [allUsers, setAllUsers] = useState<UserPayload[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getFromCache<UserPayload[]>('admin_all_users', 'admin');
      if (cached) {
        setAllUsers(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const users = await getAllUsers() as UserPayload[];
      setAllUsers(users);
      saveToCache('admin_all_users', users);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <section className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Manage Members</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all users in the system
          </p>
        </div>
        <Button onClick={() => fetchUsers(true)} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ManageMembersTable data={allUsers} />
      )}
    </section>
  )
}

export default AdminManageMembers
