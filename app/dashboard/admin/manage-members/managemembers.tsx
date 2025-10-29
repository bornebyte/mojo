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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { BuildingAllUsers } from "@/lib/types"
import { getWardenNameByStudentBuildingAndFloor } from "./actions"

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

export const columns: ColumnDef<BuildingAllUsers>[] = [
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
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("role")}</div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <div className="capitalize">{row.getValue("status")}</div>,
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
        cell: ({ row }) => <div>{row.getValue("phone")}</div>,
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
        accessorKey: "hold_reason",
        header: "Hold Reason",
        cell: ({ row }) => <div>{row.getValue("hold_reason") || "N/A"}</div>,
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
        cell: ({ row }) => {
            const userdetail = row.original

            return (
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
                        <DropdownMenuItem >
                            Email : {userdetail.email}
                        </DropdownMenuItem>
                        <DropdownMenuItem >
                            Phone : {userdetail.phone}
                        </DropdownMenuItem>
                        <DropdownMenuItem >
                            USN ID : {userdetail.usn_id || "N/A"}
                        </DropdownMenuItem>
                        <DropdownMenuItem >
                            Added By : {userdetail.added_by_name || "N/A"} ({userdetail.added_by_role || "N/A"})
                        </DropdownMenuItem>
                        <DropdownMenuItem >
                            Added By ID : {userdetail.added_by_id || "N/A"}
                        </DropdownMenuItem>
                        <DropdownMenuItem >
                            Warden : <WardenNameDisplay building={userdetail.allocated_building} floor={userdetail.allocated_floor} />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export function ManageMembersTable({ data }: { data: BuildingAllUsers[] }) {
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
            "hold_reason": false,
            "created_at": false,
            "assigned_building": false,
            "assigned_floor": false,
        })
    const [rowSelection, setRowSelection] = React.useState({})

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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full md:w-[700px] lg:w-[900px]">
            <div className="flex items-center gap-2 py-4">
                <Input
                    placeholder="Search names..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
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
            <div className="overflow-hidden rounded-md border">
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
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
