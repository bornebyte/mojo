import AddMemberTabsComponent from "./Tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Shield, UtensilsCrossed } from "lucide-react"

const AddMember = () => {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl min-h-screen">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold">Add Members</h1>
                <p className="text-muted-foreground mt-2">
                    Add new users to the hostel management system
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">Add student accounts</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wardens</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">Add warden accounts</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Canteen Staff</CardTitle>
                        <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">Add canteen manager</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admins</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">Add admin accounts</div>
                    </CardContent>
                </Card>
            </div>

            <div className="w-full">
                <AddMemberTabsComponent />
            </div>
        </div>
    )
}

export default AddMember