"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
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
import { createUser } from "./action"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
    username: z.string().min(2, {
        message: "User must be at least 2 characters.",
    }),
    password: z.string().min(4, {
        message: "Password must be at least 4 characters.",
    }),
    phone: z.string().min(10, {
        message: "Phone number must be at least 10 characters.",
    }),
    email: z.string().email({
        message: "Invalid email address.",
    }),
    allocated_building: z.string().optional(),
    allocated_room: z.string().optional(),
    assigned_building: z.string().optional(),
    assigned_floors: z.array(z.number()).optional(),
})

export default function AddWardenForm({ user, availableBuildingsAndFloors, assignedWardenFloors, assignedStudentRooms }: { user: UserPayload, availableBuildingsAndFloors: AvailableBuildingsAndFloors[], assignedWardenFloors: { floor_id: number }[], assignedStudentRooms: { room_id: number }[] }) {

    const [selectedBuilding, setSelectedBuilding] = useState<AvailableBuildingsAndFloors | null>(null);
    const [selectedAllocatedBuilding, setSelectedAllocatedBuilding] = useState<AvailableBuildingsAndFloors | null>(null);

    const assignedStudentRoomIds = assignedStudentRooms.map(r => r.room_id);
    const assignedWardenFloorIds = assignedWardenFloors.map(f => f.floor_id);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            phone: "",
            email: "",
            allocated_building: "",
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

        const building = availableBuildingsAndFloors.find(b => b.name === values.allocated_building);
        const room = building?.floors.flatMap(f => f.rooms).find(r => r.name === values.allocated_room);


        const res = await createUser(values.username, values.email, values.phone, values.password, 'warden', values.email, user.name, user.usn_id, user.role, room?.id, values.assigned_floors);
        if (res.accountcreated) {
            toast.success(res.message as string)
            form.reset()
        } else {
            toast.error(res.message)
        }
    }

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
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Warden password here..." {...field} />
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
                                }}
                                    value={field.value}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a building for accommodation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableBuildingsAndFloors && availableBuildingsAndFloors.map((building) => (
                                            <SelectItem key={building.id} value={building.name}>
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
                    name="allocated_room"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Warden Accommodation Room</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedAllocatedBuilding}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a room for accommodation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedAllocatedBuilding && selectedAllocatedBuilding.floors.flatMap(floor => (floor as any).rooms).map((room: any) => {
                                            const isAssigned = assignedStudentRoomIds.includes(room.id);
                                            return !isAssigned && (
                                                <SelectItem key={room.id} value={room.name}>
                                                    {room.name}
                                                </SelectItem>
                                            )
                                        })}
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
                                    const building = availableBuildingsAndFloors.find(b => b.name === value) || null;
                                    setSelectedBuilding(building);
                                    form.setValue('assigned_floors', []); // Reset selected floors when building changes
                                }}
                                    value={field.value}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a building" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableBuildingsAndFloors && availableBuildingsAndFloors.map((building) => (
                                            <SelectItem key={building.id} value={building.name}>
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
                                <div className="space-y-2">
                                    {selectedBuilding && selectedBuilding.floors.map((floor) => {
                                        const isAssigned = assignedWardenFloorIds.includes(floor.id);
                                        return !isAssigned && (
                                            <div key={floor.floor_number} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`floor-${floor.id}`}
                                                    checked={field.value?.includes(floor.id)}
                                                    onCheckedChange={(checked) => {
                                                        const currentValues = field.value || [];
                                                        if (checked) {
                                                            field.onChange([...currentValues, floor.id]);
                                                        } else {
                                                            field.onChange(currentValues.filter(value => value !== floor.id));
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`floor-${floor.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Floor {floor.floor_number === 0 ? 'G' : floor.floor_number}
                                                </label>
                                            </div>
                                        )
                                    })}
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