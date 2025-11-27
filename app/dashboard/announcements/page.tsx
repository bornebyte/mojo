"use client"

import * as React from "react"
import { Bell, Calendar as CalendarIcon, User, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { getActiveAnnouncements } from "@/app/dashboard/canteen-manager/announcements/actions"
import { Announcement } from "@/lib/types"
import { useContext } from "react"
import UserContext from "@/app/context/UserContext"
import { UserPayload } from "@/lib/types"

type AnnouncementWithId = Announcement & { id: number }

const categoryLabels: Record<string, string> = {
    hostel_rules: "Hostel Rules",
    event: "Event",
    maintenance: "Maintenance",
    general: "General",
    urgent: "Urgent",
    menu_update: "Menu Update",
    service_info: "Service Info",
    timing_change: "Timing Change",
    special_meal: "Special Meal"
}

const categoryColors: Record<string, string> = {
    hostel_rules: "bg-indigo-100 text-indigo-800 border-indigo-200",
    event: "bg-purple-100 text-purple-800 border-purple-200",
    maintenance: "bg-orange-100 text-orange-800 border-orange-200",
    general: "bg-gray-100 text-gray-800 border-gray-200",
    urgent: "bg-red-100 text-red-800 border-red-200",
    menu_update: "bg-blue-100 text-blue-800 border-blue-200",
    service_info: "bg-green-100 text-green-800 border-green-200",
    timing_change: "bg-yellow-100 text-yellow-800 border-yellow-200",
    special_meal: "bg-cyan-100 text-cyan-800 border-cyan-200"
}

const priorityColors: Record<string, string> = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700"
}

const ViewAnnouncementsPage = () => {
    const user = useContext(UserContext)?.user as UserPayload
    const [announcements, setAnnouncements] = React.useState<AnnouncementWithId[]>([])
    const [filteredAnnouncements, setFilteredAnnouncements] = React.useState<AnnouncementWithId[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
    const [priorityFilter, setPriorityFilter] = React.useState<string>("all")

    React.useEffect(() => {
        loadAnnouncements()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        filterAnnouncements()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, categoryFilter, priorityFilter, announcements])

    const loadAnnouncements = async () => {
        setLoading(true)
        try {
            const result = await getActiveAnnouncements()
            if (result.success && result.data) {
                const userRole = user?.role || "all"
                const roleMap: Record<string, string> = {
                    "student": "students",
                    "warden": "wardens",
                    "admin": "admins",
                    "canteen manager": "all"
                }
                const mappedRole = roleMap[userRole] || "all"
                // Filter by target audience
                const relevantAnnouncements = (result.data as AnnouncementWithId[]).filter(
                    (announcement) =>
                        announcement.target_audience === "all" ||
                        announcement.target_audience === mappedRole
                )
                setAnnouncements(relevantAnnouncements)
                setFilteredAnnouncements(relevantAnnouncements)
            } else {
                setAnnouncements([])
                setFilteredAnnouncements([])
            }
        } catch (error) {
            toast.error("Failed to load announcements")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const filterAnnouncements = () => {
        let filtered = [...announcements]

        if (searchTerm) {
            filtered = filtered.filter(
                (a) =>
                    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.message.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (categoryFilter && categoryFilter !== "all") {
            filtered = filtered.filter((a) => a.category === categoryFilter)
        }

        if (priorityFilter && priorityFilter !== "all") {
            filtered = filtered.filter((a) => a.priority === priorityFilter)
        }

        setFilteredAnnouncements(filtered)
    }

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return "No expiry"
        const d = new Date(date)
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Bell className="h-8 w-8" />
                        Announcements
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View all active announcements from administration, wardens, and canteen
                    </p>
                </div>
                <Button onClick={loadAnnouncements} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <Input
                                placeholder="Search announcements..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="hostel_rules">Hostel Rules</SelectItem>
                                    <SelectItem value="event">Event</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="menu_update">Menu Update</SelectItem>
                                    <SelectItem value="service_info">Service Info</SelectItem>
                                    <SelectItem value="timing_change">Timing Change</SelectItem>
                                    <SelectItem value="special_meal">Special Meal</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority</label>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Active</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{announcements.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {announcements.filter((a) => a.priority === "high").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredAnnouncements.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
                {filteredAnnouncements.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Announcements Found</h3>
                            <p className="text-muted-foreground text-center">
                                {searchTerm || categoryFilter !== "all" || priorityFilter !== "all"
                                    ? "Try adjusting your filters"
                                    : "There are no active announcements at the moment"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredAnnouncements.map((announcement) => (
                        <Card
                            key={announcement.id}
                            className={`${announcement.priority === "high"
                                ? "border-red-500 shadow-md"
                                : announcement.priority === "medium"
                                    ? "border-yellow-500"
                                    : ""
                                }`}
                        >
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl mb-2">{announcement.title}</CardTitle>
                                        <CardDescription className="flex flex-wrap gap-2">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColors[announcement.category] ||
                                                    categoryColors.general
                                                    }`}
                                            >
                                                {categoryLabels[announcement.category] || announcement.category}
                                            </span>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[announcement.priority]
                                                    }`}
                                            >
                                                {announcement.priority.toUpperCase()} Priority
                                            </span>
                                            {announcement.target_audience !== "all" && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    For: {announcement.target_audience}
                                                </span>
                                            )}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm whitespace-pre-wrap">{announcement.message}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4 border-t">
                                    <div className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        <span>Posted by: {announcement.created_by_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>Created: {formatDate(announcement.created_at)}</span>
                                    </div>
                                    {announcement.expires_at && (
                                        <div className="flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>Expires: {formatDate(announcement.expires_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

export default ViewAnnouncementsPage
