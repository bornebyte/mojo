"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { getUserFromTokenCookie } from "@/app/actions"
import { getViolationsByStudent } from "@/app/dashboard/violations/actions"
import { Violation, UserPayload } from "@/lib/types"
import { AlertTriangle, RefreshCw, Eye, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { getFromCache, saveToCache } from "@/lib/cache-utils"

export default function StudentViolationsPage() {
    const [violations, setViolations] = useState<Violation[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<UserPayload | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null)

    useEffect(() => {
        const init = async () => {
            const userData = await getUserFromTokenCookie()
            setUser(userData as UserPayload)
            if (userData?.id) {
                await fetchViolationsWithCache(userData.id)
            }
        }
        init()
    }, [])

    const fetchViolationsWithCache = async (studentId: number, forceRefresh = false) => {
        setLoading(true)
        try {
            if (!forceRefresh) {
                const cached = getFromCache<Violation[]>(`student_violations_${studentId}`, user?.role)
                if (cached) {
                    setViolations(cached)
                    setLoading(false)
                    return
                }
            }

            const result = await getViolationsByStudent(studentId)
            if (result.success && result.data) {
                setViolations(result.data as Violation[])
                saveToCache(`student_violations_${studentId}`, result.data)
            }
        } catch (error) {
            toast.error("Failed to fetch violations")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        if (user?.id) {
            await fetchViolationsWithCache(user.id, true)
            toast.success("Violations refreshed")
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "minor":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case "moderate":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case "severe":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
            case "critical":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            default:
                return ""
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "reported":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case "under_review":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case "action_taken":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            case "resolved":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case "dismissed":
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            default:
                return ""
        }
    }

    const getViolationTypeLabel = (type: string) => {
        return type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    }

    const totalFines = violations.reduce((sum, v) => sum + (v.fine_amount || 0), 0)
    const paidFines = violations.reduce((sum, v) => v.fine_paid ? sum + (v.fine_amount || 0) : sum, 0)
    const pendingFines = totalFines - paidFines

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Violations</h1>
                    <p className="text-muted-foreground">
                        View your hostel rule violation records
                    </p>
                </div>
                <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Total Violations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{violations.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Fines
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalFines.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Fines Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₹{paidFines.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Fines Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ₹{pendingFines.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Violations Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Violation History ({violations.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {violations.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No violations recorded</p>
                            <p className="text-sm mt-2">Keep up the good behavior!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Fine</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {violations.map((violation) => (
                                        <TableRow key={violation.id}>
                                            <TableCell>
                                                {format(new Date(violation.incident_date), "MMM dd, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getViolationTypeLabel(violation.violation_type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getSeverityColor(violation.severity)}>
                                                    {violation.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="truncate">{violation.title}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(violation.status)}>
                                                    {violation.status.replace("_", " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {violation.fine_amount ? (
                                                    <div>
                                                        <div className="font-medium">₹{violation.fine_amount}</div>
                                                        {violation.fine_paid ? (
                                                            <Badge variant="outline" className="text-xs bg-green-100">
                                                                Paid
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs bg-red-100">
                                                                Pending
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSelectedViolation(violation)
                                                        setViewDialogOpen(true)
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Violation Details</DialogTitle>
                    </DialogHeader>
                    {selectedViolation && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Type</p>
                                    <p className="font-medium">
                                        {getViolationTypeLabel(selectedViolation.violation_type)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Severity</p>
                                    <Badge className={getSeverityColor(selectedViolation.severity)}>
                                        {selectedViolation.severity}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Title</p>
                                <p className="font-medium">{selectedViolation.title}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="text-sm">{selectedViolation.description}</p>
                            </div>

                            {selectedViolation.location && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="text-sm">{selectedViolation.location}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Incident Date</p>
                                    <p className="text-sm">
                                        {format(new Date(selectedViolation.incident_date), "PPP")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={getStatusColor(selectedViolation.status)}>
                                        {selectedViolation.status.replace("_", " ")}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Reported By</p>
                                <p className="text-sm">
                                    {selectedViolation.reported_by_name} ({selectedViolation.reported_by_role})
                                </p>
                            </div>

                            {selectedViolation.action_taken && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Action Taken</p>
                                    <p className="text-sm">{selectedViolation.action_taken}</p>
                                </div>
                            )}

                            {selectedViolation.fine_amount && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Fine Amount</p>
                                    <p className="font-medium text-lg">₹{selectedViolation.fine_amount}</p>
                                    {selectedViolation.fine_paid ? (
                                        <Badge variant="outline" className="mt-1 bg-green-100">
                                            Paid
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="mt-1 bg-red-100 text-red-800">
                                            Payment Pending
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
