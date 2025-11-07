import { getUserFromToken } from "@/app/functions"
import { BuildingAllUsers, UserPayload } from "@/lib/types"
import { getAllStudentsInBuildingAndFloorByDate, getWardenAllDetails } from "./actions"
import ShowStudents from "./showStudents"

const WardenAttendance = async () => {
    const user: UserPayload = await getUserFromToken()
    const wardenDetails = await getWardenAllDetails(user);
    const studentsInBuildingAndFloorByDate = await getAllStudentsInBuildingAndFloorByDate(wardenDetails.data as BuildingAllUsers) as { success: boolean, data: BuildingAllUsers[] };
    if (studentsInBuildingAndFloorByDate.success === false) return <div>No students found!!</div>
    return (
        <ShowStudents students={studentsInBuildingAndFloorByDate.data} />
    )
}

export default WardenAttendance