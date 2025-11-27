import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <main className="w-full min-h-screen flex justify-center py-12 px-2">
                {children}
            </main>
        </SidebarProvider>
    )
}