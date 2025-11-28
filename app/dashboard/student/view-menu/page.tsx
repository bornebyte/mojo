"use client"

import * as React from "react"
import {
    Calendar as CalendarIcon,
    Search,
    Coffee,
    UtensilsCrossed,
    Cookie,
    Moon,
    Star,
    RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { getUserFromTokenCookie } from "@/app/actions"
import {
    getAllMenus,
    submitFoodRating,
    getUserRating,
    getMenuRatings
} from "./actions"
import { Menu } from "@/lib/types"

type MenuWithId = Menu & { id: number }

type MenuRating = {
    menu_id: number;
    avg_rating: number;
    total_ratings: number;
}

const mealIcons = {
    breakfast: Coffee,
    lunch: UtensilsCrossed,
    snacks: Cookie,
    dinner: Moon,
}

const mealColors = {
    breakfast: "text-yellow-400 dark:text-yellow-400 border-yellow-500/50 dark:border-yellow-500/50",
    lunch: "text-green-400 dark:text-green-400 border-green-500/50 dark:border-green-500/50",
    snacks: "text-orange-400 dark:text-orange-400 border-orange-500/50 dark:border-orange-500/50",
    dinner: "text-blue-400 dark:text-blue-400 border-blue-500/50 dark:border-blue-500/50",
}

const ViewMenuPage = () => {
    const [menus, setMenus] = React.useState<MenuWithId[]>([])
    const [filteredMenus, setFilteredMenus] = React.useState<MenuWithId[]>([])
    const [menuRatings, setMenuRatings] = React.useState<Record<number, MenuRating>>({})
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [typeFilter, setTypeFilter] = React.useState<string>("all")
    const [dateFilter, setDateFilter] = React.useState<Date | undefined>(undefined)
    const [userId, setUserId] = React.useState<number | null>(null)
    const [userName, setUserName] = React.useState<string>("")

    // Rating dialog state
    const [ratingDialogOpen, setRatingDialogOpen] = React.useState(false)
    const [selectedMenu, setSelectedMenu] = React.useState<MenuWithId | null>(null)
    const [rating, setRating] = React.useState(0)
    const [comment, setComment] = React.useState("")
    const [hoveredStar, setHoveredStar] = React.useState(0)
    const [submittingRating, setSubmittingRating] = React.useState(false)

    // Fetch user info and menus on component mount
    React.useEffect(() => {
        const init = async () => {
            const user = await getUserFromTokenCookie()
            if (user) {
                setUserId(user.id || null)
                setUserName(user.name || user.usn_id || "")
            }
            await fetchMenus()
            await fetchMenuRatings()
        }
        init()
    }, [])

    // Apply filters whenever search, type, or date changes
    React.useEffect(() => {
        applyFilters()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, typeFilter, dateFilter, menus])

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

    const fetchMenuRatings = async () => {
        try {
            const result = await getMenuRatings()
            if (result.success && result.data) {
                const ratingsMap: Record<number, MenuRating> = {}
                result.data.forEach((r: any) => {
                    ratingsMap[r.menu_id] = {
                        menu_id: r.menu_id,
                        avg_rating: parseFloat(r.avg_rating),
                        total_ratings: parseInt(r.total_ratings)
                    }
                })
                setMenuRatings(ratingsMap)
            }
        } catch (error) {
            console.error("Failed to fetch ratings:", error)
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

        setFilteredMenus(filtered)
    }

    const openRatingDialog = async (menu: MenuWithId) => {
        setSelectedMenu(menu)
        setRatingDialogOpen(true)

        // Fetch existing rating if any
        if (userId) {
            const result = await getUserRating(userId, menu.id)
            if (result.success && result.data) {
                setRating(result.data.rating)
                setComment(result.data.comment || "")
            } else {
                setRating(0)
                setComment("")
            }
        }
    }

    const handleSubmitRating = async () => {
        if (!userId || !selectedMenu || rating === 0) {
            toast.error("Please select a rating")
            return
        }

        setSubmittingRating(true)
        try {
            const result = await submitFoodRating({
                user_id: userId,
                user_name: userName,
                menu_id: selectedMenu.id,
                menu_date: selectedMenu.date.toString(),
                menu_type: selectedMenu.type,
                rating,
                comment: comment.trim() || undefined
            })
            if (result.success) {
                toast.success(result.message)
                setRatingDialogOpen(false)
                setRating(0)
                setComment("")
                await fetchMenuRatings()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Failed to submit rating")
            console.error(error)
        } finally {
            setSubmittingRating(false)
        }
    }

    const clearFilters = () => {
        setSearchQuery("")
        setTypeFilter("all")
        setDateFilter(undefined)
    }

    const renderStars = (avgRating: number, totalRatings: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= Math.round(avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                            }`}
                    />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                    ({avgRating.toFixed(1)}) · {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
                </span>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Today&apos;s Menu</h1>
                    <p className="text-muted-foreground mt-2">
                        View daily menus and rate your meals
                    </p>
                </div>
                <Button onClick={fetchMenus} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
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
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Coffee className="h-4 w-4" />
                            Breakfast
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {menus.filter(m => m.type === "breakfast").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <UtensilsCrossed className="h-4 w-4" />
                            Lunch
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {menus.filter(m => m.type === "lunch").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Cookie className="h-4 w-4" />
                            Snacks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {menus.filter(m => m.type === "snacks").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dinner
                        </CardTitle>
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
                            <Label>Date</Label>
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
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenus.map((menu) => {
                        const Icon = mealIcons[menu.type as keyof typeof mealIcons]
                        const colorClass = mealColors[menu.type as keyof typeof mealColors]
                        const menuRating = menuRatings[menu.id]

                        return (
                            <Card key={menu.id} className={`border-2 ${colorClass} hover:shadow-lg transition-shadow`}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-5 w-5" />
                                            <CardTitle className="capitalize">{menu.type}</CardTitle>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openRatingDialog(menu)}
                                            className="gap-2"
                                        >
                                            <Star className="h-4 w-4" />
                                            Rate
                                        </Button>
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
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        {menu.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                                <span className="text-sm">{item}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {menuRating && (
                                        <div className="pt-3 border-t">
                                            {renderStars(menuRating.avg_rating, menuRating.total_ratings)}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Rating Dialog */}
            <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Rate This Meal</DialogTitle>
                        <DialogDescription>
                            Share your experience with {selectedMenu?.type} on{" "}
                            {selectedMenu && new Date(selectedMenu.date).toLocaleDateString()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {/* Star Rating */}
                        <div className="space-y-3">
                            <Label>Your Rating</Label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            className={`h-8 w-8 ${star <= (hoveredStar || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground"
                                                }`}
                                        />
                                    </button>
                                ))}
                                {rating > 0 && (
                                    <span className="ml-2 text-sm text-muted-foreground">
                                        {rating === 1 && "Poor"}
                                        {rating === 2 && "Fair"}
                                        {rating === 3 && "Good"}
                                        {rating === 4 && "Very Good"}
                                        {rating === 5 && "Excellent"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                            <Label htmlFor="comment">Comment (Optional)</Label>
                            <Textarea
                                id="comment"
                                placeholder="Share your thoughts about the meal..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>

                        {/* Menu Items Reminder */}
                        {selectedMenu && (
                            <div className="rounded-lg bg-muted p-3 space-y-2">
                                <p className="text-sm font-medium">Menu Items:</p>
                                <div className="space-y-1">
                                    {selectedMenu.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="h-1 w-1 rounded-full bg-current" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRatingDialogOpen(false)
                                setRating(0)
                                setComment("")
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitRating}
                            disabled={submittingRating || rating === 0}
                        >
                            {submittingRating ? "Submitting..." : "Submit Rating"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ViewMenuPage
