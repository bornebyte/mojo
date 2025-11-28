"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, XCircle, Plane, RefreshCw, TrendingUp } from "lucide-react"
import { getStudentAttendance } from "./actions"
import { toast } from "sonner"
import UserContext from "@/app/context/UserContext"
import { UserPayload } from "@/lib/types"

type AttendanceRecord = {
    id: number
    status: "present" | "absent" | "on_leave"
    reason?: string
    marked_by_name?: string
    timestamp: Date
    allocated_building?: string
    allocated_floor?: string
}

type AttendanceStats = {
    present_count: number
    absent_count: number
    leave_count: number
    total_count: number
}

const StudentAttendancePage = () => {
    const user = React.useContext(UserContext)?.user as UserPayload
    const [attendance, setAttendance] = React.useState<AttendanceRecord[]>([])
    const [stats, setStats] = React.useState<AttendanceStats>({
        present_count: 0,
        absent_count: 0,
        leave_count: 0,
        total_count: 0
    })
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        fetchAttendance()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchAttendance = async () => {
        if (!user?.id) return

        setLoading(true)
        try {
            const result = await getStudentAttendance(user.id)
            if (result.success) {
                setAttendance(result.data as AttendanceRecord[])
                setStats(result.stats as AttendanceStats)
            } else {
                toast.error(result.message || "Failed to fetch attendance")
            }
        } catch (error) {
            toast.error("Failed to fetch attendance")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const calculateAttendancePercentage = () => {
        if (stats.total_count === 0) return 0
        return Math.round((stats.present_count / stats.total_count) * 100)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "present":
                return "bg-green-500/10 text-green-500 border-green-500/20"
            case "absent":
                return "bg-red-500/10 text-red-500 border-red-500/20"
            case "on_leave":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            default:
                return ""
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "present":
                return <CheckCircle2 className="h-4 w-4" />
            case "absent":
                return <XCircle className="h-4 w-4" />
            case "on_leave":
                return <Plane className="h-4 w-4" />
            default:
                return null
        }
    }

    const attendancePercentage = calculateAttendancePercentage()

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">My Attendance</h1>
                    <p className="text-muted-foreground mt-2">
                        View your attendance history and statistics
                    </p>
                </div>
                <Button onClick={fetchAttendance} variant="outline" size="sm" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_count}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Present</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.present_count}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Absent</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.absent_count}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                            <Plane className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.leave_count}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Percentage */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Attendance Percentage</CardTitle>
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="w-full bg-secondary rounded-full h-4">
                                <div
                                    className={`h-4 rounded-full transition-all ${attendancePercentage >= 75
                                            ? "bg-green-500"
                                            : attendancePercentage >= 50
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                        }`}
                                    style={{ width: `${attendancePercentage}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-2xl font-bold">{attendancePercentage}%</div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        {attendancePercentage >= 75
                            ? "Excellent attendance!"
                            : attendancePercentage >= 50
                                ? "Good, but try to improve"
                                : "Attendance is low, please improve"}
                    </p>
                </CardContent>
            </Card>

            {/* Attendance Records */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : attendance.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No attendance records yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {attendance.map((record) => (
                                <div
                                    key={record.id}
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={getStatusColor(record.status)}>
                                                <span className="flex items-center gap-1">
                                                    {getStatusIcon(record.status)}
                                                    {record.status.replace("_", " ").toUpperCase()}
                                                </span>
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(record.timestamp).toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric"
                                                })}
                                            </span>
                                        </div>
                                        {record.reason && (
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-medium">Reason:</span> {record.reason}
                                            </p>
                                        )}
                                        {record.marked_by_name && (
                                            <p className="text-xs text-muted-foreground">
                                                Marked by: {record.marked_by_name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(record.timestamp).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default StudentAttendancePage
