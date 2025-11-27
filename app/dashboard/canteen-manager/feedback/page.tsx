"use client"

import * as React from "react"
import {
    Search,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    Clock,
    Star,
    Users,
    RefreshCw,
    Eye,
    Send,
    Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
    getAllFeedback,
    updateFeedbackStatus,
    getFeedbackStats
} from "./actions"
import { Feedback } from "@/lib/types"

type FeedbackWithId = Feedback & { id: number }

const categoryLabels: Record<string, string> = {
    food_quality: "Food Quality",
    service: "Service",
    hygiene: "Hygiene",
    suggestion: "Suggestion",
    complaint: "Complaint",
    other: "Other"
}

const categoryColors: Record<string, string> = {
    food_quality: "bg-blue-100 text-blue-800 border-blue-200",
    service: "bg-purple-100 text-purple-800 border-purple-200",
    hygiene: "bg-red-100 text-red-800 border-red-200",
    suggestion: "bg-green-100 text-green-800 border-green-200",
    complaint: "bg-orange-100 text-orange-800 border-orange-200",
    other: "bg-gray-100 text-gray-800 border-gray-200"
}

const priorityColors: Record<string, string> = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700"
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    reviewing: "bg-blue-100 text-blue-800 border-blue-300",
    resolved: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300"
}

