import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddAdminForm from "./addAdminForm"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const AddMemberTabsComponent = async () => {
    const cookiestore = await cookies()
    const token = cookiestore.get("token")?.value
    if (!token) {
        throw new Error("No token found")
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    const user = payload as { usn_id: string; role: string; name: string; email: string }
    return (
        <div>
            <Tabs defaultValue="student" className="w-[400px]">
                <TabsList className="w-full">
                    <TabsTrigger value="student">Student</TabsTrigger>
                    <TabsTrigger value="warden">Warden</TabsTrigger>
                    <TabsTrigger value="canteen">Canteen Manager</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
                <TabsContent value="student">Make changes to your account here.</TabsContent>
                <TabsContent value="warden">Change your password here.</TabsContent>
                <TabsContent value="canteen">Make changes to your account here.</TabsContent>
                <TabsContent value="admin">
                    <AddAdminForm user={user} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AddMemberTabsComponent