"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { UserPayload } from "@/lib/types"
import { getWardenNameByStudentBuildingAndFloor, updateUser, deleteUser } from "./actions"

function WardenNameDisplay({ building, floor }: { building?: string | null, floor?: string | null }) {
    const [wardenName, setWardenName] = React.useState("Loading...");

    React.useEffect(() => {
        if (building && floor) {
            getWardenNameByStudentBuildingAndFloor(building, floor)
                .then(name => setWardenName(name || "N/A"))
                .catch(() => setWardenName("Error"));
        } else {
            setWardenName("N/A");
        }
    }, [building, floor]);

    return <>{wardenName}</>;
}

type TableMeta = {
    onEdit: (user: UserPayload) => void;
    onDelete: (user: UserPayload) => void;
}

export const columns: ColumnDef<UserPayload>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
            <div>{row.getValue("id")}</div>
        ),
        enableHiding: false,
    },
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "allocated_building",
        header: "Building",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("allocated_building") || "N/A"}</div>
        ),
    },
    {
        accessorKey: "allocated_floor",
        header: "Floor",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("allocated_floor") || "N/A"}</div>
        ),
    },
    {
        accessorKey: "allocated_room",
        header: "Room",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("allocated_room") || "N/A"}</div>
        ),
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string;
            const roleColors: Record<string, string> = {
                admin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
                warden: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                student: "bg-green-500/10 text-green-500 border-green-500/20",
                "canteen manager": "bg-orange-500/10 text-orange-500 border-orange-500/20",
            };
            return (
                <Badge variant="outline" className={roleColors[role] || ""}>
                    {role}
                </Badge>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const statusColors: Record<string, string> = {
                active: "bg-green-500/10 text-green-500 border-green-500/20",
                inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
                suspended: "bg-red-500/10 text-red-500 border-red-500/20",
            };
            return (
                <Badge variant="outline" className={statusColors[status] || ""}>
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => {
            const phone = row.getValue("phone") as string;
            return phone ? (
                <a href={`tel:${phone}`} className="text-blue-500 hover:underline">
                    {phone}
                </a>
            ) : (
                <div>N/A</div>
            );
        },
    },
    {
        accessorKey: "usn_id",
        header: "USN_ID",
        cell: ({ row }) => <div>{row.getValue("usn_id") || "N/A"}</div>,
    },
    {
        accessorKey: "added_by_name",
        header: "Added by Name",
        cell: ({ row }) => <div className="capitalize">{row.getValue("added_by_name") || "N/A"}</div>,
    },
    {
        accessorKey: "added_by_id",
        header: "Added by ID",
        cell: ({ row }) => <div>{row.getValue("added_by_id") || "N/A"}</div>,
    },
    {
        accessorKey: "added_by_role",
        header: "Added by Role",
        cell: ({ row }) => <div className="capitalize">{row.getValue("added_by_role") || "N/A"}</div>,
    },
    {
        accessorKey: "assigned_building",
        header: "Warden Building",
        cell: ({ row }) => <div className="capitalize">{row.getValue("assigned_building") || "N/A"}</div>,
    },
    {
        accessorKey: "assigned_floor",
        header: "Warden Floor",
        cell: ({ row }) => {
            const floors = row.getValue("assigned_floor");
            try {
                return <div className="capitalize">{floors ? JSON.parse(floors as string).join(', ') : "N/A"}</div>
            } catch (e) {
                console.log("Error parsing JSON floors:", e);
                return <div className="capitalize">{floors as string || "N/A"}</div>
            }
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Created At
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div className="font-medium">{new Date(row.getValue("created_at")).toLocaleString()}</div>,
    },
    {
        id: "actions",
        enableHiding: false,
        header: "Actions",
        cell: ({ row, table }) => {
            const userdetail = row.original
            const meta = table.options.meta as TableMeta

            return (
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{userdetail.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs text-muted-foreground">
                                Email: {userdetail.email}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-muted-foreground">
                                Phone: {userdetail.phone}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-muted-foreground">
                                USN ID: {userdetail.usn_id || "N/A"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs text-muted-foreground">
                                Added By: {userdetail.added_by_name || "N/A"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-muted-foreground">
                                Warden: <WardenNameDisplay building={userdetail.allocated_building} floor={userdetail.allocated_floor} />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => meta?.onEdit(userdetail)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => meta?.onDelete(userdetail)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]

export function ManageMembersTable({ data }: { data: UserPayload[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({
            "select": false,
            "email": false,
            "phone": false,
            "usn_id": false,
            "added_by_name": false,
            "added_by_id": false,
            "added_by_role": false,
            "created_at": false,
            "assigned_building": false,
            "assigned_floor": false,
        })
    const [rowSelection, setRowSelection] = React.useState({})
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })

    // Update/Delete dialogs state
    const [editDialogOpen, setEditDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [selectedUser, setSelectedUser] = React.useState<UserPayload | null>(null)
    const [isUpdating, setIsUpdating] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)

    // Form data for editing
    const [editFormData, setEditFormData] = React.useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        status: "",
        usn_id: "",
        allocated_building: "",
        allocated_floor: "",
        allocated_room: "",
        assigned_building: "",
        assigned_floor: ""
    })

    const handleEdit = (user: UserPayload) => {
        setSelectedUser(user)
        setEditFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || "",
            status: user.status || "active",
            usn_id: user.usn_id || "",
            allocated_building: user.allocated_building || "",
            allocated_floor: user.allocated_floor || "",
            allocated_room: user.allocated_room || "",
            assigned_building: user.assigned_building || "",
            assigned_floor: user.assigned_floor || ""
        })
        setEditDialogOpen(true)
    }

    const handleDelete = (user: UserPayload) => {
        setSelectedUser(user)
        setDeleteDialogOpen(true)
    }

    const handleUpdateUser = async () => {
        if (!selectedUser || !selectedUser.id) return

        setIsUpdating(true)
        try {
            const result = await updateUser(selectedUser.id, editFormData)
            if (result.success) {
                toast.success("User updated successfully")
                setEditDialogOpen(false)
                window.location.reload()
            } else {
                toast.error(result.error || "Failed to update user")
            }
        } catch (error) {
            toast.error("Failed to update user")
            console.error(error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!selectedUser || !selectedUser.id) return

        setIsDeleting(true)
        try {
            const result = await deleteUser(selectedUser.id)
            if (result.success) {
                toast.success("User deleted successfully")
                setDeleteDialogOpen(false)
                window.location.reload()
            } else {
                toast.error(result.error || "Failed to delete user")
            }
        } catch (error) {
            toast.error("Failed to delete user")
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        meta: {
            onEdit: handleEdit,
            onDelete: handleDelete,
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    })

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 py-4">
                <Input
                    placeholder="Search names..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <div className="flex gap-2 ml-auto">
                    <Select
                        value={table.getState().pagination.pageSize.toString()}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Page size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 per page</SelectItem>
                            <SelectItem value="10">10 per page</SelectItem>
                            <SelectItem value="20">20 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
                            <SelectItem value="100">100 per page</SelectItem>
                        </SelectContent>
                    </Select>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 py-4 gap-2">
                <div className="text-muted-foreground text-sm">
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                    {Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                    )}{" "}
                    of {table.getFilteredRowModel().rows.length} entries
                    {table.getFilteredSelectedRowModel().rows.length > 0 &&
                        ` (${table.getFilteredSelectedRowModel().rows.length} selected)`
                    }
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        First
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <div className="text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        Last
                    </Button>
                </div>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit User Details</DialogTitle>
                        <DialogDescription>
                            Update information for {selectedUser?.name} ({selectedUser?.email})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    placeholder="Enter name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    placeholder="Enter email"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="usn_id">USN/ID</Label>
                                <Input
                                    id="usn_id"
                                    value={editFormData.usn_id}
                                    onChange={(e) => setEditFormData({ ...editFormData, usn_id: e.target.value })}
                                    placeholder="Enter USN/ID"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={editFormData.role}
                                    onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="warden">Warden</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="canteen manager">Canteen Manager</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={editFormData.status}
                                    onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3">Student Allocation</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="allocated_building">Building</Label>
                                    <Input
                                        id="allocated_building"
                                        value={editFormData.allocated_building}
                                        onChange={(e) => setEditFormData({ ...editFormData, allocated_building: e.target.value })}
                                        placeholder="Building"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="allocated_floor">Floor</Label>
                                    <Input
                                        id="allocated_floor"
                                        value={editFormData.allocated_floor}
                                        onChange={(e) => setEditFormData({ ...editFormData, allocated_floor: e.target.value })}
                                        placeholder="Floor"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="allocated_room">Room</Label>
                                    <Input
                                        id="allocated_room"
                                        value={editFormData.allocated_room}
                                        onChange={(e) => setEditFormData({ ...editFormData, allocated_room: e.target.value })}
                                        placeholder="Room"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3">Warden Assignment</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="assigned_building">Assigned Building</Label>
                                    <Input
                                        id="assigned_building"
                                        value={editFormData.assigned_building}
                                        onChange={(e) => setEditFormData({ ...editFormData, assigned_building: e.target.value })}
                                        placeholder="Building"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="assigned_floor">Assigned Floor</Label>
                                    <Input
                                        id="assigned_floor"
                                        value={editFormData.assigned_floor}
                                        onChange={(e) => setEditFormData({ ...editFormData, assigned_floor: e.target.value })}
                                        placeholder="Floor (JSON array)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateUser} disabled={isUpdating}>
                            {isUpdating ? "Updating..." : "Update User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedUser?.name} ({selectedUser?.email})?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
