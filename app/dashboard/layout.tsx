import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full min-h-screen flex flex-col">
                <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-2">
                    <SidebarTrigger />
                </div>
                <div className="flex-1 flex justify-center py-6 px-2">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}