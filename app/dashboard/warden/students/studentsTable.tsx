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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Phone, Mail, Building2, Home, DoorClosed, CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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

export const columns: ColumnDef<UserPayload>[] = [
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
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="capitalize font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => {
            const phone = row.getValue("phone") as string;
            return phone ? (
                <a href={`tel:${phone}`} className="text-blue-500 hover:underline" onClick={(e) => e.stopPropagation()}>
                    {phone}
                </a>
            ) : (
                <div>N/A</div>
            );
        },
    },
    {
        accessorKey: "allocated_room",
        header: "Location",
        cell: ({ row }) => {
            const building = row.original.allocated_building;
            const floor = row.original.allocated_floor;
            const room = row.getValue("allocated_room") as string;
            return (
                <div className="text-sm">
                    <span className="font-medium">{building || "N/A"}</span>
                    {floor && room && (
                        <span className="text-muted-foreground"> · Floor {floor} · {room}</span>
                    )}
                </div>
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
        id: "actions",
        header: "More",
        cell: ({ row }) => {
            const student = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-1.5 text-sm font-semibold">Contact</div>
                        {student.email && (
                            <div className="px-2 py-1.5 text-sm flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <a href={`mailto:${student.email}`} className="text-blue-500 hover:underline truncate">
                                    {student.email}
                                </a>
                            </div>
                        )}
                        {student.phone && (
                            <div className="px-2 py-1.5 text-sm flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <a href={`tel:${student.phone}`} className="text-blue-500 hover:underline">
                                    {student.phone}
                                </a>
                            </div>
                        )}
                        <div className="border-t my-1" />
                        <div className="px-2 py-1.5 text-sm font-semibold">Details</div>
                        {student.usn_id && (
                            <div className="px-2 py-1.5 text-sm flex items-center gap-2">
                                <span className="text-muted-foreground">USN:</span>
                                <span className="font-medium">{student.usn_id}</span>
                            </div>
                        )}
                        {student.allocated_building && (
                            <div className="px-2 py-1.5 text-sm flex items-center gap-2">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                <span>{student.allocated_building}</span>
                            </div>
                        )}
                        {student.allocated_floor && (
                            <div className="px-2 py-1.5 text-sm flex items-center gap-2">
                                <Home className="h-3 w-3 text-muted-foreground" />
                                <span>Floor {student.allocated_floor}</span>
                            </div>
                        )}
                        {student.allocated_room && (
                            <div className="px-2 py-1.5 text-sm flex items-center gap-2">
                                <DoorClosed className="h-3 w-3 text-muted-foreground" />
                                <span>{student.allocated_room}</span>
                            </div>
                        )}
                        {student.created_at && (
                            <div className="px-2 py-1.5 text-sm flex items-center gap-2">
                                <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                <span>{new Date(student.created_at).toLocaleDateString()}</span>
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
]

export function WardenStudentsTable({ data }: { data: UserPayload[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })

    // Get unique floors from actual student data
    const uniqueFloors = React.useMemo(() => {
        const floors = new Set<string>();
        data.forEach(student => {
            if (student.allocated_floor) {
                floors.add(student.allocated_floor);
            }
        });
        return Array.from(floors).sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            return numA - numB;
        });
    }, [data])

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
                    placeholder="Search students..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <Select
                    value={(table.getColumn("allocated_room")?.getFilterValue() as string) ?? "all"}
                    onValueChange={(value) => {
                        if (value === "all") {
                            table.resetColumnFilters();
                        } else {
                            table.getColumn("allocated_room")?.setFilterValue(value);
                        }
                    }}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by floor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Floors</SelectItem>
                        {uniqueFloors.map((floor) => (
                            <SelectItem key={floor} value={floor}>
                                Floor {floor}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
            <div className="rounded-md border">
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
                                    No students found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-muted-foreground text-sm">
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                    {Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                    )}{" "}
                    of {table.getFilteredRowModel().rows.length} students
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
        </div>
    )
}
