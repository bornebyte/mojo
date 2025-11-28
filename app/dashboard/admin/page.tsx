"use client";
import { useContext, useEffect, useState } from "react";
import UserContext from "@/app/context/UserContext";
import { UserPayload, Announcement } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Building2,
  TrendingUp,
  MessageSquare,
  UtensilsCrossed,
  Megaphone,
  UserCheck,
  UserX,
  Plane,
  Star,
  Activity,
  BarChart3,
  PieChart,
  AlertCircle,
  Bell,
  Plus,
  RefreshCw,
  Download,
  Calendar,
  Award,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import {
  getAdminDashboardStats,
  getAttendanceTrends,
  getBuildingWiseAttendance,
  getFeedbackCategoryStats,
  getRecentActivities,
  getWardenPerformance,
  createAdminAnnouncement,
  getAllAdminAnnouncements,
  deleteAdminAnnouncement,
  toggleAdminAnnouncementStatus,
  getViolationsDashboardStats
} from "./actions";
import { toast } from "sonner";
import { format } from "date-fns";

type DashboardStats = {
  users: {
    total: number;
    students: number;
    wardens: number;
    canteenManagers: number;
    admins: number;
  };
  infrastructure: {
    buildings: number;
    floors: number;
    rooms: number;
    occupiedBeds: number;
    totalBeds: number;
    occupancyRate: string;
  };
  attendance: {
    total: number;
    present: number;
    absent: number;
    on_leave: number;
    attendanceRate: string;
  };
  feedback: {
    total: number;
    pending: number;
    averageRating: string;
  };
  menus: {
    total: number;
    today: number;
  };
  announcements: {
    total: number;
    active: number;
  };
};

