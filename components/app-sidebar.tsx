"use client"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ForwardRefExoticComponent, RefAttributes, useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import type { UserPayload } from "@/lib/types";
import { DropdownMenuForSidebarUserMoreOptions } from "./sidebarUserMoreOptions";
import {
    Calendar,
    Home,
    UserPlus,
    LucideProps,
    UserPen,
    Building,
    UtensilsCrossed,
    Eye,
    MessageSquare,
    ClipboardCheck,
    Users,
    Bell,
    BarChart3,
    Megaphone,
    AlertCircle
} from "lucide-react"
import UserContext from "@/app/context/UserContext";

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
        title: "Manage Buildings",
        url: "/dashboard/admin/manage-buildings",
        icon: Building,
    },
    {
        title: "Complaints",
        url: "/dashboard/admin/complaints",
        icon: AlertCircle,
    },
    {
        title: "Announcements",
        url: "/dashboard/announcements",
        icon: Bell,
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
        icon: UtensilsCrossed,
    },
    {
        title: "View Menu",
        url: "/dashboard/canteen-manager/view-menu",
        icon: Eye,
    },
    {
        title: "Feedback",
        url: "/dashboard/canteen-manager/feedback",
        icon: MessageSquare,
    },
    {
        title: "My Announcements",
        url: "/dashboard/canteen-manager/announcements",
        icon: Megaphone,
    },
    {
        title: "View All Announcements",
        url: "/dashboard/announcements",
        icon: Bell,
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
        icon: UtensilsCrossed,
    },
    {
        title: "My Attendance",
        url: "/dashboard/student/my-attendance",
        icon: Calendar,
    },
    {
        title: "Complaints",
        url: "/dashboard/student/complaints",
        icon: AlertCircle,
    },
    {
        title: "Announcements",
        url: "/dashboard/announcements",
        icon: Bell,
    },
]

const wardenItems = [
    {
        title: "Home",
        url: "/dashboard/warden",
        icon: Home,
    },
    {
        title: "Mark Attendance",
        url: "/dashboard/warden/attendance",
        icon: ClipboardCheck,
    },
    {
        title: "Students",
        url: "/dashboard/warden/students",
        icon: Users,
    },
    {
        title: "Add Student",
        url: "/dashboard/warden/students/add",
        icon: UserPlus,
    },
    {
        title: "Complaints",
        url: "/dashboard/warden/complaints",
        icon: AlertCircle,
    },
    {
        title: "Analytics",
        url: "/dashboard/warden/analytics",
        icon: BarChart3,
    },
    {
        title: "My Announcements",
        url: "/dashboard/warden/announcements",
        icon: Megaphone,
    },
    {
        title: "View All Announcements",
        url: "/dashboard/announcements",
        icon: Bell,
    },
]

export default function AppSidebar() {
    let items: { title: string; url: string; icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; }[] = []
    const user = useContext(UserContext)?.user as UserPayload;

    switch (user?.role) {
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
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenuForSidebarUserMoreOptions user={user}>
                            <div className="py-2 flex items-center justify-start gap-3 px-2 cursor-pointer hover:bg-sidebar-accent rounded-md transition-colors">
                                <Avatar className="rounded-lg h-8 w-8">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <p className="font-semibold text-xs truncate">{user?.name || user?.usn_id}</p>
                                    <p className="text-[10px] text-muted-foreground capitalize truncate">{user?.role}</p>
                                </div>
                            </div>
                        </DropdownMenuForSidebarUserMoreOptions>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}