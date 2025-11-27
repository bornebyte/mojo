"use client";
import { useContext, useEffect, useState } from "react";
import UserContext from "@/app/context/UserContext";
import { UserPayload } from "@/lib/types";
import { getAllStudents, deleteStudent } from "../attendance/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Search, UserPlus, Trash2, Edit, Phone, Mail, Building2, DoorClosed, Layers } from "lucide-react";
import Link from "next/link";

const StudentsPage = () => {
    const user = useContext(UserContext)?.user as UserPayload;
    const [students, setStudents] = useState<UserPayload[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<UserPayload[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<UserPayload | null>(null);

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = students.filter((student) =>
                student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.usn_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.allocated_room?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(students);
        }
    }, [searchTerm, students]);

    const fetchStudents = async () => {
        setLoading(true);
        const response = await getAllStudents(user);
        if (response.success) {
            setStudents(response.data as UserPayload[]);
            setFilteredStudents(response.data as UserPayload[]);
        } else {
            toast.error(response.message);
        }
        setLoading(false);
    };

    const handleDeleteClick = (student: UserPayload) => {
        setSelectedStudent(student);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedStudent?.id) return;

        const response = await deleteStudent(selectedStudent.id);
        if (response.success) {
            toast.success(response.message);
            setDeleteDialogOpen(false);
            setSelectedStudent(null);
            fetchStudents();
        } else {
            toast.error(response.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                    <p className="text-muted-foreground">
                        Manage students in your assigned building and floors
                    </p>
                </div>
                <Link href="/dashboard/warden/students/add">
                    <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Student
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Students ({filteredStudents.length})</CardTitle>
                    <CardDescription>
                        View and manage all students under your supervision
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, USN, email, or room..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Name</TableHead>
                                    <TableHead>USN</TableHead>
                                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                                    <TableHead className="hidden lg:table-cell">Room Details</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No students found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">
                                                {student.name}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {student.usn_id || 'N/A'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="space-y-1 text-sm">
                                                    {student.email && (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            <span className="truncate max-w-[200px]">{student.email}</span>
                                                        </div>
                                                    )}
                                                    {student.phone && (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Phone className="h-3 w-3" />
                                                            <span>{student.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    {student.allocated_building && (
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary">
                                                            <Building2 className="h-3 w-3" />
                                                            {student.allocated_building}
                                                        </div>
                                                    )}
                                                    {student.allocated_floor && (
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary">
                                                            <Layers className="h-3 w-3" />
                                                            Floor {student.allocated_floor}
                                                        </div>
                                                    )}
                                                    {student.allocated_room && (
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary">
                                                            <DoorClosed className="h-3 w-3" />
                                                            {student.allocated_room}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            // For future edit functionality
                                                            toast.info("Edit functionality coming soon");
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(student)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Student</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{selectedStudent?.name}</strong>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setSelectedStudent(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudentsPage;
