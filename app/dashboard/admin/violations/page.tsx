"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { getUserFromTokenCookie } from "@/app/actions"
import {
    getAllViolations,
    fileViolation,
    updateViolation,
    deleteViolation,
    getViolationStats,
} from "@/app/dashboard/violations/actions"
import { Violation, ViolationStats, UserPayload } from "@/lib/types"
import {
    AlertTriangle,
    Plus,
    RefreshCw,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    DollarSign,
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react"
import { format } from "date-fns"
import { getFromCache, saveToCache } from "@/lib/cache-utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function AdminViolationsPage() {
    const [violations, setViolations] = useState<Violation[]>([])
    const [filteredViolations, setFilteredViolations] = useState<Violation[]>([])
    const [stats, setStats] = useState<ViolationStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<UserPayload | null>(null)

    // Dialog states
    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
    const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null)

    // Filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<string>("all")
    const [filterSeverity, setFilterSeverity] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined)

    // Form states
    const [students, setStudents] = useState<UserPayload[]>([])
    const [formData, setFormData] = useState({
        student_id: "",
        violation_type: "",
        severity: "moderate",
        title: "",
        description: "",
        location: "",
        estimated_damage_cost: "",
        incident_date: new Date().toISOString().split("T")[0],
    })

    const [updateData, setUpdateData] = useState({
        status: "",
        action_taken: "",
        fine_amount: "",
    })

    useEffect(() => {
        const init = async () => {
            const userData = await getUserFromTokenCookie()
            setUser(userData as UserPayload)
            await fetchViolationsWithCache()
            await fetchStatsWithCache()
            await fetchStudents()
        }
        init()
    }, [])

    useEffect(() => {
        applyFilters()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, filterType, filterSeverity, filterStatus, dateFrom, dateTo, violations])

    const fetchStudents = async () => {
        try {
            const response = await fetch("/api/students") // You'll need to create this API route
            if (response.ok) {
                const data = await response.json()
                setStudents(data)
            }
        } catch (error) {
            console.error("Error fetching students:", error)
        }
    }

    const fetchViolationsWithCache = async (forceRefresh = false) => {
        setLoading(true)
        try {
            if (!forceRefresh) {
                const cached = getFromCache<Violation[]>("admin_violations", user?.role)
                if (cached) {
                    setViolations(cached)
                    setLoading(false)
                    return
                }
            }

            const result = await getAllViolations()
            if (result.success && result.data) {
                setViolations(result.data as Violation[])
                saveToCache("admin_violations", result.data)
            }
        } catch (error) {
            toast.error("Failed to fetch violations")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchStatsWithCache = async (forceRefresh = false) => {
        try {
            if (!forceRefresh) {
                const cached = getFromCache<ViolationStats>("violation_stats", user?.role)
                if (cached) {
                    setStats(cached)
                    return
                }
            }

            const result = await getViolationStats()
            if (result.success && result.data) {
                setStats(result.data)
                saveToCache("violation_stats", result.data)
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
        }
    }

    const handleRefresh = async () => {
        await fetchViolationsWithCache(true)
        await fetchStatsWithCache(true)
        toast.success("Violations refreshed")
    }

    const applyFilters = () => {
        let filtered = [...violations]

        if (searchQuery) {
            filtered = filtered.filter(
                (v) =>
                    v.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    v.student_usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    v.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (filterType !== "all") {
            filtered = filtered.filter((v) => v.violation_type === filterType)
        }

        if (filterSeverity !== "all") {
            filtered = filtered.filter((v) => v.severity === filterSeverity)
        }

        if (filterStatus !== "all") {
            filtered = filtered.filter((v) => v.status === filterStatus)
        }

        if (dateFrom) {
            filtered = filtered.filter(
                (v) => new Date(v.incident_date) >= dateFrom
            )
        }

        if (dateTo) {
            filtered = filtered.filter(
                (v) => new Date(v.incident_date) <= dateTo
            )
        }

        setFilteredViolations(filtered)
    }

    const handleFileViolation = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user || !formData.student_id || !formData.violation_type || !formData.title) {
            toast.error("Please fill in all required fields")
            return
        }

        const student = students.find((s) => s.id === parseInt(formData.student_id))
        if (!student) {
            toast.error("Student not found")
            return
        }

        try {
            const result = await fileViolation({
                student_id: student.id!,
                student_name: student.name!,
                student_usn: student.usn_id!,
                student_building: student.allocated_building!,
                student_floor: student.allocated_floor!,
                student_room: student.allocated_room!,
                violation_type: formData.violation_type as any,
                severity: formData.severity as any,
                title: formData.title,
                description: formData.description,
                location: formData.location || null,
                estimated_damage_cost: formData.estimated_damage_cost
                    ? parseFloat(formData.estimated_damage_cost)
                    : null,
                evidence_photo_url: null,
                status: "reported",
                reported_by_id: user.id!,
                reported_by_name: user.name!,
                reported_by_role: user.role as any,
                incident_date: formData.incident_date,
            })

            if (result.success) {
                toast.success("Violation filed successfully")
                setFileDialogOpen(false)
                setFormData({
                    student_id: "",
                    violation_type: "",
                    severity: "moderate",
                    title: "",
                    description: "",
                    location: "",
                    estimated_damage_cost: "",
                    incident_date: new Date().toISOString().split("T")[0],
                })
                await fetchViolationsWithCache(true)
                await fetchStatsWithCache(true)
            } else {
                toast.error(result.message || "Failed to file violation")
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        }
    }

    const handleUpdateViolation = async () => {
        if (!selectedViolation || !updateData.status) {
            toast.error("Please select a status")
            return
        }

        try {
            const result = await updateViolation(selectedViolation.id!, {
                status: updateData.status,
                action_taken: updateData.action_taken || undefined,
                fine_amount: updateData.fine_amount
                    ? parseFloat(updateData.fine_amount)
                    : undefined,
                reviewed_by_id: user?.id,
                reviewed_by_name: user?.name,
                resolved_at: updateData.status === "resolved" ? new Date().toISOString() : undefined,
            })

            if (result.success) {
                toast.success("Violation updated successfully")
                setUpdateDialogOpen(false)
                await fetchViolationsWithCache(true)
                await fetchStatsWithCache(true)
            } else {
                toast.error(result.message || "Failed to update violation")
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this violation?")) return

        try {
            const result = await deleteViolation(id)
            if (result.success) {
                toast.success("Violation deleted")
                await fetchViolationsWithCache(true)
                await fetchStatsWithCache(true)
            } else {
                toast.error(result.message || "Failed to delete")
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "minor":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case "moderate":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case "severe":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
            case "critical":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            default:
                return ""
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "reported":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case "under_review":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case "action_taken":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            case "resolved":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case "dismissed":
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            default:
                return ""
        }
    }

    const getViolationTypeLabel = (type: string) => {
        return type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    }

    if (loading && violations.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Violations Management</h1>
                    <p className="text-muted-foreground">
                        Track and manage hostel rule violations and incidents
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleRefresh} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                File Violation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>File a Violation</DialogTitle>
                                <DialogDescription>
                                    Report a hostel rule violation or incident
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleFileViolation} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Student *</Label>
                                    <Select
                                        value={formData.student_id}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, student_id: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id!.toString()}>
                                                    {student.name} ({student.usn_id}) - Room {student.allocated_room}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Violation Type *</Label>
                                        <Select
                                            value={formData.violation_type}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, violation_type: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="smoking">Smoking</SelectItem>
                                                <SelectItem value="alcohol">Alcohol</SelectItem>
                                                <SelectItem value="property_damage">Property Damage</SelectItem>
                                                <SelectItem value="noise_complaint">Noise Complaint</SelectItem>
                                                <SelectItem value="unauthorized_guest">Unauthorized Guest</SelectItem>
                                                <SelectItem value="curfew_violation">Curfew Violation</SelectItem>
                                                <SelectItem value="mess_misbehavior">Mess Misbehavior</SelectItem>
                                                <SelectItem value="ragging">Ragging</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Severity *</Label>
                                        <Select
                                            value={formData.severity}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, severity: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="minor">Minor</SelectItem>
                                                <SelectItem value="moderate">Moderate</SelectItem>
                                                <SelectItem value="severe">Severe</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Title *</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        placeholder="Brief description of the incident"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Description *</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        placeholder="Detailed description of the violation..."
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Location</Label>
                                        <Input
                                            value={formData.location}
                                            onChange={(e) =>
                                                setFormData({ ...formData, location: e.target.value })
                                            }
                                            placeholder="Where did this occur?"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Damage Cost (₹)</Label>
                                        <Input
                                            type="number"
                                            value={formData.estimated_damage_cost}
                                            onChange={(e) =>
                                                setFormData({ ...formData, estimated_damage_cost: e.target.value })
                                            }
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Incident Date *</Label>
                                    <Input
                                        type="date"
                                        value={formData.incident_date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, incident_date: e.target.value })
                                        }
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setFileDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">File Violation</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Total Violations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_violations}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Critical</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {stats.by_severity.critical}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Severe</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {stats.by_severity.severe}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Total Fines
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats.total_fines.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Collected: ₹{stats.fines_collected.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {stats.by_status.reported + stats.by_status.under_review}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search student, title..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Violation Type</Label>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="smoking">Smoking</SelectItem>
                                    <SelectItem value="alcohol">Alcohol</SelectItem>
                                    <SelectItem value="property_damage">Property Damage</SelectItem>
                                    <SelectItem value="noise_complaint">Noise Complaint</SelectItem>
                                    <SelectItem value="unauthorized_guest">Unauthorized Guest</SelectItem>
                                    <SelectItem value="curfew_violation">Curfew Violation</SelectItem>
                                    <SelectItem value="mess_misbehavior">Mess Misbehavior</SelectItem>
                                    <SelectItem value="ragging">Ragging</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Severity</Label>
                            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="minor">Minor</SelectItem>
                                    <SelectItem value="moderate">Moderate</SelectItem>
                                    <SelectItem value="severe">Severe</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="reported">Reported</SelectItem>
                                    <SelectItem value="under_review">Under Review</SelectItem>
                                    <SelectItem value="action_taken">Action Taken</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="dismissed">Dismissed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Date From</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Date To</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2 flex items-end">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setSearchQuery("")
                                    setFilterType("all")
                                    setFilterSeverity("all")
                                    setFilterStatus("all")
                                    setDateFrom(undefined)
                                    setDateTo(undefined)
                                }}
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
                    <div className="overflow-x-auto">
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
                                                {format(new Date(violation.incident_date), "MMM dd, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{violation.student_name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {violation.student_usn}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Room {violation.student_room}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getViolationTypeLabel(violation.violation_type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getSeverityColor(violation.severity)}>
                                                    {violation.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="truncate">{violation.title}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(violation.status)}>
                                                    {violation.status.replace("_", " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {violation.fine_amount ? (
                                                    <div>
                                                        <div className="font-medium">₹{violation.fine_amount}</div>
                                                        {violation.fine_paid && (
                                                            <Badge variant="outline" className="text-xs bg-green-100">
                                                                Paid
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{violation.reported_by_name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {violation.reported_by_role}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedViolation(violation)
                                                            setViewDialogOpen(true)
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedViolation(violation)
                                                            setUpdateData({
                                                                status: violation.status,
                                                                action_taken: violation.action_taken || "",
                                                                fine_amount: violation.fine_amount?.toString() || "",
                                                            })
                                                            setUpdateDialogOpen(true)
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(violation.id!)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
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

            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Violation Details</DialogTitle>
                    </DialogHeader>
                    {selectedViolation && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Student</Label>
                                    <p className="font-medium">{selectedViolation.student_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedViolation.student_usn}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Room</Label>
                                    <p className="font-medium">
                                        {selectedViolation.student_building} - Floor{" "}
                                        {selectedViolation.student_floor} - Room{" "}
                                        {selectedViolation.student_room}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Type</Label>
                                    <p className="font-medium">
                                        {getViolationTypeLabel(selectedViolation.violation_type)}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Severity</Label>
                                    <Badge className={getSeverityColor(selectedViolation.severity)}>
                                        {selectedViolation.severity}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Title</Label>
                                <p className="font-medium">{selectedViolation.title}</p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Description</Label>
                                <p className="text-sm">{selectedViolation.description}</p>
                            </div>

                            {selectedViolation.location && (
                                <div>
                                    <Label className="text-muted-foreground">Location</Label>
                                    <p className="text-sm">{selectedViolation.location}</p>
                                </div>
                            )}

                            {selectedViolation.estimated_damage_cost && (
                                <div>
                                    <Label className="text-muted-foreground">Estimated Damage Cost</Label>
                                    <p className="font-medium">
                                        ₹{selectedViolation.estimated_damage_cost}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Incident Date</Label>
                                    <p className="text-sm">
                                        {format(new Date(selectedViolation.incident_date), "PPP")}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <Badge className={getStatusColor(selectedViolation.status)}>
                                        {selectedViolation.status.replace("_", " ")}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Reported By</Label>
                                <p className="text-sm">
                                    {selectedViolation.reported_by_name} ({selectedViolation.reported_by_role})
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {selectedViolation.created_at &&
                                        format(new Date(selectedViolation.created_at), "PPP p")}
                                </p>
                            </div>

                            {selectedViolation.action_taken && (
                                <div>
                                    <Label className="text-muted-foreground">Action Taken</Label>
                                    <p className="text-sm">{selectedViolation.action_taken}</p>
                                </div>
                            )}

                            {selectedViolation.fine_amount && (
                                <div>
                                    <Label className="text-muted-foreground">Fine Amount</Label>
                                    <p className="font-medium">₹{selectedViolation.fine_amount}</p>
                                    {selectedViolation.fine_paid && (
                                        <Badge variant="outline" className="mt-1 bg-green-100">
                                            Paid
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {selectedViolation.reviewed_by_name && (
                                <div>
                                    <Label className="text-muted-foreground">Reviewed By</Label>
                                    <p className="text-sm">{selectedViolation.reviewed_by_name}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Update Dialog */}
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Update Violation</DialogTitle>
                        <DialogDescription>
                            Update the status and add action details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Status *</Label>
                            <Select
                                value={updateData.status}
                                onValueChange={(value) =>
                                    setUpdateData({ ...updateData, status: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reported">Reported</SelectItem>
                                    <SelectItem value="under_review">Under Review</SelectItem>
                                    <SelectItem value="action_taken">Action Taken</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="dismissed">Dismissed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Action Taken</Label>
                            <Textarea
                                value={updateData.action_taken}
                                onChange={(e) =>
                                    setUpdateData({ ...updateData, action_taken: e.target.value })
                                }
                                placeholder="Describe the action taken..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Fine Amount (₹)</Label>
                            <Input
                                type="number"
                                value={updateData.fine_amount}
                                onChange={(e) =>
                                    setUpdateData({ ...updateData, fine_amount: e.target.value })
                                }
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateViolation}>Update Violation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
