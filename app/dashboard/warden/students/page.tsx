"use client";
import { useContext, useEffect, useState } from "react";
import UserContext from "@/app/context/UserContext";
import { UserPayload } from "@/lib/types";
import { getAllStudents, deleteStudent } from "../attendance/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Search, UserPlus, Trash2, Edit, Phone, Mail, Building2, DoorClosed, Layers, Filter, Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const StudentsPage = () => {
    const user = useContext(UserContext)?.user as UserPayload;
    const [students, setStudents] = useState<UserPayload[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<UserPayload[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [floorFilter, setFloorFilter] = useState("all");
    const [roomFilter, setRoomFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<UserPayload | null>(null);

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        applyFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, floorFilter, roomFilter, sortBy, students]);

    const fetchStudents = async () => {
        setLoading(true);
        const response = await getAllStudents(user);
        if (response.success) {
            setStudents(response.data as UserPayload[]);
        } else {
            toast.error(response.message);
        }
        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...students];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter((student) =>
                student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.usn_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.allocated_room?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Floor filter
        if (floorFilter !== "all") {
            filtered = filtered.filter((student) => student.allocated_floor === floorFilter);
        }

        // Room filter
        if (roomFilter !== "all") {
            filtered = filtered.filter((student) => student.allocated_room === roomFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return (a.name || "").localeCompare(b.name || "");
                case "usn":
                    return (a.usn_id || "").localeCompare(b.usn_id || "");
                case "email":
                    return (a.email || "").localeCompare(b.email || "");
                case "floor":
                    return (a.allocated_floor || "").localeCompare(b.allocated_floor || "");
                case "room":
                    return (a.allocated_room || "").localeCompare(b.allocated_room || "");
                default:
                    return 0;
            }
        });

        setFilteredStudents(filtered);
    };

    const getUniqueFloors = () => {
        const floors = new Set(students.map(s => s.allocated_floor).filter(Boolean));
        return Array.from(floors).sort();
    };

    const getUniqueRooms = () => {
        let rooms = students.map(s => s.allocated_room).filter(Boolean);
        if (floorFilter !== "all") {
            rooms = students
                .filter(s => s.allocated_floor === floorFilter)
                .map(s => s.allocated_room)
                .filter(Boolean);
        }
        return Array.from(new Set(rooms)).sort();
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

    const exportToCSV = () => {
        const headers = ["Name", "USN", "Email", "Phone", "Building", "Floor", "Room", "Status"];
        const rows = filteredStudents.map(s => [
            s.name || "",
            s.usn_id || "",
            s.email || "",
            s.phone || "",
            s.allocated_building || "",
            s.allocated_floor || "",
            s.allocated_room || "",
            s.status || ""
        ]);

        const csv = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `students-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Student data exported successfully");
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFloorFilter("all");
        setRoomFilter("all");
        setSortBy("name");
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
                    <h1 className="text-3xl font-bold tracking-tight">Students Management</h1>
                    <p className="text-muted-foreground">
                        Manage students in your assigned building and floors
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchStudents} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Link href="/dashboard/warden/students/add">
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Student
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters & Search
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <div className="lg:col-span-2 space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, USN, email, phone, or room..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Floor</label>
                            <Select value={floorFilter} onValueChange={(value) => {
                                setFloorFilter(value);
                                setRoomFilter("all");
                            }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Floors</SelectItem>
                                    {getUniqueFloors().map((floor) => (
                                        <SelectItem key={floor} value={floor || ""}>
                                            Floor {floor}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Room</label>
                            <Select value={roomFilter} onValueChange={setRoomFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Rooms</SelectItem>
                                    {getUniqueRooms().map((room) => (
                                        <SelectItem key={room} value={room || ""}>
                                            {room}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sort By</label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="usn">USN</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="floor">Floor</SelectItem>
                                    <SelectItem value="room">Room</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Students ({filteredStudents.length})</CardTitle>
                            <CardDescription>
                                {students.length} total students
                                {floorFilter !== "all" && ` • Floor ${floorFilter}`}
                                {roomFilter !== "all" && ` • Room ${roomFilter}`}
                            </CardDescription>
                        </div>
                        <Button onClick={exportToCSV} variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Name</TableHead>
                                    <TableHead>USN</TableHead>
                                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                                    <TableHead className="hidden lg:table-cell">Room Details</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${student.status === 'active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                                    }`}>
                                                    {student.status || 'active'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
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
