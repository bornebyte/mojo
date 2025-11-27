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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
import { useContext, useState } from "react"
import UserContext from "../context/UserContext"
import { LogIn, Sparkles, Lock, User, Shield } from "lucide-react"
import Link from "next/link"

const loginFormSchema = z.object({
    username: z.string().min(4, {
        message: "USN ID must be at least 4 characters."
    }).max(25, {
        message: "USN ID must be at most 25 characters."
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
    const [isLoading, setIsLoading] = useState(false)
    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            username: "",
            password: "",
            role: "admin",
        },
    })

    function onSubmit(values: z.infer<typeof loginFormSchema>) {
        setIsLoading(true)
        loginUser(values.username, values.password, values.role).then((response) => {
            toast.success(response.message)
            if (response.loginstatus) {
                if (response.user) {
                    user?.setUser(response.user);
                }
                if (values.role === "canteen manager") {
                    redirect("/dashboard/canteen-manager")
                }
                redirect(`/dashboard/${values.role}`)
            } else {
                setIsLoading(false)
            }
        }).catch(() => {
            setIsLoading(false)
        })
    }

    return (
        <div className="relative w-full min-h-screen p-4 flex items-center justify-center py-12">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary">
                            Mojo
                        </h1>
                        <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-lg text-muted-foreground font-medium">
                        Welcome back! Please login to continue
                    </p>
                </div>

                {/* Login Card */}
                <Card className="border-2 shadow-2xl backdrop-blur-sm bg-background/95 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            Sign In
                        </CardTitle>
                        <CardDescription>
                            Enter your credentials to access your dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Email or USN ID
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your email or USN ID"
                                                    {...field}
                                                    className="transition-all focus-visible:ring-2 focus-visible:ring-primary"
                                                    disabled={isLoading}
                                                />
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
                                            <FormLabel className="flex items-center gap-2">
                                                <Lock className="h-4 w-4" />
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter your password"
                                                    type="password"
                                                    className="transition-all focus-visible:ring-2 focus-visible:ring-primary"
                                                    disabled={isLoading}
                                                />
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
                                            <FormLabel className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                Select Role
                                            </FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                                    <SelectTrigger className="w-full transition-all focus:ring-2 focus:ring-primary">
                                                        <SelectValue placeholder="Choose your role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="h-4 w-4 text-red-500" />
                                                                <span>Admin</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="warden">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="h-4 w-4 text-blue-500" />
                                                                <span>Warden</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="student">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4 text-green-500" />
                                                                <span>Student</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="canteen manager">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="h-4 w-4 text-orange-500" />
                                                                <span>Canteen Manager</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="mr-2 h-4 w-4" />
                                            Sign In
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center space-y-4 animate-in fade-in duration-1000 delay-500">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <span className="text-primary font-semibold">Contact your administrator</span>
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <Link href="/about" className="hover:text-primary transition-colors underline-offset-4 hover:underline">
                            About
                        </Link>
                        <span>•</span>
                        <Link href="/" className="hover:text-primary transition-colors underline-offset-4 hover:underline">
                            Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