const DashboardAdminPage = () => {
  const user = useContext(UserContext)?.user as UserPayload;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendanceTrends, setAttendanceTrends] = useState<any[]>([]);
  const [buildingAttendance, setBuildingAttendance] = useState<any[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [wardenPerformance, setWardenPerformance] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [violationsStats, setViolationsStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    category: "general" as Announcement["category"],
    priority: "medium" as Announcement["priority"],
    target_audience: "all" as Announcement["target_audience"],
    active: true,
    expires_at: null as Date | null
  });

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDays]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        trendsRes,
        buildingRes,
        feedbackRes,
        activitiesRes,
        wardenRes,
        announcementsRes,
        violationsRes
      ] = await Promise.all([
        getAdminDashboardStats(),
        getAttendanceTrends(selectedDays),
        getBuildingWiseAttendance(),
        getFeedbackCategoryStats(),
        getRecentActivities(10),
        getWardenPerformance(),
        getAllAdminAnnouncements(),
        getViolationsDashboardStats(selectedDays)
      ]);

      if (statsRes.success) setStats(statsRes.data as DashboardStats);
      if (trendsRes.success) setAttendanceTrends(trendsRes.data ?? []);
      if (buildingRes.success) setBuildingAttendance(buildingRes.data ?? []);
      if (feedbackRes.success) setFeedbackStats(feedbackRes.data ?? []);
      if (activitiesRes.success) setRecentActivities(activitiesRes.data ?? []);
      if (wardenRes.success) setWardenPerformance(wardenRes.data ?? []);
      if (announcementsRes.success) setAnnouncements(announcementsRes.data ?? []);
      if (violationsRes.success) setViolationsStats(violationsRes.data);
      if (feedbackRes.success) setFeedbackStats(feedbackRes.data ?? []);
      if (activitiesRes.success) setRecentActivities(activitiesRes.data ?? []);
      if (wardenRes.success) setWardenPerformance(wardenRes.data ?? []);
      if (announcementsRes.success) setAnnouncements(announcementsRes.data ?? []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!user || !newAnnouncement.title || !newAnnouncement.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    const res = await createAdminAnnouncement({
      ...newAnnouncement,
      created_by_id: user.id!,
      created_by_name: user.name!
    });

    if (res.success) {
      toast.success("Announcement created successfully");
      setAnnouncementDialogOpen(false);
      setNewAnnouncement({
        title: "",
        message: "",
        category: "general",
        priority: "medium",
        target_audience: "all",
        active: true,
        expires_at: null
      });
      fetchAllData();
    } else {
      toast.error(res.message || "Failed to create announcement");
    }
  };

  const handleToggleAnnouncement = async (id: number) => {
    const res = await toggleAdminAnnouncementStatus(id);
    if (res.success) {
      toast.success("Announcement status updated");
      fetchAllData();
    } else {
      toast.error("Failed to update announcement");
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    const res = await deleteAdminAnnouncement(id);
    if (res.success) {
      toast.success("Announcement deleted");
      fetchAllData();
    } else {
      toast.error("Failed to delete announcement");
    }
  };

  const processAttendanceTrends = () => {
    const groupedByDate: { [key: string]: { present: number; absent: number; on_leave: number } } = {};

    attendanceTrends.forEach((entry) => {
      const date = entry.date;
      if (!groupedByDate[date]) {
        groupedByDate[date] = { present: 0, absent: 0, on_leave: 0 };
      }
      groupedByDate[date][entry.status as keyof typeof groupedByDate[typeof date]] = parseInt(entry.count);
    });

    return Object.entries(groupedByDate)
      .map(([date, counts]) => ({
        date: format(new Date(date), 'MMM dd'),
        ...counts,
        total: counts.present + counts.absent + counts.on_leave
      }))
      .reverse();
  };

  const processBuildingAttendance = () => {
    const grouped: { [key: string]: { present: number; absent: number; on_leave: number; total: number } } = {};

    buildingAttendance.forEach((entry) => {
      const key = `${entry.building || 'Unknown'} - Floor ${entry.floor || 'N/A'}`;
      if (!grouped[key]) {
        grouped[key] = { present: 0, absent: 0, on_leave: 0, total: 0 };
      }
      const count = parseInt(entry.count);
      grouped[key][entry.status as keyof Omit<typeof grouped[typeof key], 'total'>] = count;
      grouped[key].total += count;
    });

    return Object.entries(grouped).map(([name, counts]) => ({
      name,
      ...counts,
      rate: counts.total > 0 ? ((counts.present / counts.total) * 100).toFixed(1) : '0'
    }));
  };

  const chartData = processAttendanceTrends();
  const buildingData = processBuildingAttendance();
  const maxChartValue = Math.max(...chartData.map(d => d.total), 1);

  const exportData = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Complete system overview and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAllData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setAnnouncementDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Students:</span>
                <span className="font-medium">{stats?.users.students || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Wardens:</span>
                <span className="font-medium">{stats?.users.wardens || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Staff:</span>
                <span className="font-medium">{stats?.users.canteenManagers || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Infrastructure</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.infrastructure.buildings || 0} Buildings</div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Floors:</span>
                <span className="font-medium">{stats?.infrastructure.floors || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Rooms:</span>
                <span className="font-medium">{stats?.infrastructure.rooms || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Occupancy:</span>
                <span className="font-medium">{stats?.infrastructure.occupancyRate || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Attendance</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.attendance.attendanceRate || 0}%</div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-green-600" />
                  Present:
                </span>
                <span className="font-medium">{stats?.attendance.present || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <UserX className="h-3 w-3 text-red-600" />
                  Absent:
                </span>
                <span className="font-medium">{stats?.attendance.absent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Plane className="h-3 w-3 text-blue-600" />
                  On Leave:
                </span>
                <span className="font-medium">{stats?.attendance.on_leave || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback & Services</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stats?.feedback.averageRating || 0}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Total Feedback:</span>
                <span className="font-medium">{stats?.feedback.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-medium text-orange-600">{stats?.feedback.pending || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Menus Added:</span>
                <span className="font-medium">{stats?.menus.total || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Attendance Trends
              </CardTitle>
              <CardDescription>System-wide attendance patterns</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedDays.toString()} onValueChange={(v) => setSelectedDays(parseInt(v))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData(chartData, 'attendance-trends')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {chartData.map((day, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{day.date}</span>
                  <span className="text-muted-foreground">
                    {day.total} students • {day.total > 0 ? ((day.present / day.total) * 100).toFixed(0) : 0}% rate
                  </span>
                </div>
                <div className="flex gap-1 h-8 rounded overflow-hidden bg-secondary">
                  {day.present > 0 && (
                    <div
                      className="bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${(day.present / maxChartValue) * 100}%` }}
                      title={`Present: ${day.present}`}
                    >
                      {day.present}
                    </div>
                  )}
                  {day.absent > 0 && (
                    <div
                      className="bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${(day.absent / maxChartValue) * 100}%` }}
                      title={`Absent: ${day.absent}`}
                    >
                      {day.absent}
                    </div>
                  )}
                  {day.on_leave > 0 && (
                    <div
                      className="bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${(day.on_leave / maxChartValue) * 100}%` }}
                      title={`On Leave: ${day.on_leave}`}
                    >
                      {day.on_leave}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>On Leave</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Building-wise Attendance & Feedback Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Building-wise Attendance
                </CardTitle>
                <CardDescription>Today&apos;s attendance by location</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData(buildingData, 'building-attendance')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {buildingData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No attendance data for today</p>
              ) : (
                buildingData.map((building, index) => (
                  <div key={index} className="space-y-2 pb-3 border-b last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{building.name}</span>
                      <span className="text-sm text-muted-foreground">{building.rate}%</span>
                    </div>
                    <div className="flex gap-1 h-6 rounded overflow-hidden bg-secondary">
                      {building.present > 0 && (
                        <div
                          className="bg-green-500 flex items-center justify-center text-xs text-white"
                          style={{ width: `${(building.present / building.total) * 100}%` }}
                        >
                          {building.present}
                        </div>
                      )}
                      {building.absent > 0 && (
                        <div
                          className="bg-red-500 flex items-center justify-center text-xs text-white"
                          style={{ width: `${(building.absent / building.total) * 100}%` }}
                        >
                          {building.absent}
                        </div>
                      )}
                      {building.on_leave > 0 && (
                        <div
                          className="bg-blue-500 flex items-center justify-center text-xs text-white"
                          style={{ width: `${(building.on_leave / building.total) * 100}%` }}
                        >
                          {building.on_leave}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>Present: {building.present}</span>
                      <span>Absent: {building.absent}</span>
                      <span>Leave: {building.on_leave}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Violations Overview
                </CardTitle>
                <CardDescription>Rule violations and incidents</CardDescription>
              </div>
              <Link href="/dashboard/admin/violations">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {violationsStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="text-xs text-muted-foreground">Critical</div>
                    <div className="text-2xl font-bold text-red-600">
                      {violationsStats.severityCounts.find((s: any) => s.severity === 'critical')?.count || 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <div className="text-xs text-muted-foreground">Severe</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {violationsStats.severityCounts.find((s: any) => s.severity === 'severe')?.count || 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                    <div className="text-xs text-muted-foreground">Pending</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {violationsStats.statusCounts.find((s: any) => s.status === 'pending')?.count || 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="text-xs text-muted-foreground">Resolved</div>
                    <div className="text-2xl font-bold text-green-600">
                      {violationsStats.statusCounts.find((s: any) => s.status === 'resolved')?.count || 0}
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Fines</span>
                    <span className="font-medium">₹{violationsStats.fineStats.total_fines || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Collected</span>
                    <span className="font-medium text-green-600">₹{violationsStats.fineStats.collected_fines || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending Fines</span>
                    <span className="font-medium text-orange-600">{violationsStats.fineStats.pending_fines_count || 0}</span>
                  </div>
                </div>
                {violationsStats.typeBreakdown.length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="text-xs font-medium mb-2">Top Violations</div>
                    <div className="space-y-2">
                      {violationsStats.typeBreakdown.slice(0, 3).map((type: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground capitalize">
                            {type.violation_type.replace('_', ' ')}
                          </span>
                          <span className="font-medium">{type.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No violations data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Feedback by Category
                </CardTitle>
                <CardDescription>Feedback distribution and ratings</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData(feedbackStats, 'feedback-stats')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {feedbackStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No feedback data available</p>
              ) : (
                feedbackStats.map((category, index) => (
                  <div key={index} className="space-y-2 pb-3 border-b last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm capitalize">{category.category.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{parseFloat(category.avg_rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Total: {category.count}</span>
                      <span className="text-orange-600">Pending: {category.pending}</span>
                      <span className="text-green-600">Resolved: {category.resolved}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(parseInt(category.resolved) / parseInt(category.count)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warden Performance & Recent Activities */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Warden Performance
            </CardTitle>
            <CardDescription>Attendance marking efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {wardenPerformance.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No warden data available</p>
              ) : (
                wardenPerformance.map((warden, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{warden.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {warden.assigned_building} • {warden.total_students} students
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {warden.marked_today}/{warden.total_students}
                      </p>
                      <p className="text-xs text-muted-foreground">marked today</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest system updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentActivities.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent activities</p>
              ) : (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className={`p-2 rounded-full ${activity.type === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                      activity.type === 'feedback' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                        'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
                      }`}>
                      {activity.type === 'user' ? <Users className="h-4 w-4" /> :
                        activity.type === 'feedback' ? <MessageSquare className="h-4 w-4" /> :
                          <Megaphone className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{activity.role}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            System Announcements
          </CardTitle>
          <CardDescription>Manage announcements for all users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {announcements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No announcements yet</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className={`p-4 rounded-lg border ${announcement.active ? 'bg-secondary/50' : 'bg-muted/50 opacity-60'
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{announcement.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${announcement.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                          {announcement.priority}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {announcement.target_audience}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(announcement.created_at), 'MMM dd, yyyy HH:mm')} • {announcement.created_by_name}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAnnouncement(announcement.id)}
                      >
                        {announcement.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Link href="/dashboard/admin/manage-members" className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Manage Members
              </Button>
            </Link>
            <Link href="/dashboard/admin/add-member" className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </Link>
            <Link href="/dashboard/admin/manage-buildings" className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Building2 className="h-4 w-4" />
                Manage Buildings
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setAnnouncementDialogOpen(true)}
            >
              <Bell className="h-4 w-4" />
              Create Announcement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Announcement Dialog */}
      <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>
              Send announcements to students, wardens, or all users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Announcement title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message *</label>
              <Textarea
                placeholder="Announcement message"
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newAnnouncement.category}
                  onValueChange={(value: any) => setNewAnnouncement({ ...newAnnouncement, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="menu_update">Menu Update</SelectItem>
                    <SelectItem value="service_info">Service Info</SelectItem>
                    <SelectItem value="hostel_rules">Hostel Rules</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newAnnouncement.priority}
                  onValueChange={(value: any) => setNewAnnouncement({ ...newAnnouncement, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Select
                value={newAnnouncement.target_audience}
                onValueChange={(value: any) => setNewAnnouncement({ ...newAnnouncement, target_audience: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="wardens">Wardens Only</SelectItem>
                  <SelectItem value="admins">Admins Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAnnouncement}>
              Create Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardAdminPage;