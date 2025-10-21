import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Github,
  Linkedin,
  Twitter,
  Rocket,
  ShieldCheck,
  Zap,
  Code,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            About Mojo
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A modern, open-source solution for seamless hostel management.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">The Project</h2>
          <p className="text-muted-foreground">
            Mojo is a comprehensive hostel management system designed to
            streamline operations for everyone involved - from administrators
            and wardens to students. It provides role-based access to manage
            members, canteen menus, attendance, and more, all through an
            intuitive and modern interface.
          </p>
          <p className="text-muted-foreground">
            Built with Next.js, TypeScript, and Tailwind CSS, Mojo is designed
            to be fast, reliable, and easy to use.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground">
            Our mission is to provide an accessible, efficient, and user-friendly
            platform that empowers hostel administrators and enhances the living
            experience for students. We believe in the power of open-source to
            create tools that are adaptable and community-driven.
          </p>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Why Choose Mojo?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center gap-2">
              <Zap className="h-10 w-10 text-primary" />
              <h3 className="font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Built on Next.js for a snappy, server-rendered experience.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <h3 className="font-semibold">Role-Based Security</h3>
              <p className="text-sm text-muted-foreground">
                Ensures that users only see the data and tools relevant to them.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Rocket className="h-10 w-10 text-primary" />
              <h3 className="font-semibold">Modern Stack</h3>
              <p className="text-sm text-muted-foreground">
                Leverages the latest web technologies for a robust foundation.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Technology Stack</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Code className="h-4 w-4" /> Next.js - The React Framework for Production
                </li>
                <li className="flex items-center gap-2">
                  <Code className="h-4 w-4" /> TypeScript - Strong typing for robust code
                </li>
                <li className="flex items-center gap-2">
                  <Code className="h-4 w-4" /> Tailwind CSS - A utility-first CSS framework
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">The Creator</h2>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://github.com/bornebyte.png" alt="@bornebyte" />
              <AvatarFallback>SS</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">Shubham Shah</h3>
              <p className="text-muted-foreground">@bornebyte</p>
              <div className="mt-2 flex items-center gap-4">
                <Link href="https://github.com/bornebyte" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Github className="h-5 w-5" /></Link>
                <Link href="https://linkedin.com/in/shubham-shah-54b8bb1b8/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}