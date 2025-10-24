"use client"

import { useState } from "react"
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
    usn_id: z.string().min(4, {
        message: "USN ID must be at least 4 characters.",
    }),
    allocated_building: z.string().min(1, { message: "Building is required." }),
    allocated_room: z.string().min(1, { message: "Room is required." }),
})

export default function AddStudentForm({ user, availableBuildingsAndFloors, assignedStudentRooms }: { user: UserPayload, availableBuildingsAndFloors: AvailableBuildingsAndFloors[], assignedStudentRooms: { room_id: number }[] }) {
    const [selectedAllocatedBuilding, setSelectedAllocatedBuilding] = useState<AvailableBuildingsAndFloors | null>(null);
    const assignedStudentRoomIds = assignedStudentRooms.map(r => r.room_id);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            phone: "",
            email: "",
            usn_id: "",
            allocated_building: "",
            allocated_room: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user.name || !user.usn_id || !user.role) {
            toast.error("User name or usn_id is missing from JWT payload. Cannot create student account.");
            console.error("User name or usn_id is missing from JWT payload:", user);
            return;
        }
        const building = availableBuildingsAndFloors.find(b => b.name === values.allocated_building);
        const room = building?.floors.flatMap(f => f.rooms).find(r => r.name === values.allocated_room);

        const res = await createUser(values.username, values.email, values.phone, values.password, 'student', values.usn_id, user.name, user.usn_id, user.role, room?.id);
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Student name here..." {...field} />
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
                                <Input type="password" placeholder="Student password here..." {...field} />
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
                                <Input type="email" placeholder="Student email here..." {...field} />
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
                                <Input type="text" placeholder="Student phone number here..." {...field} />
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
                            <FormLabel>USN ID</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Student USN ID here..." {...field} />
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
                    name="allocated_room"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Room</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedAllocatedBuilding}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedAllocatedBuilding && selectedAllocatedBuilding.floors.flatMap(floor => (floor as any).rooms).map((room: any) => (
                                            !assignedStudentRoomIds.includes(room.id) && <SelectItem key={room.id} value={room.name}>{room.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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