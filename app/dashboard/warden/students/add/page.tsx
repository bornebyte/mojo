import { getAvailableBuildingsAndFloors } from "@/app/dashboard/admin/add-member/action";
import { getUserFromToken } from "@/app/functions";
import AddStudentForm from "@/app/dashboard/admin/add-member/addStudentsForm";
import { redirect } from "next/navigation";

const AddStudentPage = async () => {
    const user = await getUserFromToken();

    if (!user) {
        redirect("/login");
    }

    const availableBuildingsAndFloors = await getAvailableBuildingsAndFloors();

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-2xl">
                <AddStudentForm user={user} availableBuildingsAndFloors={availableBuildingsAndFloors} />
            </div>
        </div>
    );
};

export default AddStudentPage;
