"use client"

import * as React from "react"
import {
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    Megaphone,
    Clock,
    Users,
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Calendar as CalendarIcon,
    Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementStatus,
    getAnnouncementStats
} from "@/app/dashboard/canteen-manager/announcements/actions"
import { Announcement } from "@/lib/types"
import { Switch } from "@/components/ui/switch"

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

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = React.useState<AnnouncementWithId[]>([])
    const [loading, setLoading] = React.useState(true)
    const [createOpen, setCreateOpen] = React.useState(false)
    const [editOpen, setEditOpen] = React.useState(false)
    const [editingAnnouncement, setEditingAnnouncement] = React.useState<AnnouncementWithId | null>(null)
    const [expiryDate, setExpiryDate] = React.useState<Date | undefined>(undefined)
    const [stats, setStats] = React.useState({
        total: 0,
        active: 0,
        expired: 0
    })

    const [formData, setFormData] = React.useState({
        title: "",
        message: "",
        category: "general" as "menu_update" | "service_info" | "timing_change" | "special_meal" | "general" | "urgent" | "hostel_rules" | "event" | "maintenance",
        priority: "medium" as "low" | "medium" | "high",
        target_audience: "all" as "all" | "students" | "wardens" | "admins",
        active: true,
        expires_at: undefined as Date | undefined
    })

    React.useEffect(() => {
        fetchData()
    }, [])

    // Load from localStorage
    React.useEffect(() => {
        const cached = localStorage.getItem('canteen_announcements_cache')
        if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            const fiveMinutes = 5 * 60 * 1000
            if (Date.now() - timestamp < fiveMinutes) {
                setAnnouncements(data)
                setLoading(false)
            }
        }
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [announcementsRes, statsRes] = await Promise.all([
                getAllAnnouncements(),
                getAnnouncementStats()
            ])

            if (announcementsRes.success && announcementsRes.data) {
                setAnnouncements(announcementsRes.data as AnnouncementWithId[])
                // Cache in localStorage
                localStorage.setItem('canteen_announcements_cache', JSON.stringify({
                    data: announcementsRes.data,
                    timestamp: Date.now()
                }))
            } else {
                setAnnouncements([])
            }

            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data)
            }
        } catch (error) {
            toast.error("Failed to fetch announcements")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!formData.title || !formData.message) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            const result = await createAnnouncement({
                ...formData,
                created_by_id: 1, // TODO: Get from auth context
                created_by_name: "Canteen Manager" // TODO: Get from auth context
            } as Announcement)

            if (result.success) {
                toast.success("Announcement created successfully")
                fetchData()
                setCreateOpen(false)
                resetForm()
            } else {
                toast.error(result.message || "Failed to create announcement")
            }
        } catch (error) {
            toast.error("Failed to create announcement")
            console.error(error)
        }
    }

    const handleEdit = (announcement: AnnouncementWithId) => {
        setEditingAnnouncement(announcement)
        setFormData({
            title: announcement.title,
            message: announcement.message,
            category: announcement.category,
            priority: announcement.priority,
            target_audience: announcement.target_audience,
            active: announcement.active,
            expires_at: announcement.expires_at ? new Date(announcement.expires_at) : undefined
        })
        setExpiryDate(announcement.expires_at ? new Date(announcement.expires_at) : undefined)
        setEditOpen(true)
    }

    const handleUpdate = async () => {
        if (!editingAnnouncement) return

        try {
            const result = await updateAnnouncement(editingAnnouncement.id, formData)

            if (result.success) {
                toast.success("Announcement updated successfully")
                fetchData()
                setEditOpen(false)
                resetForm()
            } else {
                toast.error(result.message || "Failed to update announcement")
            }
        } catch (error) {
            toast.error("Failed to update announcement")
            console.error(error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return

        try {
            const result = await deleteAnnouncement(id)
            if (result.success) {
                toast.success("Announcement deleted successfully")
                fetchData()
            } else {
                toast.error(result.message || "Failed to delete announcement")
            }
        } catch (error) {
            toast.error("Failed to delete announcement")
            console.error(error)
        }
    }

    const handleToggleStatus = async (id: number) => {
        try {
            const result = await toggleAnnouncementStatus(id)
            if (result.success) {
                toast.success("Status updated successfully")
                fetchData()
            } else {
                toast.error(result.message || "Failed to update status")
            }
        } catch (error) {
            toast.error("Failed to update status")
            console.error(error)
        }
    }

    const resetForm = () => {
        setFormData({
            title: "",
            message: "",
            category: "general",
            priority: "medium",
            target_audience: "all",
            active: true,
            expires_at: undefined
        })
        setExpiryDate(undefined)
        setEditingAnnouncement(null)
    }

    const isExpired = (expiresAt: Date | null | undefined) => {
        if (!expiresAt) return false
        return new Date(expiresAt) < new Date()
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Announcements</h1>
                    <p className="text-muted-foreground mt-2">
                        Create and manage food-related announcements
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchData} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Announcement
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Megaphone className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Expired</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Announcements List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : announcements.length === 0 ? (
                <Card className="py-12">
                    <CardContent className="text-center">
                        <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No announcements yet</p>
                        <Button onClick={() => setCreateOpen(true)} variant="link" className="mt-2">
                            Create your first announcement
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement) => {
                        const expired = isExpired(announcement.expires_at)

                        return (
                            <Card
                                key={announcement.id}
                                className={`${expired ? 'opacity-60' : ''} hover:shadow-md transition-shadow`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {announcement.active && !expired ? (
                                                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                        ACTIVE
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                        INACTIVE
                                                    </span>
                                                )}
                                                {expired && (
                                                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                        EXPIRED
                                                    </span>
                                                )}
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${priorityColors[announcement.priority]}`}>
                                                    {announcement.priority.toUpperCase()}
                                                </span>
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${categoryColors[announcement.category]}`}>
                                                    {categoryLabels[announcement.category]}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {announcement.target_audience === "all" ? "Everyone" : announcement.target_audience}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                                    <Bell className="h-5 w-5 text-muted-foreground" />
                                                    {announcement.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                                                    {announcement.message}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Created: {new Date(announcement.created_at!).toLocaleString()}
                                                </span>
                                                {announcement.expires_at && (
                                                    <span className="flex items-center gap-1">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        Expires: {new Date(announcement.expires_at).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleStatus(announcement.id)}
                                            >
                                                {announcement.active ? (
                                                    <><EyeOff className="h-4 w-4 md:mr-2" /><span className="hidden md:inline">Deactivate</span></>
                                                ) : (
                                                    <><Eye className="h-4 w-4 md:mr-2" /><span className="hidden md:inline">Activate</span></>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(announcement)}
                                            >
                                                <Edit className="h-4 w-4 md:mr-2" />
                                                <span className="hidden md:inline">Edit</span>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(announcement.id)}
                                            >
                                                <Trash2 className="h-4 w-4 md:mr-2" />
                                                <span className="hidden md:inline">Delete</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={createOpen || editOpen} onOpenChange={(open) => {
                if (!open) {
                    setCreateOpen(false)
                    setEditOpen(false)
                    resetForm()
                }
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editOpen ? "Edit Announcement" : "Create New Announcement"}
                        </DialogTitle>
                        <DialogDescription>
                            {editOpen ? "Update announcement details" : "Create a new announcement for users"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Title *</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter announcement title"
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label>Message *</Label>
                            <Textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Enter announcement message"
                                rows={6}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value as typeof formData.category })}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hostel_rules">Hostel Rules</SelectItem>
                                        <SelectItem value="event">Event</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                        <SelectItem value="menu_update">Menu Update</SelectItem>
                                        <SelectItem value="service_info">Service Info</SelectItem>
                                        <SelectItem value="timing_change">Timing Change</SelectItem>
                                        <SelectItem value="special_meal">Special Meal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => setFormData({ ...formData, priority: value as typeof formData.priority })}
                                >
                                    <SelectTrigger className="mt-2">
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

                        <div>
                            <Label>Target Audience</Label>
                            <Select
                                value={formData.target_audience}
                                onValueChange={(value) => setFormData({ ...formData, target_audience: value as typeof formData.target_audience })}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Everyone</SelectItem>
                                    <SelectItem value="students">Students Only</SelectItem>
                                    <SelectItem value="wardens">Wardens Only</SelectItem>
                                    <SelectItem value="admins">Admins Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Expiry Date (Optional)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start mt-2">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {expiryDate ? expiryDate.toLocaleDateString() : "No expiry"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={expiryDate}
                                        onSelect={(date) => {
                                            setExpiryDate(date)
                                            setFormData({ ...formData, expires_at: date })
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>Active Status</Label>
                            <Switch
                                checked={formData.active}
                                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCreateOpen(false)
                                setEditOpen(false)
                                resetForm()
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={editOpen ? handleUpdate : handleCreate}>
                            {editOpen ? "Update" : "Create"} Announcement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AnnouncementsPage
