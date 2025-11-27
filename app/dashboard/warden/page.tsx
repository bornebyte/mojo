"use client";
import { useContext, useEffect, useState } from "react";
import UserContext from "@/app/context/UserContext";
import { UserPayload } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  UserX,
  Plane,
  ClipboardCheck,
  UserPlus,
  Bell,
  TrendingUp,
  Building,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { getAttendanceStats, getAttendanceHistory } from "./attendance/actions";
import { toast } from "sonner";

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

const DashboardWardenPage = () => {
  const user = useContext(UserContext)?.user as UserPayload;
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        getAttendanceStats(user),
        getAttendanceHistory(user, 7)
      ]);

      if (statsRes.success) {
        setStats(statsRes.data as Stats);
      } else {
        toast.error(statsRes.message);
      }

      if (historyRes.success) {
        setHistory(historyRes.data as HistoryEntry[]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const processChartData = () => {
    const last7Days: { [key: string]: { present: number; absent: number; on_leave: number } } = {};

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days[dateStr] = { present: 0, absent: 0, on_leave: 0 };
    }

    // Fill with actual data
    history.forEach((entry) => {
      const dateStr = entry.date;
      if (last7Days[dateStr]) {
        const count = parseInt(entry.count);
        if (entry.status === 'present') last7Days[dateStr].present = count;
        else if (entry.status === 'absent') last7Days[dateStr].absent = count;
        else if (entry.status === 'on_leave') last7Days[dateStr].on_leave = count;
      }
    });

    return Object.entries(last7Days).map(([date, counts]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...counts
    }));
  };

  const chartData = processChartData();
  const maxValue = Math.max(...chartData.map(d => d.present + d.absent + d.on_leave), 1);

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
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Warden Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Manage your hostel floors {user?.assigned_floor && `(Floors: ${JSON.parse(user.assigned_floor).join(', ')})`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_students || 0}</div>
            <p className="text-xs text-muted-foreground">
              Under your supervision
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.present || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats ? ((stats.present / stats.total_students) * 100).toFixed(1) : 0}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.absent || 0}</div>
            <p className="text-xs text-muted-foreground">
              Students not present
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Plane className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.on_leave || 0}</div>
            <p className="text-xs text-muted-foreground">
              Approved leaves
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Unmarked Students Alert */}
      {stats && stats.unmarked > 0 && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Pending Attendance
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-orange-800 dark:text-orange-200">
              <strong>{stats.unmarked}</strong> students haven&apos;t been marked for today
            </p>
            <Link href="/dashboard/warden/attendance">
              <Button variant="default" size="sm">
                Mark Attendance
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Attendance Trend Chart */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              7-Day Attendance Trend
            </CardTitle>
            <CardDescription>Daily attendance status for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.map((day, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{day.date}</span>
                    <span className="text-muted-foreground">
                      {day.present + day.absent + day.on_leave} total
                    </span>
                  </div>
                  <div className="flex gap-1 h-8 rounded overflow-hidden">
                    {day.present > 0 && (
                      <div
                        className="bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${(day.present / maxValue) * 100}%` }}
                        title={`Present: ${day.present}`}
                      >
                        {day.present}
                      </div>
                    )}
                    {day.absent > 0 && (
                      <div
                        className="bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${(day.absent / maxValue) * 100}%` }}
                        title={`Absent: ${day.absent}`}
                      >
                        {day.absent}
                      </div>
                    )}
                    {day.on_leave > 0 && (
                      <div
                        className="bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${(day.on_leave / maxValue) * 100}%` }}
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

        {/* Today's Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Status Distribution</CardTitle>
            <CardDescription>Current attendance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    Present
                  </span>
                  <span className="font-medium">{stats?.present || 0}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${stats ? (stats.present / stats.total_students) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    Absent
                  </span>
                  <span className="font-medium">{stats?.absent || 0}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{ width: `${stats ? (stats.absent / stats.total_students) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    On Leave
                  </span>
                  <span className="font-medium">{stats?.on_leave || 0}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${stats ? (stats.on_leave / stats.total_students) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    Not Marked
                  </span>
                  <span className="font-medium">{stats?.unmarked || 0}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-400 transition-all"
                    style={{ width: `${stats ? (stats.unmarked / stats.total_students) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Building Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Your Assignment
            </CardTitle>
            <CardDescription>Buildings and floors under your supervision</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Building</span>
                <span className="font-medium">{user?.assigned_building || 'Not assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Floors</span>
                <span className="font-medium">
                  {user?.assigned_floor ? JSON.parse(user.assigned_floor).join(', ') : 'Not assigned'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Students</span>
                <span className="font-medium">{stats?.total_students || 0}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm space-y-1">
                <p className="font-medium">Attendance Rate (Today)</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${stats?.attendance_rate || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats?.attendance_rate.toFixed(1) || 0}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Link href="/dashboard/warden/attendance" className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Mark Attendance
              </Button>
            </Link>
            <Link href="/dashboard/warden/students" className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                View Students
              </Button>
            </Link>
            <Link href="/dashboard/warden/students/add" className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <UserPlus className="h-4 w-4" />
                Add Student
              </Button>
            </Link>
            <Link href="/dashboard/warden/announcements" className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Bell className="h-4 w-4" />
                Announcements
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardWardenPage;
