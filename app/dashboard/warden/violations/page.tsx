"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Eye, Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Violation, ViolationStats, UserPayload } from "@/lib/types";
import {
    fileViolation,
    getAllViolations,
    getViolationsByBuilding,
    updateViolation,
    deleteViolation,
    getViolationStats,
} from "@/app/dashboard/violations/actions";
import { getUserFromTokenCookie } from "@/app/actions";
import { getFromCache, saveToCache } from "@/lib/cache-utils";

const violationTypes = [
    { value: "smoking", label: "Smoking" },
    { value: "alcohol", label: "Alcohol Possession" },
    { value: "property_damage", label: "Property Damage" },
    { value: "noise_complaint", label: "Noise Complaint" },
    { value: "unauthorized_guest", label: "Unauthorized Guest" },
    { value: "curfew_violation", label: "Curfew Violation" },
    { value: "mess_misbehavior", label: "Mess Misbehavior" },
    { value: "ragging", label: "Ragging" },
    { value: "other", label: "Other" },
];

const severityLevels = [
    { value: "minor", label: "Minor", color: "bg-yellow-100 text-yellow-800" },
    { value: "moderate", label: "Moderate", color: "bg-orange-100 text-orange-800" },
    { value: "severe", label: "Severe", color: "bg-red-100 text-red-800" },
    { value: "critical", label: "Critical", color: "bg-red-600 text-white" },
];

const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "under_review", label: "Under Review", color: "bg-blue-100 text-blue-800" },
    { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-800" },
    { value: "dismissed", label: "Dismissed", color: "bg-gray-100 text-gray-800" },
    { value: "escalated", label: "Escalated", color: "bg-red-100 text-red-800" },
];

