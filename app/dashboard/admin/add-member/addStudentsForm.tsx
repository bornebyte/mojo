"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { toast } from "sonner"
import type { AvailableBuildingsAndFloors, UserPayload } from "@/lib/types"
import { createUser, getAvailableRooms } from "./action"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
    username: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }).max(100, {
        message: "Name must not exceed 100 characters.",
    }),
    phone: z.string().min(10, {
        message: "Phone number must be at least 10 digits.",
    }).max(15, {
        message: "Phone number must not exceed 15 digits.",
    }).regex(/^[0-9+\-\s()]+$/, {
        message: "Phone number can only contain digits and common phone symbols.",
    }),
    email: z.string().email({
        message: "Invalid email address.",
    }).toLowerCase(),
    usn_id: z.string().min(4, {
        message: "USN ID must be at least 4 characters.",
    }).max(20, {
        message: "USN ID must not exceed 20 characters.",
    }),
    allocated_building: z.string().optional(),
    allocated_floor: z.string().optional(),
    allocated_room: z.string().optional(),
})

export default function AddStudentForm({ user, availableBuildingsAndFloors }: { user: UserPayload, availableBuildingsAndFloors: AvailableBuildingsAndFloors[] }) {
    const [selectedAllocatedBuilding, setSelectedAllocatedBuilding] = useState<AvailableBuildingsAndFloors | null>(null);
    const [roomsForSelectedFloor, setRoomsForSelectedFloor] = useState<{ room_name: string }[]>([]);

    useForm().watch('allocated_building');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            phone: "",
            email: "",
            usn_id: "",
            allocated_building: "",
            allocated_floor: "",
            allocated_room: "",
        },
    })

    const selectedBuildingName = form.watch("allocated_building");
    const selectedFloorNumber = form.watch("allocated_floor");

    useEffect(() => {
        if (selectedBuildingName && selectedFloorNumber) {
            const floorNum = parseInt(selectedFloorNumber, 10);
            if (!isNaN(floorNum)) {
                getAvailableRooms(selectedBuildingName, floorNum).then(roomsForSelectedFloor => {
                    setRoomsForSelectedFloor(roomsForSelectedFloor);
                    form.setValue('allocated_room', '');
                });
            }
        } else {
            setRoomsForSelectedFloor([]);
        }
    }, [selectedBuildingName, selectedFloorNumber, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user.name || !user.usn_id || !user.role) {
            toast.error("User name or usn_id is missing from JWT payload. Cannot create student account.");
            console.error("User name or usn_id is missing from JWT payload:", user);
            return;
        }
        const res = await createUser(values.username, values.email, values.phone, values.phone, 'student', values.usn_id, user.name, user.usn_id, user.role, values.allocated_building, values.allocated_floor, values.allocated_room);
        if (res.accountcreated) {
            toast.success(res.message as string)
            form.reset()
        } else {
            toast.error(res.message)
        }
    }

    return (
        <Form {...form}>
            <p className="text-center text-xl font-bold mt-6 mb-6">Create Student Account</p>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., John Doe"
                                    {...field}
                                    autoComplete="name"
                                />
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
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="e.g., john.doe@example.com"
                                    {...field}
                                    autoComplete="email"
                                />
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
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                                <Input
                                    type="tel"
                                    placeholder="e.g., +1234567890"
                                    {...field}
                                    autoComplete="tel"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="usn_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>USN ID *</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="e.g., 1RV21CS001"
                                    {...field}
                                    autoComplete="off"
                                />
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
                            <FormLabel>Building</FormLabel>
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
                    name="allocated_floor"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Floor</FormLabel>
                            <FormControl>
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue('allocated_room', '');
                                }} value={field.value} disabled={!selectedAllocatedBuilding}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a floor" />
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
                            <FormLabel>Room</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!form.getValues('allocated_floor')}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roomsForSelectedFloor.length > 0 ? roomsForSelectedFloor.map((room) => (
                                            <SelectItem key={room.room_name} value={room.room_name}>
                                                {room.room_name}
                                            </SelectItem>
                                        )) : <SelectItem value="no-rooms" disabled>No available rooms</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="pt-4">
                    <Button type="submit" className="w-full" size="lg">
                        <CirclePlus className="mr-2 h-4 w-4" />
                        Create Student Account
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        * Required fields. Password will be set to phone number by default.
                    </p>
                </div>
            </form>
        </Form>
    )
}