const FeedbackPage = () => {
    const [feedbacks, setFeedbacks] = React.useState<FeedbackWithId[]>([])
    const [filteredFeedbacks, setFilteredFeedbacks] = React.useState<FeedbackWithId[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<string>("all")
    const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
    const [priorityFilter, setPriorityFilter] = React.useState<string>("all")
    const [selectedFeedback, setSelectedFeedback] = React.useState<FeedbackWithId | null>(null)
    const [detailsOpen, setDetailsOpen] = React.useState(false)
    const [responseOpen, setResponseOpen] = React.useState(false)
    const [response, setResponse] = React.useState("")
    const [newStatus, setNewStatus] = React.useState<string>("reviewing")
    const [stats, setStats] = React.useState({
        total: 0,
        pending: 0,
        resolved: 0,
        highPriority: 0,
        averageRating: "0"
    })

    React.useEffect(() => {
        fetchData()
    }, [])

    React.useEffect(() => {
        applyFilters()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, statusFilter, categoryFilter, priorityFilter, feedbacks])    // Load from localStorage on mount
    React.useEffect(() => {
        const cached = localStorage.getItem('canteen_feedback_cache')
        if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            const fiveMinutes = 5 * 60 * 1000
            if (Date.now() - timestamp < fiveMinutes) {
                setFeedbacks(data)
                setLoading(false)
            }
        }
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [feedbackRes, statsRes] = await Promise.all([
                getAllFeedback(),
                getFeedbackStats()
            ])

            if (feedbackRes.success && feedbackRes.data) {
                setFeedbacks(feedbackRes.data as FeedbackWithId[])
                // Cache in localStorage
                localStorage.setItem('canteen_feedback_cache', JSON.stringify({
                    data: feedbackRes.data,
                    timestamp: Date.now()
                }))
            } else {
                setFeedbacks([])
            }

            if (statsRes.success && statsRes.data) {
                setStats({
                    ...statsRes.data,
                    averageRating: String(statsRes.data.averageRating)
                })
            }
        } catch (error) {
            toast.error("Failed to fetch feedback data")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = [...feedbacks]

        if (searchQuery) {
            filtered = filtered.filter(fb =>
                fb.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                fb.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                fb.user_name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (statusFilter && statusFilter !== "all") {
            filtered = filtered.filter(fb => fb.status === statusFilter)
        }

        if (categoryFilter && categoryFilter !== "all") {
            filtered = filtered.filter(fb => fb.category === categoryFilter)
        }

        if (priorityFilter && priorityFilter !== "all") {
            filtered = filtered.filter(fb => fb.priority === priorityFilter)
        }

        setFilteredFeedbacks(filtered)
    }

    const handleViewDetails = (feedback: FeedbackWithId) => {
        setSelectedFeedback(feedback)
        setDetailsOpen(true)
    }

    const handleRespond = (feedback: FeedbackWithId) => {
        setSelectedFeedback(feedback)
        setResponse(feedback.response || "")
        setNewStatus(feedback.status === "pending" ? "reviewing" : feedback.status)
        setResponseOpen(true)
    }

    const handleSubmitResponse = async () => {
        if (!selectedFeedback) return

        try {
            const result = await updateFeedbackStatus(
                selectedFeedback.id,
                newStatus,
                response
            )

            if (result.success) {
                toast.success("Response submitted successfully")
                fetchData()
                setResponseOpen(false)
                setResponse("")
            } else {
                toast.error(result.message || "Failed to submit response")
            }
        } catch (error) {
            toast.error("Failed to submit response")
            console.error(error)
        }
    }

    const clearFilters = () => {
        setSearchQuery("")
        setStatusFilter("all")
        setCategoryFilter("all")
        setPriorityFilter("all")
    }

    const exportToCSV = () => {
        const csvContent = [
            ["ID", "Date", "User", "Role", "Category", "Priority", "Subject", "Status", "Rating"],
            ...filteredFeedbacks.map(fb => [
                fb.id,
                new Date(fb.created_at!).toLocaleDateString(),
                fb.user_name,
                fb.user_role,
                categoryLabels[fb.category],
                fb.priority,
                fb.subject,
                fb.status,
                fb.rating || "N/A"
            ])
        ].map(row => row.join(",")).join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `feedback-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success("Feedback exported successfully")
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Feedback & Complaints</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and respond to user feedback
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchData} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={exportToCSV} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                            <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageRating}/5</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2">
                            <Label>Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reviewing">Reviewing</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
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
                            <Label>Priority</Label>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Actions</Label>
                            <Button onClick={clearFilters} variant="outline" className="w-full">
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
                Showing {filteredFeedbacks.length} of {feedbacks.length} feedback items
            </div>

            {/* Feedback List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : filteredFeedbacks.length === 0 ? (
                <Card className="py-12">
                    <CardContent className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No feedback found</p>
                        <Button onClick={clearFilters} variant="link" className="mt-2">
                            Clear filters to see all feedback
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredFeedbacks.map((feedback) => (
                        <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${statusColors[feedback.status]}`}>
                                                {feedback.status.toUpperCase()}
                                            </span>
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${priorityColors[feedback.priority]}`}>
                                                {feedback.priority.toUpperCase()}
                                            </span>
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${categoryColors[feedback.category]}`}>
                                                {categoryLabels[feedback.category]}
                                            </span>
                                            {feedback.rating && (
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    {feedback.rating}/5
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-lg">{feedback.subject}</h3>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {feedback.message}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {feedback.user_name} ({feedback.user_role})
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(feedback.created_at!).toLocaleString()}
                                            </span>
                                        </div>

                                        {feedback.response && (
                                            <div className="mt-3 p-3 bg-muted rounded-md">
                                                <p className="text-sm font-medium mb-1">Response:</p>
                                                <p className="text-sm text-muted-foreground">{feedback.response}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex md:flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(feedback)}
                                        >
                                            <Eye className="h-4 w-4 md:mr-2" />
                                            <span className="hidden md:inline">View</span>
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => handleRespond(feedback)}
                                        >
                                            <Send className="h-4 w-4 md:mr-2" />
                                            <span className="hidden md:inline">Respond</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* View Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Feedback Details</DialogTitle>
                    </DialogHeader>
                    {selectedFeedback && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>User</Label>
                                    <p className="text-sm mt-1">{selectedFeedback.user_name}</p>
                                </div>
                                <div>
                                    <Label>Role</Label>
                                    <p className="text-sm mt-1 capitalize">{selectedFeedback.user_role}</p>
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <p className="text-sm mt-1">{categoryLabels[selectedFeedback.category]}</p>
                                </div>
                                <div>
                                    <Label>Priority</Label>
                                    <p className="text-sm mt-1 capitalize">{selectedFeedback.priority}</p>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <p className="text-sm mt-1 capitalize">{selectedFeedback.status}</p>
                                </div>
                                <div>
                                    <Label>Created</Label>
                                    <p className="text-sm mt-1">
                                        {new Date(selectedFeedback.created_at!).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Label>Subject</Label>
                                <p className="text-sm mt-1">{selectedFeedback.subject}</p>
                            </div>
                            <div>
                                <Label>Message</Label>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedFeedback.message}</p>
                            </div>
                            {selectedFeedback.response && (
                                <div>
                                    <Label>Response</Label>
                                    <p className="text-sm mt-1 whitespace-pre-wrap">{selectedFeedback.response}</p>
                                </div>
                            )}
                            {selectedFeedback.rating && (
                                <div>
                                    <Label>Rating</Label>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < selectedFeedback.rating!
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Response Dialog */}
            <Dialog open={responseOpen} onOpenChange={setResponseOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Respond to Feedback</DialogTitle>
                        <DialogDescription>
                            Update status and provide a response
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reviewing">Reviewing</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Response Message</Label>
                            <Textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Enter your response..."
                                rows={6}
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResponseOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitResponse}>
                            Submit Response
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default FeedbackPage
