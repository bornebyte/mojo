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
import { Calendar, Home, UserPlus, Search, Settings, LucideProps, UserPen, Building } from "lucide-react"
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
                        <SidebarMenuButton asChild>
                            <div className="py-6 flex items-center justify-start gap-4 px-2">
                                <Avatar className="rounded-lg text-3xl">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <p className="font-bold text-sm">{user?.usn_id}</p>
                                    <p className="text-xs">{user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}</p>
                                </div>
                                <DropdownMenuForSidebarUserMoreOptions user={user} />
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}