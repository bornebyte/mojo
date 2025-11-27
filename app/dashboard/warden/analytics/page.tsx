"use client";
import { useContext, useEffect, useState } from "react";
import UserContext from "@/app/context/UserContext";
import { UserPayload } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    getAllStudents,
    getAttendanceHistory,
    getAttendanceStats
} from "../attendance/actions";
import { toast } from "sonner";
import {
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    Calendar as CalendarIcon,
    Download,
    Filter,
    BarChart3,
    PieChart,
    Activity
} from "lucide-react";
import { format } from "date-fns";

type Stats = {
    total_students: number;
    present: number;
    absent: number;
    on_leave: number;
    marked: number;
    unmarked: number;
    attendance_rate: number;
};

type HistoryEntry = {
    date: string;
    status: string;
    count: string;
};

type StudentWithAttendance = UserPayload & {
    attendance_count?: number;
    attendance_rate?: number;
    last_present?: string;
};

const AnalyticsPage = () => {
    const user = useContext(UserContext)?.user as UserPayload;
    const [students, setStudents] = useState<StudentWithAttendance[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState(30);
    const [floorFilter, setFloorFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("name");

    useEffect(() => {
        if (user) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsRes, statsRes, historyRes] = await Promise.all([
                getAllStudents(user),
                getAttendanceStats(user),
                getAttendanceHistory(user, dateRange)
            ]);

            if (studentsRes.success) {
                setStudents(studentsRes.data as StudentWithAttendance[]);
            }

            if (statsRes.success) {
                setStats(statsRes.data as Stats);
            }

            if (historyRes.success) {
                setHistory(historyRes.data as HistoryEntry[]);
            }
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            toast.error("Failed to load analytics data");
        } finally {
            setLoading(false);
        }
    };

    const getFloorList = () => {
        if (!user?.assigned_floor) return [];
        try {
            return JSON.parse(user.assigned_floor);
        } catch {
            return [];
        }
    };

    const getFilteredStudents = () => {
        let filtered = [...students];

        if (floorFilter !== "all") {
            filtered = filtered.filter(s => s.allocated_floor === floorFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return (a.name || "").localeCompare(b.name || "");
                case "usn":
                    return (a.usn_id || "").localeCompare(b.usn_id || "");
                case "floor":
                    return (a.allocated_floor || "").localeCompare(b.allocated_floor || "");
                case "room":
                    return (a.allocated_room || "").localeCompare(b.allocated_room || "");
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const getFloorWiseStats = () => {
        const floors = getFloorList();
        return floors.map((floor: number) => {
            const floorStudents = students.filter(s => s.allocated_floor === floor.toString());
            return {
                floor,
                count: floorStudents.length
            };
        });
    };

    const getRoomWiseStats = () => {
        const rooms: { [key: string]: number } = {};
        students.forEach(student => {
            if (student.allocated_room) {
                rooms[student.allocated_room] = (rooms[student.allocated_room] || 0) + 1;
            }
        });
        return Object.entries(rooms)
            .map(([room, count]) => ({ room, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    };

    const getAttendanceTrend = () => {
        const last7Days: { [key: string]: { present: number; absent: number; on_leave: number; total: number } } = {};

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days[dateStr] = { present: 0, absent: 0, on_leave: 0, total: 0 };
        }

        history.forEach((entry) => {
            const dateStr = entry.date;
            if (last7Days[dateStr]) {
                const count = parseInt(entry.count);
                if (entry.status === 'present') last7Days[dateStr].present = count;
                else if (entry.status === 'absent') last7Days[dateStr].absent = count;
                else if (entry.status === 'on_leave') last7Days[dateStr].on_leave = count;
            }
        });

        return Object.entries(last7Days).map(([date, counts]) => {
            counts.total = counts.present + counts.absent + counts.on_leave;
            return {
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                ...counts,
                rate: counts.total > 0 ? ((counts.present / counts.total) * 100).toFixed(1) : 0
            };
        });
    };

    const exportToCSV = () => {
        const filteredStudents = getFilteredStudents();
        const headers = ["Name", "USN", "Email", "Phone", "Building", "Floor", "Room"];
        const rows = filteredStudents.map(s => [
            s.name || "",
            s.usn_id || "",
            s.email || "",
            s.phone || "",
            s.allocated_building || "",
            s.allocated_floor || "",
            s.allocated_room || ""
        ]);

        const csv = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `students-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Data exported successfully");
    };

    const trendData = getAttendanceTrend();
    const floorStats = getFloorWiseStats();
    const roomStats = getRoomWiseStats();
    const filteredStudents = getFilteredStudents();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Activity className="h-8 w-8" />
                        Analytics & Insights
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Detailed analysis of student data and attendance patterns
                    </p>
                </div>
                <Button onClick={exportToCSV} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters & Controls
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Range</label>
                            <Select value={dateRange.toString()} onValueChange={(v) => setDateRange(parseInt(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Last 7 Days</SelectItem>
                                    <SelectItem value="14">Last 14 Days</SelectItem>
                                    <SelectItem value="30">Last 30 Days</SelectItem>
                                    <SelectItem value="60">Last 60 Days</SelectItem>
                                    <SelectItem value="90">Last 90 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Filter by Floor</label>
                            <Select value={floorFilter} onValueChange={setFloorFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Floors</SelectItem>
                                    {getFloorList().map((floor: number) => (
                                        <SelectItem key={floor} value={floor.toString()}>
                                            Floor {floor}
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
                                    <SelectItem value="floor">Floor</SelectItem>
                                    <SelectItem value="room">Room</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStudents.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {floorFilter === "all" ? "All floors" : `Floor ${floorFilter}`}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Attendance Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.attendance_rate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            Last {dateRange} days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Floors Managed</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getFloorList().length}</div>
                        <p className="text-xs text-muted-foreground">
                            In {user?.assigned_building}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roomStats.length}</div>
                        <p className="text-xs text-muted-foreground">
                            With students
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Attendance Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Attendance Trend (Last 7 Days)
                        </CardTitle>
                        <CardDescription>Daily attendance rate percentage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {trendData.map((day, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{day.date}</span>
                                        <span className="text-muted-foreground">{day.rate}%</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all"
                                            style={{ width: `${day.rate}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Floor Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Floor-wise Distribution
                        </CardTitle>
                        <CardDescription>Students per floor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {floorStats.map((floor: { floor: number; count: number }, index: string) => {
                                const percentage = students.length > 0 ? (floor.count / students.length) * 100 : 0;
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Floor {floor.floor}</span>
                                            <span className="text-muted-foreground">
                                                {floor.count} ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Rooms by Occupancy */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Top Rooms by Occupancy
                        </CardTitle>
                        <CardDescription>Most occupied rooms</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {roomStats.slice(0, 7).map((room, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium">{room.room}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{room.count} students</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Insights */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Insights</CardTitle>
                        <CardDescription>Key observations and metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Best Performing Floor</p>
                                    <p className="text-xs text-muted-foreground">
                                        Floor {floorStats.reduce((max: { floor: number; count: number }, floor: { floor: number; count: number }) => floor.count > max.count ? floor : max, floorStats[0])?.floor} with {floorStats.reduce((max: { floor: number; count: number }, floor: { floor: number; count: number }) => floor.count > max.count ? floor : max, floorStats[0])?.count} students
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                                    <Users className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Average per Floor</p>
                                    <p className="text-xs text-muted-foreground">
                                        {floorStats.length > 0 ? (students.length / floorStats.length).toFixed(1) : 0} students per floor
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                                    <Building2 className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Room Utilization</p>
                                    <p className="text-xs text-muted-foreground">
                                        {roomStats.length} rooms currently occupied
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;