export default function WardenViolationsPage() {
    const [violations, setViolations] = useState<Violation[]>([]);
    const [stats, setStats] = useState<ViolationStats | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
    const [userRole, setUserRole] = useState<string>("warden");
    const [assignedBuilding, setAssignedBuilding] = useState<string>("");
    const [assignedFloor, setAssignedFloor] = useState<number | null>(null);

    // File form state
    const [fileForm, setFileForm] = useState({
        studentId: "",
        violationType: "",
        severity: "",
        title: "",
        description: "",
        location: "",
        damageCost: "",
        incidentDate: new Date(),
    });

    // Update form state
    const [updateForm, setUpdateForm] = useState({
        status: "",
        actionTaken: "",
        fineAmount: "",
    });

    // Filter state
    const [filters, setFilters] = useState({
        search: "",
        violationType: "",
        severity: "",
        status: "",
        dateFrom: undefined as Date | undefined,
        dateTo: undefined as Date | undefined,
        floor: "",
    });

    useEffect(() => {
        initializePage();
    }, []);

    const initializePage = async () => {
        try {
            const user = await getUserFromTokenCookie();
            if (user) {
                setUserRole(user.role || "warden");
                setAssignedBuilding(user.allocated_building || "");
                const floor = user.allocated_floor ? Number(user.allocated_floor) : null;
                setAssignedFloor(floor);
                await fetchViolationsWithCache(user.role || "warden", user.allocated_building || "", floor);
                await fetchStudentsForBuilding(user.allocated_building || "", floor);
            }
        } catch (error) {
            console.error("Error initializing page:", error);
            toast.error("Failed to load page");
        } finally {
            setLoading(false);
        }
    };

    const fetchViolationsWithCache = async (role: string, building: string, floor: number | null, forceRefresh = false) => {
        const cacheKey = `warden_violations_${building}_${floor}`;

        if (!forceRefresh) {
            const cachedData = getFromCache<{ violations: Violation[], stats: ViolationStats }>(cacheKey, role as UserPayload["role"]);
            if (cachedData) {
                setViolations(cachedData.violations);
                setStats(cachedData.stats);
                return;
            }
        }

        try {
            const [violationsData, statsData] = await Promise.all([
                getViolationsByBuilding(building, floor?.toString()),
                getViolationStats(),
            ]);

            if (violationsData.success && violationsData.data) {
                setViolations(violationsData.data as Violation[]);
            }
            if (statsData.success && statsData.data) {
                setStats(statsData.data);
            }

            if (violationsData.success && statsData.success) {
                saveToCache(cacheKey, { violations: violationsData.data || [], stats: statsData.data || null });
            }
        } catch (error) {
            console.error("Error fetching violations:", error);
            toast.error("Failed to fetch violations");
        }
    };

    const fetchStudentsForBuilding = async (building: string, floor: number | null) => {
        try {
            const response = await fetch("/api/students");
            const allStudents = await response.json();

            // Filter students by building and floor
            const filteredStudents = allStudents.filter((student: any) => {
                if (student.allocated_building !== building) return false;
                if (floor !== null && student.allocated_floor !== floor) return false;
                return true;
            });

            setStudents(filteredStudents);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to fetch students");
        }
    };

    const handleFileViolation = async () => {
        try {
            if (!fileForm.studentId || !fileForm.violationType || !fileForm.severity || !fileForm.title) {
                toast.error("Please fill all required fields");
                return;
            }

            const user = await getUserFromTokenCookie();
            if (!user) {
                toast.error("User not authenticated");
                return;
            }

            // Find student details
            const student = students.find(s => s.id === parseInt(fileForm.studentId));
            if (!student) {
                toast.error("Student not found");
                return;
            }

            await fileViolation({
                student_id: student.id!,
                student_name: student.name || "",
                student_usn: student.usn_id || "",
                student_building: student.allocated_building || "",
                student_floor: student.allocated_floor || "",
                student_room: student.allocated_room || "",
                violation_type: fileForm.violationType as Violation["violation_type"],
                severity: fileForm.severity as Violation["severity"],
                title: fileForm.title,
                description: fileForm.description,
                location: fileForm.location,
                estimated_damage_cost: fileForm.damageCost ? parseFloat(fileForm.damageCost) : undefined,
                evidence_photo_url: undefined,
                status: "reported" as const,
                action_taken: undefined,
                fine_amount: undefined,
                fine_paid: false,
                reported_by_id: user.id!,
                reported_by_name: user.name || "",
                reported_by_role: user.role as "admin" | "warden" | "student",
                reviewed_by_id: undefined,
                reviewed_by_name: undefined,
                incident_date: fileForm.incidentDate.toISOString().split('T')[0],
                resolved_at: undefined,
            });

            toast.success("Violation filed successfully");
            setIsFileDialogOpen(false);
            setFileForm({
                studentId: "",
                violationType: "",
                severity: "",
                title: "",
                description: "",
                location: "",
                damageCost: "",
                incidentDate: new Date(),
            });
            await fetchViolationsWithCache(userRole, assignedBuilding, assignedFloor, true);
        } catch (error) {
            console.error("Error filing violation:", error);
            toast.error("Failed to file violation");
        }
    };

    const handleUpdateViolation = async () => {
        if (!selectedViolation || !selectedViolation.id) return;

        try {
            await updateViolation(selectedViolation.id, {
                status: updateForm.status || undefined,
                action_taken: updateForm.actionTaken || undefined,
                fine_amount: updateForm.fineAmount ? parseFloat(updateForm.fineAmount) : undefined,
            });

            toast.success("Violation updated successfully");
            setIsUpdateDialogOpen(false);
            setSelectedViolation(null);
            setUpdateForm({ status: "", actionTaken: "", fineAmount: "" });
            await fetchViolationsWithCache(userRole, assignedBuilding, assignedFloor, true);
        } catch (error) {
            console.error("Error updating violation:", error);
            toast.error("Failed to update violation");
        }
    };

    const handleDeleteViolation = async (id: number) => {
        if (!confirm("Are you sure you want to delete this violation?")) return;

        try {
            await deleteViolation(id);
            toast.success("Violation deleted successfully");
            await fetchViolationsWithCache(userRole, assignedBuilding, assignedFloor, true);
        } catch (error) {
            console.error("Error deleting violation:", error);
            toast.error("Failed to delete violation");
        }
    };

    const openUpdateDialog = (violation: Violation) => {
        setSelectedViolation(violation);
        setUpdateForm({
            status: violation.status,
            actionTaken: violation.action_taken || "",
            fineAmount: violation.fine_amount?.toString() || "",
        });
        setIsUpdateDialogOpen(true);
    };

    const openViewDialog = (violation: Violation) => {
        setSelectedViolation(violation);
        setIsViewDialogOpen(true);
    };

    const filteredViolations = violations.filter((violation) => {
        if (filters.search) {
            const search = filters.search.toLowerCase();
            if (
                !violation.student_name?.toLowerCase().includes(search) &&
                !violation.student_usn?.toLowerCase().includes(search) &&
                !violation.title.toLowerCase().includes(search) &&
                !violation.description?.toLowerCase().includes(search)
            ) {
                return false;
            }
        }
        if (filters.violationType && violation.violation_type !== filters.violationType) return false;
        if (filters.severity && violation.severity !== filters.severity) return false;
        if (filters.status && violation.status !== filters.status) return false;
        if (filters.floor && violation.student_floor?.toString() !== filters.floor) return false;
        if (filters.dateFrom && new Date(violation.incident_date) < filters.dateFrom) return false;
        if (filters.dateTo && new Date(violation.incident_date) > filters.dateTo) return false;
        return true;
    });

    const buildingStats = {
        total: filteredViolations.length,
        critical: filteredViolations.filter((v) => v.severity === "critical").length,
        severe: filteredViolations.filter((v) => v.severity === "severe").length,
        totalFines: filteredViolations.reduce((sum, v) => sum + (v.fine_amount || 0), 0),
        finesCollected: filteredViolations.reduce((sum, v) => sum + (v.fine_paid ? v.fine_amount || 0 : 0), 0),
        pending: filteredViolations.filter((v) => v.status === "reported").length,
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Violations Management</h1>
                    <p className="text-muted-foreground">
                        {assignedBuilding} {assignedFloor !== null ? `- Floor ${assignedFloor}` : "(All Floors)"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => fetchViolationsWithCache(userRole, assignedBuilding, assignedFloor, true)}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                File Violation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>File New Violation</DialogTitle>
                                <DialogDescription>
                                    Record a violation for a student in your building
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Student *</Label>
                                    <Select
                                        value={fileForm.studentId}
                                        onValueChange={(value) =>
                                            setFileForm({ ...fileForm, studentId: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id.toString()}>
                                                    {student.name} ({student.usn_id}) - Room {student.allocated_room}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Violation Type *</Label>
                                    <Select
                                        value={fileForm.violationType}
                                        onValueChange={(value) =>
                                            setFileForm({ ...fileForm, violationType: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {violationTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Severity *</Label>
                                    <Select
                                        value={fileForm.severity}
                                        onValueChange={(value) =>
                                            setFileForm({ ...fileForm, severity: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select severity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {severityLevels.map((level) => (
                                                <SelectItem key={level.value} value={level.value}>
                                                    {level.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Title *</Label>
                                    <Input
                                        value={fileForm.title}
                                        onChange={(e) =>
                                            setFileForm({ ...fileForm, title: e.target.value })
                                        }
                                        placeholder="Brief description of violation"
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={fileForm.description}
                                        onChange={(e) =>
                                            setFileForm({ ...fileForm, description: e.target.value })
                                        }
                                        placeholder="Detailed description"
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <Label>Location</Label>
                                    <Input
                                        value={fileForm.location}
                                        onChange={(e) =>
                                            setFileForm({ ...fileForm, location: e.target.value })
                                        }
                                        placeholder="Where the incident occurred"
                                    />
                                </div>
                                <div>
                                    <Label>Damage Cost Estimate (₹)</Label>
                                    <Input
                                        type="number"
                                        value={fileForm.damageCost}
                                        onChange={(e) =>
                                            setFileForm({ ...fileForm, damageCost: e.target.value })
                                        }
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label>Incident Date *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !fileForm.incidentDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {fileForm.incidentDate ? (
                                                    format(fileForm.incidentDate, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={fileForm.incidentDate}
                                                onSelect={(date) =>
                                                    setFileForm({ ...fileForm, incidentDate: date || new Date() })
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsFileDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleFileViolation}>File Violation</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{buildingStats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Critical</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{buildingStats.critical}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Severe</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{buildingStats.severe}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{buildingStats.totalFines}</div>
                        <p className="text-xs text-muted-foreground">
                            ₹{buildingStats.finesCollected} collected
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{buildingStats.pending}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <Label>Search</Label>
                            <Input
                                placeholder="Student name, USN, title..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Violation Type</Label>
                            <Select
                                value={filters.violationType}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, violationType: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All types</SelectItem>
                                    {violationTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Severity</Label>
                            <Select
                                value={filters.severity}
                                onValueChange={(value) => setFilters({ ...filters, severity: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All severities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All severities</SelectItem>
                                    {severityLevels.map((level) => (
                                        <SelectItem key={level.value} value={level.value}>
                                            {level.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => setFilters({ ...filters, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All statuses</SelectItem>
                                    {statusOptions.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {assignedFloor === null && (
                            <div>
                                <Label>Floor</Label>
                                <Input
                                    type="number"
                                    placeholder="Filter by floor"
                                    value={filters.floor}
                                    onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
                                />
                            </div>
                        )}
                        <div>
                            <Label>Date From</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={filters.dateFrom}
                                        onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label>Date To</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={filters.dateTo}
                                        onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    setFilters({
                                        search: "",
                                        violationType: "",
                                        severity: "",
                                        status: "",
                                        floor: "",
                                        dateFrom: undefined,
                                        dateTo: undefined,
                                    })
                                }
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Violations Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Violations ({filteredViolations.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Fine</TableHead>
                                <TableHead>Reported By</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredViolations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                                        No violations found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredViolations.map((violation) => (
                                    <TableRow key={violation.id}>
                                        <TableCell>
                                            {format(new Date(violation.incident_date), "dd MMM yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{violation.student_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {violation.student_usn} - Room {violation.student_room}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {violationTypes.find((t) => t.value === violation.violation_type)?.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    severityLevels.find((s) => s.value === violation.severity)?.color
                                                }
                                            >
                                                {severityLevels.find((s) => s.value === violation.severity)?.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{violation.title}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    statusOptions.find((s) => s.value === violation.status)?.color
                                                }
                                            >
                                                {statusOptions.find((s) => s.value === violation.status)?.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {violation.fine_amount ? (
                                                <div>
                                                    <div>₹{violation.fine_amount}</div>
                                                    <Badge
                                                        variant={violation.fine_paid ? "default" : "secondary"}
                                                        className="text-xs"
                                                    >
                                                        {violation.fine_paid ? "Paid" : "Pending"}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                        <TableCell>{violation.reported_by_name}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openViewDialog(violation)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openUpdateDialog(violation)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => violation.id && handleDeleteViolation(violation.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Violation Details</DialogTitle>
                    </DialogHeader>
                    {selectedViolation && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Student</Label>
                                    <p className="font-medium">
                                        {selectedViolation.student_name} ({selectedViolation.student_usn})
                                    </p>
                                </div>
                                <div>
                                    <Label>Room</Label>
                                    <p className="font-medium">
                                        {selectedViolation.student_building} - Floor {selectedViolation.student_floor} - Room {selectedViolation.student_room}
                                    </p>
                                </div>
                                <div>
                                    <Label>Violation Type</Label>
                                    <p className="font-medium">
                                        {violationTypes.find((t) => t.value === selectedViolation.violation_type)?.label}
                                    </p>
                                </div>
                                <div>
                                    <Label>Severity</Label>
                                    <Badge
                                        className={
                                            severityLevels.find((s) => s.value === selectedViolation.severity)?.color
                                        }
                                    >
                                        {severityLevels.find((s) => s.value === selectedViolation.severity)?.label}
                                    </Badge>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Badge
                                        className={
                                            statusOptions.find((s) => s.value === selectedViolation.status)?.color
                                        }
                                    >
                                        {statusOptions.find((s) => s.value === selectedViolation.status)?.label}
                                    </Badge>
                                </div>
                                <div>
                                    <Label>Incident Date</Label>
                                    <p className="font-medium">
                                        {format(new Date(selectedViolation.incident_date), "PPP")}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Label>Title</Label>
                                <p className="font-medium">{selectedViolation.title}</p>
                            </div>
                            <div>
                                <Label>Description</Label>
                                <p className="text-sm">{selectedViolation.description || "N/A"}</p>
                            </div>
                            <div>
                                <Label>Location</Label>
                                <p className="text-sm">{selectedViolation.location || "N/A"}</p>
                            </div>
                            {selectedViolation.estimated_damage_cost && (
                                <div>
                                    <Label>Damage Cost</Label>
                                    <p className="font-medium">₹{selectedViolation.estimated_damage_cost}</p>
                                </div>
                            )}
                            <div>
                                <Label>Reported By</Label>
                                <p className="font-medium">{selectedViolation.reported_by_name}</p>
                            </div>
                            {selectedViolation.action_taken && (
                                <div>
                                    <Label>Action Taken</Label>
                                    <p className="text-sm">{selectedViolation.action_taken}</p>
                                </div>
                            )}
                            {selectedViolation.fine_amount && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Fine Amount</Label>
                                        <p className="font-medium">₹{selectedViolation.fine_amount}</p>
                                    </div>
                                    <div>
                                        <Label>Payment Status</Label>
                                        <Badge variant={selectedViolation.fine_paid ? "default" : "secondary"}>
                                            {selectedViolation.fine_paid ? "Paid" : "Pending"}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Update Dialog */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Violation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Status</Label>
                            <Select
                                value={updateForm.status}
                                onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Action Taken</Label>
                            <Textarea
                                value={updateForm.actionTaken}
                                onChange={(e) =>
                                    setUpdateForm({ ...updateForm, actionTaken: e.target.value })
                                }
                                placeholder="Describe the action taken"
                                rows={4}
                            />
                        </div>
                        <div>
                            <Label>Fine Amount (₹)</Label>
                            <Input
                                type="number"
                                value={updateForm.fineAmount}
                                onChange={(e) =>
                                    setUpdateForm({ ...updateForm, fineAmount: e.target.value })
                                }
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateViolation}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
