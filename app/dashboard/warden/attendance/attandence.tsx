"use client";
import UserContext from "@/app/context/UserContext";
import { Button } from "@/components/ui/button";
import { UserPayload } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { getAllStudentsForAttendance, markPresent } from "./actions";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

const AttendenceComponent = () => {
    const user = useContext(UserContext)?.user as UserPayload;
    const [students, setStudents] = useState<UserPayload[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        const fetchStudents = async () => {
            const response = await getAllStudentsForAttendance(user);
            if (response.success) {
                setStudents(response.data as UserPayload[]);
                setLoading(true);
            } else {
                toast.error(response.message);
            }
        }
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleMarkPresent = async (student: UserPayload) => {
        const response = await markPresent(student);
        if (response.success) {
            toast.success(response.message);
            // router.refresh();
            const fetchStudents = async () => {
                const response = await getAllStudentsForAttendance(user);
                if (response.success) {
                    setStudents(response.data as UserPayload[]);
                    setLoading(true);
                } else {
                    toast.error(response.message);
                }
            }
            fetchStudents();
        } else {
            toast.error(response.message);
        }
    }
    if (!loading) {
        return <section className='w-full h-[80vh] flex justify-center items-center text-xl'>
            <div className='flex justify-center items-center gap-6'>
                <LoaderCircle className='animate-spin' /> Loading...
            </div>
        </section>
    }
    if (!students.length) {
        return <section className='w-full h-[80vh] flex justify-center items-center text-xl'>
            <div className='flex justify-center items-center gap-6'>
                No students found for attendance.
            </div>
        </section>
    }

    return (
        <div className="w-full">
            <p className="text-3xl font-bold text-center my-8">Students Attendence</p>
            <div className="w-full">
                {students.map((student) => (
                    <div key={student.id} className="flex justify-between items-center px-2 md:px-6 py-2 rounded-2xl border bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-4 w-full">
                        <div className="flex gap-2 md:gap-6">
                            <p>{student.name}</p>
                            <p>{student.usn_id}</p>
                        </div>
                        <Button variant={"ghost"} onClick={() => handleMarkPresent(student)}>Mark Present</Button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AttendenceComponent;