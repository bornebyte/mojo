import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddAdminForm from "./addAdminForm"
import type { AvailableBuildingsAndFloors, UserPayload } from "@/lib/types"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import AddCanteenManagerForm from "./addCanteenMemberForm"
import AddWardenForm from "./addWardenForm"
import AddStudentForm from "./addStudentsForm"
import { getAvailableBuildingsAndFloors } from "./action"

const AddMemberTabsComponent = async () => {
    const { buildings: availableBuildingsAndFloors, assignedWardenFloors, assignedStudentRooms } = await getAvailableBuildingsAndFloors();
    const cookiestore = await cookies()
    const token = cookiestore.get("token")?.value
    if (!token) {
        throw new Error("No token found")
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    const user = payload as UserPayload
    return (
        <div>
            <Tabs defaultValue="student" className="w-full md:w-[400px]">
                <TabsList className="w-full">
                    <TabsTrigger value="student">Student</TabsTrigger>
                    <TabsTrigger value="warden">Warden</TabsTrigger>
                    <TabsTrigger value="canteen">Canteen Manager</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
                <TabsContent value="student">
                    <AddStudentForm user={user} availableBuildingsAndFloors={availableBuildingsAndFloors} assignedStudentRooms={assignedStudentRooms} />
                </TabsContent>
                <TabsContent value="warden">
                    <AddWardenForm user={user} availableBuildingsAndFloors={availableBuildingsAndFloors} assignedWardenFloors={assignedWardenFloors} assignedStudentRooms={assignedStudentRooms} />
                </TabsContent>
                <TabsContent value="canteen">
                    <AddCanteenManagerForm user={user} availableBuildingsAndFloors={availableBuildingsAndFloors} assignedStudentRooms={assignedStudentRooms} />
                </TabsContent>
                <TabsContent value="admin">
                    <AddAdminForm user={user} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AddMemberTabsComponent