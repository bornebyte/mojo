"use client"
import * as React from "react"
import {
    ChevronDownIcon,
    PlusCircle,
    Trash2,
    Copy,
    Save,
    Upload,
    Eye,
    Coffee,
    UtensilsCrossed,
    Cookie,
    Moon,
    Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { saveMenu, getMenusByDate } from "./actions"
import { toast } from "sonner"

const addMenuSchema = z.object({
    date: z.date(),
    type: z.enum(["breakfast", "lunch", "snacks", "dinner"]),
    items: z.array(z.string().min(1, "Menu item cannot be empty.")).min(1, "At least one menu item is required."),
})

type AddMenuSchema = z.infer<typeof addMenuSchema>;

// Menu templates
const menuTemplates = {
    breakfast: [
        ["Idli", "Sambar", "Chutney", "Coffee/Tea"],
        ["Poha", "Biscuits", "Banana", "Milk"],
        ["Upma", "Chutney", "Coffee/Tea"],
        ["Dosa", "Sambar", "Chutney", "Coffee/Tea"],
        ["Paratha", "Curd", "Pickle", "Chai"]
    ],
    lunch: [
        ["Rice", "Dal", "Sabzi", "Roti", "Salad", "Pickle"],
        ["Biryani", "Raita", "Salad"],
        ["Chole", "Rice", "Roti", "Salad"],
        ["Rajma", "Rice", "Roti", "Papad"],
        ["Paneer Curry", "Rice", "Roti", "Dal"]
    ],
    snacks: [
        ["Samosa", "Chutney", "Tea"],
        ["Pakora", "Sauce", "Tea"],
        ["Sandwich", "Chips", "Coffee"],
        ["Bread Pakora", "Chutney", "Tea"],
        ["Vada Pav", "Chutney", "Tea"]
    ],
    dinner: [
        ["Rice", "Dal", "Sabzi", "Roti", "Salad"],
        ["Pulao", "Raita", "Papad"],
        ["Chapati", "Dal", "Sabzi", "Rice"],
        ["Fried Rice", "Manchurian", "Soup"],
        ["Khichdi", "Kadhi", "Papad"]
    ]
}

const mealIcons = {
    breakfast: Coffee,
    lunch: UtensilsCrossed,
    snacks: Cookie,
    dinner: Moon
}

const AddMenuForm = () => {
    const [open, setOpen] = React.useState<boolean>(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    const [showPreview, setShowPreview] = React.useState(false)
    const [savedTemplates, setSavedTemplates] = React.useState<string[][]>([])

    const form = useForm<AddMenuSchema>({
        resolver: zodResolver(addMenuSchema),
        defaultValues: {
            date: undefined,
            type: "breakfast",
            items: [""],
        },
    })

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "items",
    } as any);

    // Load saved templates from localStorage
    React.useEffect(() => {
        const saved = localStorage.getItem('canteen_menu_templates')
        if (saved) {
            setSavedTemplates(JSON.parse(saved))
        }
    }, [])

    // Check existing menus for selected date
    React.useEffect(() => {
        if (date) {
            getMenusByDate(date).then(res => {
                if (res.success && res.data) {
                    const menuData = Array.isArray(res.data) ? res.data : [res.data]
                    const existingTypes = menuData.map((m) => (m as { type: string }).type)

                    if (existingTypes.length > 0) {
                        toast.info(`Menus already exist for: ${existingTypes.join(', ')}`)
                    }
                }
            })
        }
    }, [date])

    const onSubmit = async (values: z.infer<typeof addMenuSchema>) => {
        if (form.getValues("date") === undefined) {
            toast.error("Please select a date for the menu.");
            return;
        }
        const res = await saveMenu(values)
        if (res.success) {
            toast.success("Menu saved successfully!")
            form.reset()
            setDate(undefined)
        } else {
            toast.error("Something went wrong!")
            console.log(res)
        }
    }

    const handleTemplateSelect = (template: string[]) => {
        replace(template)
        toast.success("Template applied!")
    }

    const handleSaveAsTemplate = () => {
        const currentItems = form.getValues("items")
        if (currentItems.length === 0 || currentItems.every(item => !item)) {
            toast.error("Add items before saving as template")
            return
        }

        const newTemplates = [...savedTemplates, currentItems]
        setSavedTemplates(newTemplates)
        localStorage.setItem('canteen_menu_templates', JSON.stringify(newTemplates))
        toast.success("Template saved!")
    }

    const handleDuplicateMenu = async () => {
        if (!date) {
            toast.error("Please select a date first")
            return
        }

        const previousDate = new Date(date)
        previousDate.setDate(previousDate.getDate() - 1)

        const res = await getMenusByDate(previousDate)
        if (res.success && res.data) {
            const menuData = Array.isArray(res.data) ? res.data : [res.data]
            const matchingMenu = menuData.find((m) => (m as { type: string }).type === form.getValues("type")) as { items: string[] } | undefined

            if (matchingMenu) {
                replace(matchingMenu.items)
                toast.success("Previous menu copied!")
            } else {
                toast.info("No menu found for previous day")
            }
        }
    }

    const handleBulkImport = () => {
        const input = prompt("Paste menu items (one per line):")
        if (input) {
            const items = input.split('\n').filter(item => item.trim())
            if (items.length > 0) {
                replace(items)
                toast.success(`Imported ${items.length} items!`)
            }
        }
    }

    const currentType = form.watch("type")
    const Icon = mealIcons[currentType as keyof typeof mealIcons]

    return (
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
            <Card className="border-2">
                <CardHeader className="text-center space-y-2 pb-6">
                    <div className="flex items-center justify-center gap-3">
                        <Sparkles className="h-8 w-8 text-primary" />
                        <CardTitle className="text-3xl md:text-4xl font-bold">Add Menu</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                        Create delicious menus for your canteen
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Date and Type Selection */}
                            <Card className="bg-muted/50">
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <FormLabel className="text-base">Select Date *</FormLabel>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between h-11 text-base"
                                                    >
                                                        {date ? date.toLocaleDateString("en-US", {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }) : "Select date"}
                                                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={date}
                                                        captionLayout="dropdown"
                                                        onSelect={(date: Date | undefined) => {
                                                            setDate(date)
                                                            setOpen(false)
                                                            form.setValue("date", date as Date)
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-base">Meal Type *</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-11 text-base">
                                                                <div className="flex items-center gap-2">
                                                                    <SelectValue placeholder="Select meal type" />
                                                                </div>
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="breakfast">
                                                                <div className="flex items-center gap-2">
                                                                    <Coffee className="h-4 w-4" />
                                                                    Breakfast
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="lunch">
                                                                <div className="flex items-center gap-2">
                                                                    <UtensilsCrossed className="h-4 w-4" />
                                                                    Lunch
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="snacks">
                                                                <div className="flex items-center gap-2">
                                                                    <Cookie className="h-4 w-4" />
                                                                    Snacks
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="dinner">
                                                                <div className="flex items-center gap-2">
                                                                    <Moon className="h-4 w-4" />
                                                                    Dinner
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={handleDuplicateMenu}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Previous Day
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={handleBulkImport}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Bulk Import
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={handleSaveAsTemplate}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save as Template
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    {showPreview ? 'Hide' : 'Show'} Preview
                                </Button>
                            </div>

                            {/* Templates Section */}
                            <Tabs defaultValue="default" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="default">Default Templates</TabsTrigger>
                                    <TabsTrigger value="saved">My Templates ({savedTemplates.length})</TabsTrigger>
                                </TabsList>

                                <TabsContent value="default" className="space-y-2 mt-4">
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Click on a template to apply it
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {menuTemplates[currentType as keyof typeof menuTemplates].map((template, idx) => (
                                            <Button
                                                key={idx}
                                                type="button"
                                                variant="outline"
                                                className="justify-start h-auto py-3 px-4"
                                                onClick={() => handleTemplateSelect(template)}
                                            >
                                                <div className="text-left">
                                                    <div className="font-medium mb-1">Template {idx + 1}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {template.slice(0, 3).join(', ')}
                                                        {template.length > 3 && ` +${template.length - 3} more`}
                                                    </div>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="saved" className="space-y-2 mt-4">
                                    {savedTemplates.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No saved templates yet. Create a menu and save it as a template!
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {savedTemplates.map((template, idx) => (
                                                <Button
                                                    key={idx}
                                                    type="button"
                                                    variant="outline"
                                                    className="justify-start h-auto py-3 px-4"
                                                    onClick={() => handleTemplateSelect(template)}
                                                >
                                                    <div className="text-left">
                                                        <div className="font-medium mb-1">Saved Template {idx + 1}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {template.slice(0, 3).join(', ')}
                                                            {template.length > 3 && ` +${template.length - 3} more`}
                                                        </div>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {/* Menu Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Menu Items</CardTitle>
                                    <CardDescription>Add items for this meal</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {fields.map((field, index) => (
                                        <FormField
                                            key={field.id}
                                            control={form.control}
                                            name={`items.${index}`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                                {index + 1}
                                                            </div>
                                                            <Input
                                                                placeholder={`Item ${index + 1}`}
                                                                {...field}
                                                                className="h-11 text-base"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => remove(index)}
                                                                disabled={fields.length <= 1}
                                                                className="shrink-0"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => append("")}
                                        className="w-full"
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Add Item
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Preview */}
                            {showPreview && (
                                <Card className="border-2 border-primary/20 bg-primary/5">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Eye className="h-5 w-5" />
                                            Preview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Icon className="h-4 w-4" />
                                                <span className="capitalize font-medium">{currentType}</span>
                                                {date && <span>• {date.toLocaleDateString()}</span>}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                                                {form.watch("items").filter(item => item.trim()).map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 rounded-md bg-background border">
                                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                                        <span className="text-sm">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Submit Button */}
                            <Button type="submit" size="lg" className="w-full text-base h-12">
                                <Save className="h-5 w-5 mr-2" />
                                Submit Menu
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default AddMenuForm