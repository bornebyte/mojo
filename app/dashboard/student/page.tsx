"use client";
import { useContext, useEffect, useState } from "react";
import UserContext from "@/app/context/UserContext";
import { UserPayload, Feedback } from "@/lib/types";
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
  Calendar,
  TrendingUp,
  Star,
  MessageSquare,
  Bell,
  UtensilsCrossed,
  UserCheck,
  UserX,
  Plane,
  Award,
  BarChart3,
  Plus,
  RefreshCw,
  AlertCircle,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  Megaphone,
  ChevronRight
} from "lucide-react";
import {
  getStudentAttendance,
  getStudentAttendanceStats,
  getTodayMenu,
  submitFeedback,
  getStudentFeedback,
  submitFoodRating,
  getStudentFoodRatings,
  getTodayFoodRatings,
  getStudentAnnouncements,
  getStudentDashboardSummary
} from "./actions";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

const DashboardStudentPage = () => {
  const user = useContext(UserContext)?.user as UserPayload;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [todayMenu, setTodayMenu] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<any[]>([]);
  const [foodRatings, setFoodRatings] = useState<any[]>([]);
  const [todayRatings, setTodayRatings] = useState<any[]>([]);
  const [selectedDays, setSelectedDays] = useState(30);

  // Dialog states
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  // Form states
  const [feedbackForm, setFeedbackForm] = useState({
    category: "food_quality" as Feedback["category"],
    priority: "medium" as Feedback["priority"],
    subject: "",
    message: "",
    rating: 0
  });

  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    comment: ""
  });

  useEffect(() => {
    if (user?.id) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedDays]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        summaryRes,
        historyRes,
        menuRes,
        announcementsRes,
        feedbackRes,
        ratingsRes,
        todayRatingsRes
      ] = await Promise.all([
        getStudentAttendanceStats(user.id!),
        getStudentDashboardSummary(user.id!),
        getStudentAttendance(user.id!, selectedDays),
        getTodayMenu(),
        getStudentAnnouncements(),
        getStudentFeedback(user.id!),
        getStudentFoodRatings(user.id!),
        getTodayFoodRatings(user.id!)
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (summaryRes.success) setSummary(summaryRes.data);
      if (historyRes.success && historyRes.data) setAttendanceHistory(historyRes.data);
      if (menuRes.success && menuRes.data) setTodayMenu(menuRes.data);
      if (announcementsRes.success && announcementsRes.data) setAnnouncements(announcementsRes.data);
      if (feedbackRes.success && feedbackRes.data) setFeedbackHistory(feedbackRes.data);
      if (ratingsRes.success && ratingsRes.data) setFoodRatings(ratingsRes.data);
      if (todayRatingsRes.success && todayRatingsRes.data) {
        const ratingsMap: any = {};
        todayRatingsRes.data.forEach((r: any) => {
          ratingsMap[r.meal_type] = r;
        });
        setTodayRatings(ratingsMap);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!user || !feedbackForm.subject || !feedbackForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    const res = await submitFeedback({
      user_id: user.id!,
      user_name: user.name!,
      user_role: "student",
      category: feedbackForm.category,
      priority: feedbackForm.priority,
      subject: feedbackForm.subject,
      message: feedbackForm.message,
      rating: feedbackForm.rating > 0 ? feedbackForm.rating : null,
      status: "pending"
    });

    if (res.success) {
      toast.success("Feedback submitted successfully");
      setFeedbackDialogOpen(false);
      setFeedbackForm({
        category: "food_quality",
        priority: "medium",
        subject: "",
        message: "",
        rating: 0
      });
      fetchAllData();
    } else {
      toast.error(res.message || "Failed to submit feedback");
    }
  };

  const handleSubmitRating = async () => {
    if (!user || !selectedMeal) return;

    const res = await submitFoodRating({
      user_id: user.id!,
      user_name: user.name!,
      menu_id: selectedMeal.id,
      date: new Date(),
      meal_type: selectedMeal.type,
      rating: ratingForm.rating,
      comment: ratingForm.comment
    });

    if (res.success) {
      toast.success("Rating submitted successfully");
      setRatingDialogOpen(false);
      setSelectedMeal(null);
      setRatingForm({ rating: 5, comment: "" });
      fetchAllData();
    } else {
      toast.error(res.message || "Failed to submit rating");
    }
  };

  const processAttendanceTrend = () => {
    if (!stats?.weekTrend) return [];

    const grouped: { [key: string]: { present: number; absent: number; on_leave: number } } = {};

    stats.weekTrend.forEach((entry: any) => {
      const date = entry.date;
      if (!grouped[date]) {
        grouped[date] = { present: 0, absent: 0, on_leave: 0 };
      }
      grouped[date][entry.status as keyof typeof grouped[typeof date]] = parseInt(entry.count);
    });

    return Object.entries(grouped)
      .map(([date, counts]) => ({
        date: format(new Date(date), 'MMM dd'),
        ...counts
      }))
      .reverse();
  };

  const chartData = processAttendanceTrend();

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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here&apos;s your overview
          </p>
        </div>
        <Button onClick={fetchAllData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.overall.attendance_rate || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.overall.present || 0} present out of {stats?.overall.total || 0} days
            </p>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${stats?.overall.attendance_rate || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.thisMonth.total || 0}</div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-green-600" />
                  Present:
                </span>
                <span className="font-medium">{stats?.thisMonth.present || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <UserX className="h-3 w-3 text-red-600" />
                  Absent:
                </span>
                <span className="font-medium">{stats?.thisMonth.absent || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Ratings</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {summary?.averageRatingGiven || 0}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary?.ratingsGiven || 0} ratings given
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.feedbackSubmitted || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary?.pendingFeedback || 0} pending responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Attendance Trend
              </CardTitle>
              <CardDescription>Your attendance pattern over the last 7 days</CardDescription>
            </div>
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
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No attendance data available</p>
          ) : (
            <>
              <div className="space-y-3">
                {chartData.map((day, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{day.date}</span>
                      <span className="text-muted-foreground">
                        {day.present ? 'Present' : day.absent ? 'Absent' : day.on_leave ? 'On Leave' : 'Not Marked'}
                      </span>
                    </div>
                    <div className="flex gap-1 h-6 rounded overflow-hidden bg-secondary">
                      {day.present > 0 && (
                        <div className="bg-green-500 flex-1 flex items-center justify-center text-xs text-white">
                          Present
                        </div>
                      )}
                      {day.absent > 0 && (
                        <div className="bg-red-500 flex-1 flex items-center justify-center text-xs text-white">
                          Absent
                        </div>
                      )}
                      {day.on_leave > 0 && (
                        <div className="bg-blue-500 flex-1 flex items-center justify-center text-xs text-white">
                          On Leave
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Monthly Breakdown & Today's Menu */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Monthly Breakdown
            </CardTitle>
            <CardDescription>Last 6 months attendance summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {stats?.monthlyBreakdown?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              ) : (
                stats?.monthlyBreakdown?.map((month: any, index: number) => (
                  <div key={index} className="space-y-2 pb-3 border-b last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">
                        {format(new Date(month.month + '-01'), 'MMMM yyyy')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {month.total > 0 ? ((parseInt(month.present) / parseInt(month.total)) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="flex gap-1 h-6 rounded overflow-hidden bg-secondary">
                      {parseInt(month.present) > 0 && (
                        <div
                          className="bg-green-500 flex items-center justify-center text-xs text-white"
                          style={{ width: `${(parseInt(month.present) / parseInt(month.total)) * 100}%` }}
                        >
                          {month.present}
                        </div>
                      )}
                      {parseInt(month.absent) > 0 && (
                        <div
                          className="bg-red-500 flex items-center justify-center text-xs text-white"
                          style={{ width: `${(parseInt(month.absent) / parseInt(month.total)) * 100}%` }}
                        >
                          {month.absent}
                        </div>
                      )}
                      {parseInt(month.on_leave) > 0 && (
                        <div
                          className="bg-blue-500 flex items-center justify-center text-xs text-white"
                          style={{ width: `${(parseInt(month.on_leave) / parseInt(month.total)) * 100}%` }}
                        >
                          {month.on_leave}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>Total: {month.total}</span>
                      <span>Present: {month.present}</span>
                      <span>Absent: {month.absent}</span>
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
                  <UtensilsCrossed className="h-5 w-5" />
                  Today&apos;s Menu
                </CardTitle>
                <CardDescription>Rate your meals</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setFeedbackDialogOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {todayMenu.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No menu available for today</p>
              ) : (
                todayMenu.map((meal) => (
                  <div key={meal.id} className="p-3 rounded-lg border hover:bg-secondary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium capitalize">{meal.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(meal.items) ? meal.items.join(', ') : meal.items}
                        </p>
                      </div>
                    </div>
                    {todayRatings[meal.type] ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Rated {todayRatings[meal.type].rating}/5</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          setSelectedMeal(meal);
                          setRatingDialogOpen(true);
                        }}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Rate this meal
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Announcements
                </CardTitle>
                <CardDescription>{summary?.activeAnnouncements || 0} active</CardDescription>
              </div>
              <Link href="/dashboard/announcements">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {announcements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No announcements</p>
              ) : (
                announcements.slice(0, 5).map((announcement) => (
                  <div key={announcement.id} className="p-3 rounded-lg border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-start gap-2 mb-1">
                      <Megaphone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{announcement.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${announcement.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                            {announcement.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(announcement.created_at), 'MMM dd, HH:mm')}
                        </p>
                      </div>
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
              <MessageSquare className="h-5 w-5" />
              My Feedback History
            </CardTitle>
            <CardDescription>Recent complaints and suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {feedbackHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No feedback submitted yet</p>
              ) : (
                feedbackHistory.slice(0, 5).map((feedback) => (
                  <div key={feedback.id} className="p-3 rounded-lg border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{feedback.subject}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{feedback.category.replace('_', ' ')}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {feedback.status === 'resolved' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : feedback.status === 'pending' ? (
                          <Clock className="h-4 w-4 text-orange-600" />
                        ) : feedback.status === 'reviewing' ? (
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-xs capitalize">{feedback.status}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(feedback.created_at), 'MMM dd, yyyy')}
                    </p>
                    {feedback.response && (
                      <div className="mt-2 p-2 bg-secondary rounded text-xs">
                        <strong>Response:</strong> {feedback.response}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setFeedbackDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Submit Feedback
            </Button>
            <Link href="/dashboard/announcements" className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Bell className="h-4 w-4" />
                View Announcements
              </Button>
            </Link>
            <Link href="/dashboard/student/view-menu" className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                View Menu
              </Button>
            </Link>
            <Link href="/dashboard/student/my-attendance" className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
                My Attendance
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Feedback or Complaint</DialogTitle>
            <DialogDescription>
              Share your concerns, suggestions, or complaints with the management
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={feedbackForm.category}
                  onValueChange={(value: any) => setFeedbackForm({ ...feedbackForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food_quality">Food Quality</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="hygiene">Hygiene</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={feedbackForm.priority}
                  onValueChange={(value: any) => setFeedbackForm({ ...feedbackForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject *</label>
              <Input
                placeholder="Brief subject line"
                value={feedbackForm.subject}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message *</label>
              <Textarea
                placeholder="Describe your feedback or complaint in detail..."
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Overall Rating (Optional)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${rating <= feedbackForm.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback}>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {selectedMeal?.type}</DialogTitle>
            <DialogDescription>
              How would you rate this meal?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setRatingForm({ ...ratingForm, rating })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-10 w-10 ${rating <= ratingForm.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {ratingForm.rating}/5 stars
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Comment (Optional)</label>
              <Textarea
                placeholder="Share your thoughts about this meal..."
                value={ratingForm.comment}
                onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRatingDialogOpen(false);
              setSelectedMeal(null);
              setRatingForm({ rating: 5, comment: "" });
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRating}>
              <Send className="h-4 w-4 mr-2" />
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardStudentPage;