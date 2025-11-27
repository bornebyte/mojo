"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { getUserFromTokenCookie } from "@/app/actions"
import { getStudentComplaints, submitComplaint } from "../actions"
import { AlertCircle, CheckCircle, Clock, XCircle, Plus, MessageSquare } from "lucide-react"
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

export default function StudentComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [userId, setUserId] = useState<number | null>(null)
    const [userName, setUserName] = useState<string>("")
    const [userUSN, setUserUSN] = useState<string>("")

    const [formData, setFormData] = useState({
        category: "",
        priority: "medium",
        subject: "",
        description: ""
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await getUserFromTokenCookie()
                if (user && user.id) {
                    setUserId(user.id)
                    setUserName(user.name || "")
                    setUserUSN(user.usn_id || "")

                    const complaintsResult = await getStudentComplaints(user.id)
                    if (complaintsResult.success && complaintsResult.data) {
                        setComplaints(complaintsResult.data as Complaint[])
                    }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!userId) {
            toast.error("User not found")
            return
        }

        if (!formData.category || !formData.subject || !formData.description) {
            toast.error("Please fill in all required fields")
            return
        }

        setSubmitting(true)
        try {
            const result = await submitComplaint({
                user_id: userId,
                student_name: userName,
                student_usn: userUSN,
                category: formData.category,
                priority: formData.priority,
                subject: formData.subject,
                description: formData.description
            })

            if (result.success) {
                toast.success("Complaint submitted successfully")
                setDialogOpen(false)
                setFormData({
                    category: "",
                    priority: "medium",
                    subject: "",
                    description: ""
                })

                // Refresh complaints
                const complaintsResult = await getStudentComplaints(userId)
                if (complaintsResult.success && complaintsResult.data) {
                    setComplaints(complaintsResult.data as Complaint[])
                }
            } else {
                toast.error(result.message || "Failed to submit complaint")
            }
        } catch (error) {
            console.error("Error submitting complaint:", error)
            toast.error("An error occurred while submitting")
        } finally {
            setSubmitting(false)
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Complaints</h1>
                    <p className="text-muted-foreground">
                        Submit and track your complaints and issues
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="mt-4 md:mt-0">
                            <Plus className="mr-2 h-4 w-4" />
                            New Complaint
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Submit a Complaint</DialogTitle>
                            <DialogDescription>
                                Describe your issue or concern. We&apos;ll review it and get back to you.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hostel_facilities">Hostel Facilities</SelectItem>
                                            <SelectItem value="food_quality">Food Quality</SelectItem>
                                            <SelectItem value="hygiene">Hygiene & Cleanliness</SelectItem>
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
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                                    >
                                        <SelectTrigger id="priority">
                                            <SelectValue placeholder="Select priority" />
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
                                <Label htmlFor="subject">Subject *</Label>
                                <Input
                                    id="subject"
                                    placeholder="Brief description of the issue"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Detailed Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Provide detailed information about your complaint..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={5}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Submitting..." : "Submit Complaint"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
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
                        <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {complaints.filter(c => c.status === 'reviewing').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Complaints List */}
            <div className="space-y-4">
                {complaints.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-center">
                                No complaints submitted yet
                            </p>
                            <p className="text-sm text-muted-foreground text-center mt-2">
                                Click &quot;New Complaint&quot; to submit your first complaint
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    complaints.map((complaint) => (
                        <Card key={complaint.id}>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getStatusIcon(complaint.status)}
                                            <CardTitle className="text-lg">{complaint.subject}</CardTitle>
                                        </div>
                                        <CardDescription>
                                            <div className="flex flex-wrap gap-2 mt-2">
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
                                    <div className="text-sm text-muted-foreground">
                                        {format(new Date(complaint.created_at), 'MMM dd, yyyy HH:mm')}
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
        </div>
    )
}
