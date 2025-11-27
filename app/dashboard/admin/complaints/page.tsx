"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { getUserFromTokenCookie } from "@/app/actions"
import { getAllComplaints, updateComplaintStatus } from "@/app/dashboard/student/actions"
import { AlertCircle, CheckCircle, Clock, XCircle, MessageSquare, Filter } from "lucide-react"
import { format } from "date-fns"

type Complaint = {
    id: number;
    user_id: number;
    student_name: string;
    student_usn: string;
    category: string;
    priority: string;
    subject: string;
    description: string;
    status: string;
    response: string | null;
    responded_by: string | null;
    responded_at: string | null;
    created_at: string;
    updated_at: string;
}

export default function AdminComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
    const [responding, setResponding] = useState(false)
    const [userName, setUserName] = useState<string>("")

    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [filterPriority, setFilterPriority] = useState<string>("all")
    const [filterCategory, setFilterCategory] = useState<string>("all")

    const [responseData, setResponseData] = useState({
        status: "",
        response: ""
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await getUserFromTokenCookie()
                if (user && user.name) {
                    setUserName(user.name)
                }

                const complaintsResult = await getAllComplaints()
                if (complaintsResult.success && complaintsResult.data) {
                    setComplaints(complaintsResult.data as Complaint[])
                    setFilteredComplaints(complaintsResult.data as Complaint[])
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                toast.error("Failed to load complaints")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        let filtered = [...complaints]

        if (filterStatus !== "all") {
            filtered = filtered.filter(c => c.status === filterStatus)
        }
        if (filterPriority !== "all") {
            filtered = filtered.filter(c => c.priority === filterPriority)
        }
        if (filterCategory !== "all") {
            filtered = filtered.filter(c => c.category === filterCategory)
        }

        setFilteredComplaints(filtered)
    }, [filterStatus, filterPriority, filterCategory, complaints])

    const handleRespond = (complaint: Complaint) => {
        setSelectedComplaint(complaint)
        setResponseData({
            status: complaint.status,
            response: complaint.response || ""
        })
        setDialogOpen(true)
    }

    const handleSubmitResponse = async () => {
        if (!selectedComplaint) return

        if (!responseData.status) {
            toast.error("Please select a status")
            return
        }

        setResponding(true)
        try {
            const result = await updateComplaintStatus(
                selectedComplaint.id,
                responseData.status,
                responseData.response || undefined,
                userName
            )

            if (result.success) {
                toast.success("Complaint updated successfully")
                setDialogOpen(false)

                // Refresh complaints
                const complaintsResult = await getAllComplaints()
                if (complaintsResult.success && complaintsResult.data) {
                    setComplaints(complaintsResult.data as Complaint[])
                }
            } else {
                toast.error(result.message || "Failed to update complaint")
            }
        } catch (error) {
            console.error("Error updating complaint:", error)
            toast.error("An error occurred while updating")
        } finally {
            setResponding(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'resolved':
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'reviewing':
                return <Clock className="h-5 w-5 text-blue-500" />
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-500" />
            default:
                return <AlertCircle className="h-5 w-5 text-yellow-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'reviewing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            default:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            case 'low':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Complaints Management</h1>
                <p className="text-muted-foreground">
                    View and respond to student complaints
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{complaints.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {complaints.filter(c => c.status === 'pending').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Reviewing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {complaints.filter(c => c.status === 'reviewing').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {complaints.filter(c => c.status === 'resolved').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {complaints.filter(c => c.status === 'rejected').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reviewing">Reviewing</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={filterPriority} onValueChange={setFilterPriority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="hostel_facilities">Hostel Facilities</SelectItem>
                                    <SelectItem value="food_quality">Food Quality</SelectItem>
                                    <SelectItem value="hygiene">Hygiene</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="electricity">Electricity</SelectItem>
                                    <SelectItem value="water_supply">Water Supply</SelectItem>
                                    <SelectItem value="security">Security</SelectItem>
                                    <SelectItem value="wifi_internet">WiFi/Internet</SelectItem>
                                    <SelectItem value="staff_behavior">Staff Behavior</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Complaints List */}
            <div className="space-y-4">
                {filteredComplaints.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-center">
                                No complaints found matching the filters
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredComplaints.map((complaint) => (
                        <Card key={complaint.id}>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getStatusIcon(complaint.status)}
                                            <CardTitle className="text-lg">{complaint.subject}</CardTitle>
                                        </div>
                                        <CardDescription>
                                            <div className="mb-2">
                                                <span className="font-medium">Student:</span> {complaint.student_name} ({complaint.student_usn})
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                                                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                                                    {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)} Priority
                                                </span>
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                    {complaint.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                </span>
                                            </div>
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="text-sm text-muted-foreground">
                                            {format(new Date(complaint.created_at), 'MMM dd, yyyy HH:mm')}
                                        </div>
                                        <Button size="sm" onClick={() => handleRespond(complaint)}>
                                            {complaint.response ? 'Update' : 'Respond'}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {complaint.description}
                                    </p>
                                </div>
                                {complaint.response && (
                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Response
                                        </h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-2">
                                            {complaint.response}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Responded by {complaint.responded_by} on {complaint.responded_at ? format(new Date(complaint.responded_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Response Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Respond to Complaint</DialogTitle>
                        <DialogDescription>
                            Update the complaint status and provide a response to the student
                        </DialogDescription>
                    </DialogHeader>
                    {selectedComplaint && (
                        <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-semibold mb-1">{selectedComplaint.subject}</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                    by {selectedComplaint.student_name} ({selectedComplaint.student_usn})
                                </p>
                                <p className="text-sm">{selectedComplaint.description}</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={responseData.status}
                                    onValueChange={(value) => setResponseData({ ...responseData, status: value })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="reviewing">Reviewing</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="response">Response (Optional)</Label>
                                <Textarea
                                    id="response"
                                    placeholder="Provide a detailed response to the student..."
                                    value={responseData.response}
                                    onChange={(e) => setResponseData({ ...responseData, response: e.target.value })}
                                    rows={5}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    disabled={responding}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmitResponse} disabled={responding}>
                                    {responding ? "Updating..." : "Update Complaint"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
