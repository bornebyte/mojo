"use client";
import { useContext, useState } from "react";
import UserContext from "@/app/context/UserContext";
import { UserPayload } from "@/lib/types";
import { addStudent } from "../../attendance/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AddStudentPage = () => {
    const user = useContext(UserContext)?.user as UserPayload;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        usn_id: "",
        allocated_building: user?.assigned_building || "",
        allocated_floor: "",
        allocated_room: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.name || !formData.email || !formData.usn_id) {
            toast.error("Please fill all required fields");
            setLoading(false);
            return;
        }

        const response = await addStudent(formData as UserPayload, user);
        if (response.success) {
            toast.success(response.message);
            router.push("/dashboard/warden/students");
        } else {
            toast.error(response.message);
        }
        setLoading(false);
    };

    const availableFloors = user?.assigned_floor ? JSON.parse(user.assigned_floor) : [];

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/warden/students">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
                <p className="text-muted-foreground">
                    Add a student to your assigned building and floors
                </p>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                    <CardDescription>
                        Fill in the details of the new student
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter student&apos;s full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="usn_id">
                                    USN / Student ID <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="usn_id"
                                    name="usn_id"
                                    placeholder="Enter USN or Student ID"
                                    value={formData.usn_id}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="student@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+91 1234567890"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="text-lg font-semibold mb-4">Room Allocation</h3>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="allocated_building">Building</Label>
                                        <Input
                                            id="allocated_building"
                                            name="allocated_building"
                                            value={formData.allocated_building}
                                            disabled
                                            className="bg-secondary"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Your assigned building
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="allocated_floor">Floor</Label>
                                        <select
                                            id="allocated_floor"
                                            name="allocated_floor"
                                            value={formData.allocated_floor}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                allocated_floor: e.target.value
                                            })}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="">Select floor</option>
                                            {availableFloors.map((floor: number) => (
                                                <option key={floor} value={floor}>
                                                    Floor {floor}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="allocated_room">Room Number</Label>
                                        <Input
                                            id="allocated_room"
                                            name="allocated_room"
                                            placeholder="e.g., 101, 102A"
                                            value={formData.allocated_room}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={loading} className="flex-1 md:flex-none">
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add Student
                                    </>
                                )}
                            </Button>
                            <Link href="/dashboard/warden/students" className="flex-1 md:flex-none">
                                <Button type="button" variant="outline" className="w-full">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddStudentPage;
