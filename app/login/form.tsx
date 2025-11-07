"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { loginUser } from "./action"
import { toast } from "sonner"
import { redirect } from "next/navigation"
import { useContext } from "react"
import UserContext from "../context/UserContext"

const loginFormSchema = z.object({
    username: z.string().min(4, {
        message: "USN ID must be at least 4 characters."
    }).max(16, {
        message: "USN ID must be at most 16 characters."
    }),
    password: z.string().min(4, {
        message: "Password must be at least 4 characters."
    }).max(10, {
        message: "Password must be at most 10 characters."
    }),
    role: z.enum(["student", "warden", "admin", "canteen manager"]),
})

export function LoginForm() {
    const user = useContext(UserContext)
    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            username: "",
            password: "",
            role: "admin",
        },
    })

    function onSubmit(values: z.infer<typeof loginFormSchema>) {
        loginUser(values.username, values.password, values.role).then((response) => {
            // form.reset()
            toast.success(response.message)
            if (response.loginstatus) {
                if (response.user) {
                    user?.setUser(response.user);
                }
                redirect(`/dashboard/${values.role}`)
            }
        })
    }

    return (
        <div className="w-full h-[80vh] p-4 flex items-center justify-center py-6 relative">
            <div className="text-center absolute top-10">
                <h1 className="text-4xl font-bold">Mojo</h1>
                <p className="text-gray-600">Login to your account</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-96">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email or USN ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="Email or USN ID" {...field} />
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
                                    <Input {...field} placeholder="Your password" type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="warden">Warden</SelectItem>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="canteen manager">Canteen Manager</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full">Login</Button>
                </form>
            </Form>
        </div>
    )
}
