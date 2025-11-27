"use client"

import * as React from "react"
import {
  Calendar as CalendarIcon,
  TrendingUp,
  Clock,
  Coffee,
  UtensilsCrossed,
  Cookie,
  Moon,
  Plus,
  Eye,
  ChevronRight,
  ArrowUpRight,
  Activity,
  MessageSquare,
  Megaphone,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle2,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import Link from "next/link"
import { getAllMenus, getMenusByDate, countMenus } from "./add-menu/actions"
import { getFeedbackStats } from "./feedback/actions"
import { getAnnouncementStats } from "./announcements/actions"
import { toast } from "sonner"

type MenuWithId = {
  id: number
  date: Date
  type: "breakfast" | "lunch" | "snacks" | "dinner"
  items: string[]
}

const mealIcons = {
  breakfast: Coffee,
  lunch: UtensilsCrossed,
  snacks: Cookie,
  dinner: Moon,
}

const mealColors = {
  breakfast: "text-yellow-600 bg-yellow-50 border-yellow-200",
  lunch: "text-green-600 bg-green-50 border-green-200",
  snacks: "text-orange-600 bg-orange-50 border-orange-200",
  dinner: "text-blue-600 bg-blue-50 border-blue-200",
}

const DashboardCanteenManagerPage = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [todayMenus, setTodayMenus] = React.useState<MenuWithId[]>([])
  const [upcomingMenus, setUpcomingMenus] = React.useState<MenuWithId[]>([])
  const [stats, setStats] = React.useState({
    totalMenus: 0,
    todayMenus: 0,
    weekMenus: 0,
    monthMenus: 0,
  })
  const [feedbackStats, setFeedbackStats] = React.useState({
    total: 0,
    pending: 0,
    resolved: 0,
    highPriority: 0,
    averageRating: "0"
  })
  const [announcementStats, setAnnouncementStats] = React.useState({
    total: 0,
    active: 0,
    expired: 0
  })
  const [menuTypeDistribution, setMenuTypeDistribution] = React.useState({
    breakfast: 0,
    lunch: 0,
    snacks: 0,
    dinner: 0
  })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchDashboardData()
  }, [selectedDate])

  // Load cached data from localStorage
  React.useEffect(() => {
    const cached = localStorage.getItem('canteen_dashboard_cache')
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      const fiveMinutes = 5 * 60 * 1000
      if (Date.now() - timestamp < fiveMinutes) {
        const { stats: cachedStats, feedbackStats: cachedFeedback, announcementStats: cachedAnnouncements } = data
        setStats(cachedStats)
        setFeedbackStats(cachedFeedback)
        setAnnouncementStats(cachedAnnouncements)
      }
    }
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all menus
      const allMenusResult = await getAllMenus()
      const allMenus = allMenusResult.success && allMenusResult.data
        ? (allMenusResult.data as MenuWithId[])
        : []

      // Get today's menus
      const todayResult = await getMenusByDate(selectedDate)
      const todayData = todayResult.success && todayResult.data
        ? (Array.isArray(todayResult.data) ? todayResult.data : [todayResult.data]) as MenuWithId[]
        : []
      setTodayMenus(todayData)

      // Calculate upcoming menus (next 7 days)
      const tomorrow = new Date(selectedDate)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(selectedDate)
      nextWeek.setDate(nextWeek.getDate() + 7)

      const upcoming = allMenus.filter(menu => {
        const menuDate = new Date(menu.date)
        return menuDate > selectedDate && menuDate <= nextWeek
      }).slice(0, 5)
      setUpcomingMenus(upcoming)

      // Calculate statistics
      const countResult = await countMenus()
      const totalMenus = countResult.success ? countResult.data : 0

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

      const weekMenus = allMenus.filter(menu => {
        const menuDate = new Date(menu.date)
        return menuDate >= weekStart && menuDate <= today
      }).length

      const monthMenus = allMenus.filter(menu => {
        const menuDate = new Date(menu.date)
        return menuDate >= monthStart && menuDate <= today
      }).length

      // Calculate menu type distribution
      const distribution = {
        breakfast: allMenus.filter(m => m.type === 'breakfast').length,
        lunch: allMenus.filter(m => m.type === 'lunch').length,
        snacks: allMenus.filter(m => m.type === 'snacks').length,
        dinner: allMenus.filter(m => m.type === 'dinner').length
      }
      setMenuTypeDistribution(distribution)

      const menuStats = {
        totalMenus,
        todayMenus: todayData.length,
        weekMenus,
        monthMenus,
      }
      setStats(menuStats)

      // Fetch feedback and announcement stats
      const [feedbackRes, announcementRes] = await Promise.all([
        getFeedbackStats(),
        getAnnouncementStats()
      ])

      if (feedbackRes.success && feedbackRes.data) {
        setFeedbackStats({
          ...feedbackRes.data,
          averageRating: String(feedbackRes.data.averageRating)
        })
      }

      if (announcementRes.success && announcementRes.data) {
        setAnnouncementStats(announcementRes.data)
      }

      // Cache the stats
      localStorage.setItem('canteen_dashboard_cache', JSON.stringify({
        data: {
          stats: menuStats,
          feedbackStats: feedbackRes.data,
          announcementStats: announcementRes.data
        },
        timestamp: Date.now()
      }))

    } catch (error) {
      toast.error("Failed to fetch dashboard data")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const getCurrentMealTime = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 10) return "breakfast"
    if (hour >= 11 && hour < 15) return "lunch"
    if (hour >= 15 && hour < 18) return "snacks"
    return "dinner"
  }

  const currentMeal = getCurrentMealTime()
  const currentMealMenu = todayMenus.find(menu => menu.type === currentMeal)

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{getGreeting()}!</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your Canteen Manager Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/canteen-manager/add-menu">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu
            </Button>
          </Link>
          <Link href="/dashboard/canteen-manager/view-menu">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </Link>
          <Link href="/dashboard/canteen-manager/feedback">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </Button>
          </Link>
          <Link href="/dashboard/canteen-manager/announcements">
            <Button variant="outline">
              <Megaphone className="h-4 w-4 mr-2" />
              Announce
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Menus</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMenus}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time menus created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Menus</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayMenus}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Menus for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekMenus}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Menus this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthMenus}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Menus this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats - Feedback & Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackStats.total}</div>
            <Link href="/dashboard/canteen-manager/feedback">
              <Button variant="link" className="p-0 h-auto text-xs mt-1">
                View all →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{feedbackStats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{feedbackStats.resolved}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully closed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {feedbackStats.averageRating}/5
            </div>
            <p className="text-xs text-muted-foreground mt-1">User satisfaction</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{announcementStats.active}</div>
            <Link href="/dashboard/canteen-manager/announcements">
              <Button variant="link" className="p-0 h-auto text-xs mt-1">
                Manage →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Menu Distribution
            </CardTitle>
            <CardDescription>Breakdown by meal type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(menuTypeDistribution).map(([type, count]) => {
                const Icon = mealIcons[type as keyof typeof mealIcons]
                const total = Object.values(menuTypeDistribution).reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize font-medium">{type}</span>
                      </div>
                      <span className="text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Feedback Overview
            </CardTitle>
            <CardDescription>Current feedback status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Pending</span>
                  </div>
                  <span className="text-muted-foreground">{feedbackStats.pending}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all duration-500"
                    style={{
                      width: `${feedbackStats.total > 0 ? (feedbackStats.pending / feedbackStats.total) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Resolved</span>
                  </div>
                  <span className="text-muted-foreground">{feedbackStats.resolved}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{
                      width: `${feedbackStats.total > 0 ? (feedbackStats.resolved / feedbackStats.total) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium">High Priority</span>
                  </div>
                  <span className="text-muted-foreground">{feedbackStats.highPriority}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{
                      width: `${feedbackStats.total > 0 ? (feedbackStats.highPriority / feedbackStats.total) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Meal Highlight */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {React.createElement(mealIcons[currentMeal], {
                      className: "h-5 w-5"
                    })}
                    Current Meal Time: <span className="capitalize">{currentMeal}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {currentMealMenu
                      ? `Today's ${currentMeal} menu`
                      : `No ${currentMeal} menu scheduled for today`
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {currentMealMenu && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentMealMenu.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
            {!currentMealMenu && (
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>No menu items scheduled</p>
                  <Link href="/dashboard/canteen-manager/add-menu">
                    <Button variant="link" className="mt-2">
                      Add {currentMeal} menu for today
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Today's Complete Menu */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today&apos;s Complete Menu</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                  })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {todayMenus.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayMenus.map((menu) => {
                    const Icon = mealIcons[menu.type]
                    const colorClass = mealColors[menu.type]

                    return (
                      <div
                        key={menu.id}
                        className={`p-4 rounded-lg border-2 ${colorClass}`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="h-4 w-4" />
                          <h3 className="font-semibold capitalize">{menu.type}</h3>
                        </div>
                        <div className="space-y-1">
                          {menu.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className="h-1 w-1 rounded-full bg-current" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No menus scheduled for today</p>
                  <Link href="/dashboard/canteen-manager/add-menu">
                    <Button variant="link" className="mt-2">
                      Add menu for today
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Menus */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Menus</CardTitle>
                <Link href="/dashboard/canteen-manager/view-menu">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription>Next 5 scheduled menus</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMenus.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMenus.map((menu) => {
                    const Icon = mealIcons[menu.type]

                    return (
                      <div
                        key={menu.id}
                        className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium capitalize">{menu.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(menu.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {menu.items.slice(0, 2).join(", ")}
                              {menu.items.length > 2 && ` +${menu.items.length - 2} more`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No upcoming menus scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar & Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date to view menus</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your canteen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/canteen-manager/add-menu" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Menu
                  <ArrowUpRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              <Link href="/dashboard/canteen-manager/view-menu" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Menus
                  <ArrowUpRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              <Link href="/dashboard/canteen-manager/feedback" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Manage Feedback
                  <ArrowUpRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              <Link href="/dashboard/canteen-manager/announcements" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Create Announcement
                  <ArrowUpRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meal Types Overview</CardTitle>
              <CardDescription>Total menus by type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(["breakfast", "lunch", "snacks", "dinner"] as const).map((type) => {
                const Icon = mealIcons[type]
                const count = todayMenus.filter(m => m.type === type).length

                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize text-sm">{type}</span>
                    </div>
                    <span className="font-semibold">{count}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardCanteenManagerPage