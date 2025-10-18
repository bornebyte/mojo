import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import { Calendar, Home, UserPlus, Search, Settings, LucideProps, UserPen } from "lucide-react"
import { cookies } from "next/headers"
import type { UserPayload } from "@/lib/types"
import { jwtVerify } from "jose"
import { ForwardRefExoticComponent, RefAttributes } from "react"

// Sidebar Menu items.
const adminItems = [
    {
        title: "Home",
        url: "/dashboard/admin",
        icon: Home,
    },
    {
        title: "Manage Members",
        url: "/dashboard/admin/manage-members",
        icon: UserPen,
    },
    {
        title: "Add Member",
        url: "/dashboard/admin/add-member",
        icon: UserPlus,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

const canteenManagerItems = [
    {
        title: "Home",
        url: "/dashboard/canteen-manager",
        icon: Home,
    },
    {
        title: "Add Menu",
        url: "/dashboard/canteen-manager/add-menu",
        icon: UserPlus,
    },
    {
        title: "View Menu",
        url: "/dashboard/canteen-manager/view-menu",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

const studentItems = [
    {
        title: "Home",
        url: "/dashboard/student",
        icon: Home,
    },
    {
        title: "View Menu",
        url: "/dashboard/student/view-menu",
        icon: UserPlus,
    },
    {
        title: "My attendance",
        url: "/dashboard/student/my-attendance",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]
const wardenItems = [
    {
        title: "Home",
        url: "/dashboard/warden",
        icon: Home,
    },
    {
        title: "Attendance",
        url: "/dashboard/warden/attendance",
        icon: UserPlus,
    },
    {
        title: "My attendance",
        url: "/dashboard/warden/my-attendance",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    var user: UserPayload = {};
    var items: { title: string; url: string; icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; }[] = []
    const cookie = await cookies()
    const token = cookie.get("token")
    if (token && token.value) {
        const { payload } = await jwtVerify(
            token.value,
            new TextEncoder().encode(process.env.JWT_SECRET)
        )
        user = payload
        switch (user.role) {
            case "admin":
                items = adminItems
                break;
            case "canteen manager":
                items = canteenManagerItems
                break;
            case "student":
                items = studentItems
                break;
            case "warden":
                items = wardenItems
                break;
            default:
                break;
        }
    }
    return (
        <SidebarProvider>
            <AppSidebar items={items} user={user} />
            <SidebarTrigger />
            <main className="w-full flex justify-center py-12 px-4">
                {children}
            </main>
        </SidebarProvider>
    )
}