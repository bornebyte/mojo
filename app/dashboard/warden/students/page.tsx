"use client";
import { useContext, useEffect, useState } from "react";
import UserContext from "@/app/context/UserContext";
import { UserPayload } from "@/lib/types";
import { getAllStudents } from "../attendance/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { WardenStudentsTable } from "./studentsTable";
import { getFromCache, saveToCache } from "@/lib/cache-utils";

const StudentsPage = () => {
    const user = useContext(UserContext)?.user as UserPayload;
    const [students, setStudents] = useState<UserPayload[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = async (forceRefresh = false) => {
        if (!forceRefresh) {
            const cached = getFromCache<UserPayload[]>('warden_students', user?.role);
            if (cached) {
                setStudents(cached);
                setLoading(false);
                return;
            }
        }

        setLoading(true);
        const response = await getAllStudents(user);
        if (response.success) {
            const studentData = response.data as UserPayload[];
            setStudents(studentData);
            saveToCache('warden_students', studentData);
        } else {
            toast.error(response.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">My Students</h1>
                    <p className="text-muted-foreground mt-2">
                        View and manage students in your assigned building and floors
                    </p>
                </div>
                <Button onClick={() => fetchStudents(true)} variant="outline" size="sm" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <WardenStudentsTable data={students} />
            )}
        </div>
    );
};

export default StudentsPage;
