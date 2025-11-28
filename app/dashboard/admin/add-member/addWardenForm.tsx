"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Checkbox } from "@/components/ui/checkbox"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CirclePlus } from "lucide-react"
import { toast } from "sonner";
import type { AvailableBuildingsAndFloors, UserPayload } from "@/lib/types"
import { createUser, getAvailableFloorsForWarden, getAvailableRooms } from "./action"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
    username: z.string().min(2, {
        message: "User must be at least 2 characters.",
    }),
    phone: z.string().min(10, {
        message: "Phone number must be at least 10 characters.",
    }),
    email: z.string().email({
        message: "Invalid email address.",
    }),
    allocated_building: z.string().optional(),
    allocated_floor: z.string().optional(),
    allocated_room: z.string().optional(),
    assigned_building: z.string().optional(),
    assigned_floors: z.array(z.number()).optional(),
})

export default function AddWardenForm({ user, availableBuildingsAndFloors }: { user: UserPayload, availableBuildingsAndFloors: AvailableBuildingsAndFloors[] }) {

    const [selectedAllocatedBuilding, setSelectedAllocatedBuilding] = useState<AvailableBuildingsAndFloors | null>(null);
    const [availableRooms, setAvailableRooms] = useState<{ room_name: string }[]>([]);
    const [availableWardenFloors, setAvailableWardenFloors] = useState<number[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            phone: "",
            email: "",
            allocated_building: "",
            allocated_floor: "",
            allocated_room: "",
            assigned_building: "",
            assigned_floors: [],
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user.name || !user.usn_id || !user.role) {
            toast.error("User name or usn_id is missing from JWT payload. Cannot create warden account.");
            console.error("User name or usn_id is missing from JWT payload:", user);
            return;
        }

        const res = await createUser(values.username, values.email, values.phone, values.phone, 'warden', values.email, user.name, user.usn_id, user.role, values.allocated_building, values.allocated_floor ? values.allocated_floor : undefined, values.allocated_room, values.assigned_building, values.assigned_floors);
        if (res.accountcreated) {
            toast.success(res.message as string)
            form.reset()
        } else {
            toast.error(res.message)
        }
    }

    const selectedAllocatedBuildingName = form.watch("allocated_building");
    const selectedFloorNumber = form.watch("allocated_floor");
    const selectedAssignedBuildingName = form.watch("assigned_building");

    useEffect(() => {
        if (selectedAllocatedBuildingName && selectedFloorNumber) {
            getAvailableRooms(selectedAllocatedBuildingName, parseInt(selectedFloorNumber, 10)).then(setAvailableRooms);
            form.setValue('allocated_room', '');
        } else {
            setAvailableRooms([]);
        }
    }, [selectedAllocatedBuildingName, selectedFloorNumber, form]);

    useEffect(() => {
        if (selectedAssignedBuildingName) {
            getAvailableFloorsForWarden(selectedAssignedBuildingName).then(floors => {
                setAvailableWardenFloors(floors);
                form.setValue('assigned_floors', []); // Reset selection when building changes
            });
        } else {
            setAvailableWardenFloors([]);
        }
    }, [selectedAssignedBuildingName, form]);

    return (
        <Form {...form}>
            <p className="text-center text-xl font-bold mt-6 mb-6">Create Warden Account</p>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Warden name here..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="Warden email here..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Warden phone number here..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="allocated_building"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Warden Accommodation Building</FormLabel>
                            <FormControl>
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    const building = availableBuildingsAndFloors.find(b => b.name === value) || null;
                                    setSelectedAllocatedBuilding(building);
                                    form.setValue('allocated_room', "");
                                    form.setValue('allocated_floor', "");
                                }}
                                    value={field.value}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a building for accommodation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableBuildingsAndFloors && availableBuildingsAndFloors.map((building, index) => (
                                            <SelectItem key={index} value={building.name}>
                                                {building.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="allocated_floor"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Warden Accommodation Floor</FormLabel>
                            <FormControl>
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue('allocated_room', '');
                                }} value={field.value} disabled={!selectedAllocatedBuilding}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a floor for accommodation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedAllocatedBuilding?.floors.map((floor, index) => (
                                            <SelectItem key={index} value={floor.toString()}>
                                                Floor {floor === 0 ? 'G' : floor}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="allocated_room"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Warden Accommodation Room</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!form.getValues('allocated_floor')}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a room for accommodation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRooms.map((room) => (
                                            <SelectItem key={room.room_name} value={room.room_name}>{room.room_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="assigned_building"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Available Building</FormLabel>
                            <FormControl>
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue('assigned_floors', []); // Reset selected floors when building changes
                                }}
                                    value={field.value}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a building" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableBuildingsAndFloors && availableBuildingsAndFloors.map((building, index) => (
                                            <SelectItem key={index} value={building.name}>
                                                {building.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="assigned_floors"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Available Floors</FormLabel>
                            <FormControl>
                                <div className="space-y-2 grid grid-cols-2 items-center gap-2">
                                    {availableWardenFloors.length > 0 ? availableWardenFloors.map((floor: number, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`floor-${floor}`}
                                                checked={field.value?.includes(floor)}
                                                onCheckedChange={(checked) => {
                                                    const currentValues = field.value || [];
                                                    if (checked) {
                                                        field.onChange([...currentValues, floor]);
                                                    } else {
                                                        field.onChange(currentValues.filter(value => value !== floor));
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={`floor-${floor}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Floor {floor === 0 ? 'G' : floor}
                                            </label>
                                        </div>
                                    )) : <p className="text-sm text-muted-foreground col-span-2">Select a building to see available floors.</p>}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full"><CirclePlus />Add</Button>
            </form>
        </Form>
    )
}