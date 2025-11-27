import { getUserFromToken } from "@/app/functions";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getUserFromToken();

    if (!user) {
        redirect("/login");
    }

    if (user.role !== "admin") {
        redirect("/dashboard");
    }

    return <div className="w-full min-h-screen">
        {children}
    </div>;
}
