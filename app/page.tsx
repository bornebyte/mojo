import { Button } from "@/components/ui/button";
import {
  BedDouble,
  UtensilsCrossed,
  UserCheck,
  ArrowRight,
  Quote,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Effortless Hostel Management with Mojo
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Mojo provides a seamless and efficient solution for managing
                  your hostel. From student records to meal tracking, we&apos;ve got
                  you covered.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/login">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <Image
              src={"/dummy.avif"}
              width={550}
              height={550}
              alt="Hostel"
              className="mx-auto w-full h-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
            />
          </div>
        </div>
      </section>
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted-foreground/10 px-3 py-1 text-sm">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Everything You Need in One Place
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Mojo is packed with features to make hostel administration a
                breeze for admins, wardens, canteen managers, and students.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="grid gap-1">
              <BedDouble className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-bold">Member Management</h3>
              <p className="text-muted-foreground">
                Easily add, update, and manage student and staff profiles. Keep
                track of room allocations and contact information.
              </p>
            </div>
            <div className="grid gap-1">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-bold">Canteen & Menu</h3>
              <p className="text-muted-foreground">
                Manage daily menus, track meal consumption, and handle canteen
                operations efficiently.
              </p>
            </div>
            <div className="grid gap-1">
              <UserCheck className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-bold">Attendance Tracking</h3>
              <p className="text-muted-foreground">
                A simple system for wardens to mark attendance and for students
                to view their attendance records.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              What Our Users Say
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from hostel managers and students who love using Mojo to
              simplify their daily lives.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-6 pt-12 lg:grid-cols-3 lg:gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="Warden" />
                    <AvatarFallback>JW</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>John, Warden</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Quote className="mb-4 h-6 w-6 text-muted-foreground" />
                <p className="text-muted-foreground">
                  &quot;Mojo has revolutionized how we manage attendance and student
                  records. It&apos;s intuitive, fast, and has saved us countless
                  hours of paperwork.&quot;
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/random.png" alt="Student" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>Alice, Student</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Quote className="mb-4 h-6 w-6 text-muted-foreground" />
                <p className="text-muted-foreground">
                  &quot;Checking the daily menu and my attendance has never been
                  easier. The interface is clean and super easy to navigate. A
                  must-have for any modern hostel!&quot;
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/manager.png" alt="Manager" />
                    <AvatarFallback>CM</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>Mike, Canteen Manager</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Quote className="mb-4 h-6 w-6 text-muted-foreground" />
                <p className="text-muted-foreground">
                  &quot;Planning and publishing the weekly menu is a breeze with
                  Mojo. The feedback system has also helped us improve our
                  service significantly.&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to Simplify Your Hostel Management?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Get started for free and see how Mojo can transform your hostel&apos;s
              operations.
            </p>
          </div>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link href="/login">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
