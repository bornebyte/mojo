"use client";
import UserContext from "@/app/context/UserContext";
import { Button } from "@/components/ui/button";
import { UserPayload } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { getAllStudentsForAttendance, markAttendance } from "./actions";
import { toast } from "sonner";
import { LoaderCircle, UserCheck, UserX, Plane } from "lucide-react";
import { getFromCache, saveToCache } from "@/lib/cache-utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AttendenceComponent = () => {
    const user = useContext(UserContext)?.user as UserPayload;
    const [students, setStudents] = useState<UserPayload[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<UserPayload | null>(null);
    const [showReasonDialog, setShowReasonDialog] = useState(false);
    const [reason, setReason] = useState("");
    const [pendingStatus, setPendingStatus] = useState<"absent" | "on_leave">("absent");

    useEffect(() => {
        fetchStudentsWithCache();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchStudentsWithCache = async (forceRefresh = false) => {
        try {
            // Check cache first
            if (!forceRefresh) {
                const cached = getFromCache<UserPayload[]>('warden_attendance_students', user?.role)
                if (cached) {
                    setStudents(cached)
                    setLoading(true)
                    return
                }
            }

            // Fetch fresh data
            const response = await getAllStudentsForAttendance(user);
            if (response.success) {
                setStudents(response.data as UserPayload[]);
                setLoading(true);
                saveToCache('warden_attendance_students', response.data)
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Failed to fetch students");
            console.error(error);
        }
    };

    const fetchStudents = async () => {
        const response = await getAllStudentsForAttendance(user);
        if (response.success) {
            setStudents(response.data as UserPayload[]);
            setLoading(true);
        } else {
            toast.error(response.message);
        }
    };

    const handleMarkAttendance = async (student: UserPayload, status: "present" | "absent" | "on_leave") => {
        if (status !== "present") {
            setSelectedStudent(student);
            setPendingStatus(status);
            setShowReasonDialog(true);
            return;
        }

        const response = await markAttendance(student, status, user);
        if (response.success) {
            toast.success(response.message);
            fetchStudentsWithCache(true);
        } else {
            toast.error(response.message);
        }
    };

    const handleSubmitWithReason = async () => {
        if (!selectedStudent) return;

        const response = await markAttendance(selectedStudent, pendingStatus, user, reason);
        if (response.success) {
            toast.success(response.message);
            setShowReasonDialog(false);
            setReason("");
            setSelectedStudent(null);
            fetchStudentsWithCache(true);
        } else {
            toast.error(response.message);
        }
    };

    if (!loading) {
        return (
            <section className='w-full h-[80vh] flex justify-center items-center text-xl'>
                <div className='flex justify-center items-center gap-6'>
                    <LoaderCircle className='animate-spin' /> Loading...
                </div>
            </section>
        );
    }

    if (!students.length) {
        return (
            <section className='w-full h-[80vh] flex justify-center items-center text-xl'>
                <div className='flex flex-col justify-center items-center gap-4 text-center px-4'>
                    <UserCheck className="w-16 h-16 text-green-500" />
                    <p className="text-2xl font-semibold">All Students Marked!</p>
                    <p className="text-sm text-muted-foreground">
                        All students in your assigned building and floors have been marked for today.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <div className="w-full p-4 md:p-6">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Mark Attendance</h1>
                <p className="text-center text-muted-foreground">
                    {students.length} student{students.length !== 1 ? 's' : ''} pending for today
                </p>
            </div>

            <div className="grid gap-4">
                {students.map((student) => (
                    <div
                        key={student.id}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 md:p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-lg">{student.name}</p>
                                {student.usn_id && (
                                    <span className="text-sm text-muted-foreground">({student.usn_id})</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {student.allocated_floor && (
                                    <span>Floor: {student.allocated_floor}</span>
                                )}
                                {student.allocated_room && (
                                    <span>Room: {student.allocated_room}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleMarkAttendance(student, "present")}
                                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                            >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Present
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleMarkAttendance(student, "absent")}
                                className="flex-1 md:flex-none"
                            >
                                <UserX className="w-4 h-4 mr-2" />
                                Absent
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAttendance(student, "on_leave")}
                                className="flex-1 md:flex-none"
                            >
                                <Plane className="w-4 h-4 mr-2" />
                                On Leave
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {pendingStatus === "absent" ? "Mark as Absent" : "Mark as On Leave"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedStudent && (
                                <span>Marking <strong>{selectedStudent.name}</strong> as {pendingStatus === "absent" ? "absent" : "on leave"}</span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">
                                Reason {pendingStatus === "on_leave" ? "(required)" : "(optional)"}
                            </Label>
                            <Textarea
                                id="reason"
                                placeholder={`Enter reason for ${pendingStatus === "absent" ? "absence" : "leave"}...`}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowReasonDialog(false);
                                setReason("");
                                setSelectedStudent(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitWithReason}
                            variant={pendingStatus === "absent" ? "destructive" : "default"}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AttendenceComponent;
