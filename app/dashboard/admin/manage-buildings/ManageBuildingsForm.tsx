"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CirclePlus, Building, DoorClosed, Bed, Wrench } from "lucide-react"
import { toast } from "sonner"
import type { UserPayload } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createBuilding } from "./actions"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
    buildingName: z.string().min(2, {
        message: "Name of the building must be at least 2 characters.",
    }),
    no_of_floors: z.string(),
    floors: z.array(z.object({
        roomCount: z.number().min(1, { message: "Must be at least 1." })
    })),
    rooms: z.array(z.object({
        roomName: z.string().min(1, { message: "Name is required." }),
        bedCount: z.number().min(1, { message: "Must be at least 1." }),
        status: z.enum(["Available", "Unavailable", "Maintenance"]),
    }))
})

export type BuildingFormValues = z.infer<typeof formSchema>;

type FloorPlan = { floor: number; roomCount: number };

export default function ManageBuildingsForm({ user }: { user: UserPayload }) {
    const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
    const [showRoomDetails, setShowRoomDetails] = useState(false);

    const form = useForm<BuildingFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            buildingName: "",
            no_of_floors: "",
            floors: [],
            rooms: []
        },
    })

    const no_of_floors = form.watch("no_of_floors");
    const floors = form.watch("floors");

    async function onSubmit(values: BuildingFormValues) {
        const result = await createBuilding(values, user);
        if (result.success) {
            toast.success(result.message);
            form.reset();
            setShowRoomDetails(false);
            setFloorPlans([]);
        } else {
            toast.error(result.message);
        }
    }

    const handleDefineRooms = () => {
        const plans = floors.map((floor, index) => ({
            floor: index,
            roomCount: floor.roomCount || 0
        }));
        setFloorPlans(plans);

        const newRooms: { roomName: string, bedCount: number, status: "Available" | "Maintenance" }[] = [];
        for (const plan of plans) {
            for (let i = 0; i < plan.roomCount; i++) {
                newRooms.push({
                    roomName: `${plan.floor}${i < 9 ? "0" : ""}${i + 1}`,
                    bedCount: 2, // Corrected from bedCount
                    status: "Available" as const,
                });
            }
        }

        form.setValue("rooms", newRooms);

        setShowRoomDetails(true);
    }

    return (
        <div className="w-[450px] max-w-2xl">
            <Form {...form} >
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Building className="h-6 w-6" /> Building Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="buildingName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Building Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 'Block A'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="no_of_floors"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of Floors</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 4" {...field} onChange={(e) => {
                                                field.onChange(e.target.value);
                                                const numFloors = (parseInt(e.target.value, 10) || 0) + 1;
                                                form.setValue("floors", Array(numFloors > 0 ? numFloors : 0).fill({ roomCount: 0 }));
                                                setShowRoomDetails(false);
                                                setFloorPlans([]);
                                            }} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {parseInt(no_of_floors) >= 0 && form.getValues("floors").length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><DoorClosed className="h-6 w-6" /> Floor & Room Count</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Array.from({ length: parseInt(no_of_floors) + 1 }).map((_, index) => (
                                    <FormField
                                        key={index}
                                        control={form.control}
                                        name={`floors.${index}.roomCount`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Rooms on Floor {index === 0 ? "G" : index}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., 10" {...field} onChange={(e) => {
                                                        field.onChange(parseInt(e.target.value) || "")
                                                    }} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                <Button type="button" onClick={handleDefineRooms}><Bed />Define Room Details</Button>
                            </CardContent>
                        </Card>
                    )}

                    {showRoomDetails && floorPlans.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Wrench className="h-6 w-6" /> Room Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {floorPlans.map(({ floor, roomCount }, floorIndex) => {
                                    const roomOffset = floorPlans.slice(0, floorIndex).reduce((acc, p) => acc + p.roomCount, 0);
                                    return (
                                        <div key={`floor-${floor}`}>
                                            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Floor {floor === 0 ? "G" : floor}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Array.from({ length: roomCount }).map((_, roomIdx) => {
                                                    const roomIndex = roomOffset + roomIdx;
                                                    return (
                                                        <div key={roomIndex} className="p-3 border rounded-md space-y-2">
                                                            <FormField
                                                                control={form.control}
                                                                name={`rooms.${roomIndex}.roomName`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Room Name/Number</FormLabel>
                                                                        <FormControl><Input placeholder={`e.g., ${floor + 1}0${roomIdx + 1}`} {...field} /></FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )} />
                                                            <FormField
                                                                control={form.control}
                                                                name={`rooms.${roomIndex}.bedCount`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Beds</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="e.g., 3" {...field} onChange={(e) => {
                                                                                field.onChange(parseInt(e.target.value) || "")
                                                                            }} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )} />
                                                            <FormField
                                                                control={form.control}
                                                                name={`rooms.${roomIndex}.status`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Status</FormLabel>
                                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                            <FormControl>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Select room status" />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent>
                                                                                <SelectItem value="Available">Available</SelectItem>
                                                                                <SelectItem value="Unavailable">Unavailable</SelectItem>
                                                                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    <FormField
                        control={form.control} name="buildingName"
                        render={() => (
                            <Button type="submit" className="w-full" disabled={!showRoomDetails}>
                                <CirclePlus className="mr-2 h-4 w-4" />
                                Add Building
                            </Button>
                        )} />
                </form>
            </Form>
        </div>
    )
}
