"use client"

import * as React from "react"
import {
  Calendar as CalendarIcon,
  Search,
  Edit,
  Trash2,
  Plus,
  Coffee,
  UtensilsCrossed,
  Cookie,
  Moon,
  Download,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  getAllMenus,
  deleteMenuById,
  updateMenuById
} from "./actions"
import { Menu } from "@/lib/types"

type MenuWithId = Menu & { id: number }

const mealIcons = {
  breakfast: Coffee,
  lunch: UtensilsCrossed,
  snacks: Cookie,
  dinner: Moon,
}

const mealColors = {
  breakfast: "text-yellow-600 bg-yellow-50 border-yellow-200",
  lunch: "text-green-600 bg-green-50 border-green-200",
  snacks: "text-orange-600 bg-orange-50 border-orange-200",
  dinner: "text-blue-600 bg-blue-50 border-blue-200",
}

const ViewMenuComponents = () => {
  const [menus, setMenus] = React.useState<MenuWithId[]>([])
  const [filteredMenus, setFilteredMenus] = React.useState<MenuWithId[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [dateFilter, setDateFilter] = React.useState<Date | undefined>(undefined)
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>({})
  const [viewMode, setViewMode] = React.useState<"list" | "card">("card")

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingMenu, setEditingMenu] = React.useState<MenuWithId | null>(null)
  const [editItems, setEditItems] = React.useState<string[]>([])

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [deletingMenuId, setDeletingMenuId] = React.useState<number | null>(null)

  // Fetch all menus on component mount
  React.useEffect(() => {
    fetchMenus()
  }, [])

  // Apply filters whenever search, type, or date changes
  React.useEffect(() => {
    applyFilters()
  }, [searchQuery, typeFilter, dateFilter, dateRange, menus])

  const fetchMenus = async () => {
    setLoading(true)
    try {
      const result = await getAllMenus()
      if (result.success && result.data) {
        setMenus(result.data as MenuWithId[])
      } else {
        setMenus([])
      }
    } catch (error) {
      toast.error("Failed to fetch menus")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...menus]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(menu =>
        menu.items.some(item =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        menu.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter(menu => menu.type === typeFilter)
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(menu => {
        const menuDate = new Date(menu.date)
        return menuDate.toDateString() === dateFilter.toDateString()
      })
    }

    // Date range filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(menu => {
        const menuDate = new Date(menu.date)
        return menuDate >= dateRange.from! && menuDate <= dateRange.to!
      })
    }

    setFilteredMenus(filtered)
  }

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteMenuById(id)
      if (result.success) {
        toast.success("Menu deleted successfully")
        fetchMenus()
        setDeleteDialogOpen(false)
      } else {
        toast.error(result.message || "Failed to delete menu")
      }
    } catch (error) {
      toast.error("Failed to delete menu")
      console.error(error)
    }
  }

  const handleEdit = (menu: MenuWithId) => {
    setEditingMenu(menu)
    setEditItems([...menu.items])
    setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingMenu) return

    try {
      const result = await updateMenuById(editingMenu.id, { items: editItems })
      if (result.success) {
        toast.success("Menu updated successfully")
        fetchMenus()
        setEditDialogOpen(false)
      } else {
        toast.error(result.message || "Failed to update menu")
      }
    } catch (error) {
      toast.error("Failed to update menu")
      console.error(error)
    }
  }

  const handleAddItem = () => {
    setEditItems([...editItems, ""])
  }

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...editItems]
    newItems[index] = value
    setEditItems(newItems)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setTypeFilter("all")
    setDateFilter(undefined)
    setDateRange({})
  }

  const exportToCSV = () => {
    const csvContent = [
      ["ID", "Date", "Type", "Items"],
      ...filteredMenus.map(menu => [
        menu.id,
        new Date(menu.date).toLocaleDateString(),
        menu.type,
        menu.items.join("; ")
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `menus-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Menus exported successfully")
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">View Menus</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all canteen menus
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchMenus} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Menus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menus.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Breakfast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menus.filter(m => m.type === "breakfast").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Lunch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menus.filter(m => m.type === "lunch").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Snacks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menus.filter(m => m.type === "snacks").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dinner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menus.filter(m => m.type === "dinner").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Meal Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Specific Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? dateFilter.toLocaleDateString() : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                  />
                </PopoverContent>
              </Popover>
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

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {filteredMenus.length} of {menus.length} menus
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            onClick={() => setViewMode("card")}
            size="sm"
          >
            Card View
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="sm"
          >
            List View
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredMenus.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-muted-foreground">No menus found</p>
            <Button onClick={clearFilters} variant="link" className="mt-2">
              Clear filters to see all menus
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMenus.map((menu) => {
            const Icon = mealIcons[menu.type as keyof typeof mealIcons]
            const colorClass = mealColors[menu.type as keyof typeof mealColors]

            return (
              <Card key={menu.id} className={`border-2 ${colorClass}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="capitalize">{menu.type}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(menu)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingMenuId(menu.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {new Date(menu.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {menu.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenus.map((menu) => (
                  <TableRow key={menu.id}>
                    <TableCell className="font-medium">{menu.id}</TableCell>
                    <TableCell>
                      {new Date(menu.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="capitalize">{menu.type}</TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        {menu.items.join(", ")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(menu)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingMenuId(menu.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
            <DialogDescription>
              Update the menu items for {editingMenu?.type} on{" "}
              {editingMenu && new Date(editingMenu.date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleItemChange(idx, e.target.value)}
                  placeholder={`Item ${idx + 1}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(idx)}
                  disabled={editItems.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={handleAddItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Menu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Menu</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this menu? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingMenuId && handleDelete(deletingMenuId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ViewMenuComponents