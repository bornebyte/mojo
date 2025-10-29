import { getAllUsers } from "@/app/dashboard/admin/manage-members/actions";
import { ManageMembersTable } from "./managemembers"
import { BuildingAllUsers } from "@/lib/types";

const AdminManageMembers = async () => {
  const allUsers = await getAllUsers() as BuildingAllUsers[];
  return (
    <section>
      <ManageMembersTable data={allUsers} />
    </section>
  )
}

export default AdminManageMembers
