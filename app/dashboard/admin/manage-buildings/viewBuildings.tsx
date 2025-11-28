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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { BuildingData } from "@/lib/types";
import { deleteBuilding, renameBuilding, deleteManyBuildings } from "./actions"
import { toast } from "sonner"

export const columns: ColumnDef<BuildingData>[] = [
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
        accessorKey: "building_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Building Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="capitalize font-medium">{row.getValue("building_name")}</div>,
    },
    {
        id: "total_capacity",
        header: "Capacity",
        cell: ({ row }) => {
            const floors = row.original.floors;
            const totalBeds = floors.reduce((acc, floor) => {
                const bedCount = floor.rooms.reduce((acc, room) => acc + room.bed_count, 0);
                return acc + bedCount;
            }, 0);
            const occupiedBeds = floors.reduce((acc, floor) => {
                const occupied = floor.rooms.reduce((acc, room) => acc + room.beds_occupied, 0);
                return acc + occupied;
            }, 0);
            const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(0) : 0;

            return (
                <div className="space-y-1">
                    <div className="text-sm font-medium">{occupiedBeds} / {totalBeds}</div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${occupancyRate}%` }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">{occupancyRate}%</span>
                    </div>
                </div>
            );
        },
    },
    {
        id: "floors_rooms",
        header: "Structure",
        cell: ({ row }) => {
            const building = row.original;
            const totalRooms = building.floors.reduce((acc, floor) => acc + floor.rooms.length, 0);
            return (
                <div className="space-y-1">
                    <div className="text-sm">{building.floors.length} Floors</div>
                    <div className="text-xs text-muted-foreground">{totalRooms} Rooms</div>
                </div>
            );
        },
    },
    {
        accessorKey: "added_by_name",
        header: "Added By",
        cell: ({ row }) => <div className="capitalize text-sm">{row.getValue("added_by_name")}</div>,
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Created
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return <div className="text-sm text-muted-foreground">{date.toLocaleDateString()}</div>;
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row, table }) => {
            const building = row.original
            const tableInstance = table as any

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72">
                        <DropdownMenuLabel className="font-semibold">{building.building_name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Building Stats</DropdownMenuLabel>
                        <DropdownMenuItem className="text-xs">
                            🏢 Total Floors: {building.floors.length}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">
                            🚪 Total Rooms: {building.floors.reduce((acc, floor) => acc + floor.rooms.length, 0)}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">
                            🛏️ Total Beds: {building.floors.reduce((acc, floor) => {
                                return acc + floor.rooms.reduce((acc, room) => acc + room.bed_count, 0);
                            }, 0)}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">
                            👥 Occupied: {building.floors.reduce((acc, floor) => {
                                return acc + floor.rooms.reduce((acc, room) => acc + room.beds_occupied, 0);
                            }, 0)}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Floor Distribution</DropdownMenuLabel>
                        {building.floors.slice(0, 5).map((floor, idx) => (
                            <DropdownMenuItem key={idx} className="text-xs">
                                Floor {floor.floor_number === 0 ? 'G' : floor.floor_number}: {floor.rooms.length} rooms
                            </DropdownMenuItem>
                        ))}
                        {building.floors.length > 5 && (
                            <DropdownMenuItem className="text-xs text-muted-foreground">
                                ...and {building.floors.length - 5} more floors
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Details</DropdownMenuLabel>
                        <DropdownMenuItem className="text-xs">
                            Added by: {building.added_by_name}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">
                            Created: {new Date(building.created_at).toLocaleString()}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => tableInstance.options.meta?.openRenameDialog(building)}
                            className="cursor-pointer"
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename Building
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => tableInstance.options.meta?.handleDelete(building)}
                            className="text-red-600 cursor-pointer focus:text-red-600"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Building
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-light">
                            Rooms per Floor: {building.floors.map(f => `${f.floor_number === 0 ? 'G' : f.floor_number}: ${f.rooms.length}`).join(', ')}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-light">
                            Created: {new Date(building.created_at).toLocaleDateString()}
                        </DropdownMenuLabel>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export function BuildingsTable({ data }: { data: BuildingData[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({
            "added_by_name": false,
            "created_at": false,
        })
    const [rowSelection, setRowSelection] = React.useState({})
    const [renameDialogOpen, setRenameDialogOpen] = React.useState(false)
    const [selectedBuilding, setSelectedBuilding] = React.useState<BuildingData | null>(null)
    const [newBuildingName, setNewBuildingName] = React.useState("")

    const handleRename = async () => {
        if (!selectedBuilding || !newBuildingName.trim()) {
            toast.error("Please enter a valid building name")
            return
        }

        const result = await renameBuilding(selectedBuilding.building_id, newBuildingName.trim())

        if (result.success) {
            toast.success(result.message)
            setRenameDialogOpen(false)
            setNewBuildingName("")
            setSelectedBuilding(null)
            window.location.reload() // Refresh to show updated data
        } else {
            toast.error(result.message)
        }
    }

    const handleDelete = async (building: BuildingData) => {
        if (!confirm(`Are you sure you want to delete ${building.building_name}? This will also delete all floors and rooms.`)) {
            return
        }

        const result = await deleteBuilding(building.building_id)

        if (result.success) {
            toast.success(result.message)
            window.location.reload() // Refresh to show updated data
        } else {
            toast.error(result.message)
        }
    }

    const handleDeleteMany = async () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        if (selectedRows.length === 0) {
            toast.error("Please select buildings to delete")
            return
        }

        if (!confirm(`Are you sure you want to delete ${selectedRows.length} building(s)? This will also delete all floors and rooms.`)) {
            return
        }

        const buildingIds = selectedRows.map(row => row.original.building_id)
        const result = await deleteManyBuildings(buildingIds)

        if (result.success) {
            toast.success(result.message)
            setRowSelection({})
            window.location.reload() // Refresh to show updated data
        } else {
            toast.error(result.message)
        }
    }

    const openRenameDialog = (building: BuildingData) => {
        setSelectedBuilding(building)
        setNewBuildingName(building.building_name)
        setRenameDialogOpen(true)
    }

    const table = useReactTable({
        data,
        columns: columns as ColumnDef<BuildingData>[],
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
        meta: {
            openRenameDialog,
            handleDelete,
        },
    })

    return (
        <div className="w-full md:w-[700px] lg:w-[900px]">
            <div className="flex items-center py-4 gap-2">
                <Input
                    placeholder="Filter by building name..."
                    value={(table.getColumn("building_name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("building_name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteMany}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete ({table.getFilteredSelectedRowModel().rows.length})
                    </Button>
                )}
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
                                    colSpan={table.getAllColumns().length}
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

            {/* Rename Dialog */}
            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Building</DialogTitle>
                        <DialogDescription>
                            Enter a new name for {selectedBuilding?.building_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="buildingName">Building Name</Label>
                            <Input
                                id="buildingName"
                                value={newBuildingName}
                                onChange={(e) => setNewBuildingName(e.target.value)}
                                placeholder="Enter new building name"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRename}>
                            Rename
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
