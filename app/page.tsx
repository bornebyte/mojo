import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  ArrowRight,
  Quote,
  Shield,
  Zap,
  BarChart,
  Bell,
  MessageSquare,
  Calendar,
  Building2,
  Star,
  TrendingUp,
  Users,
  CheckCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="w-full py-4 md:py-6 lg:py-10 xl:py-16 bg-gradient-to-b from-background to-muted/50">
        <div className="container px-6 md:px-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
                  Modern Hostel Management
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  Transform Your Hostel Operations with Mojo
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  A comprehensive platform designed for modern hostels. Streamline attendance, manage meals, handle complaints, and keep everyone connected - all in one place.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="shadow-lg">
                  <Link href="/login">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/about">
                    Learn More
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-xs text-muted-foreground">Digital</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">4+</div>
                  <div className="text-xs text-muted-foreground">User Roles</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-xs text-muted-foreground">Access</div>
                </div>
              </div>
            </div>
            <Image
              src={"/dummy.avif"}
              width={550}
              height={550}
              alt="Hostel"
              className="mx-auto w-full h-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-2xl"
            />
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted-foreground/10 px-3 py-1 text-sm">
                Powerful Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Everything You Need in One Place
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Mojo brings together all the tools you need for efficient hostel management, designed for admins, wardens, canteen managers, and students.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Member Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Easily add, update, and manage student and staff profiles. Track room allocations, contact details, and building assignments.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <UtensilsCrossed className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Canteen & Menu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage daily menus, collect food ratings from students, and track meal preferences to improve service quality.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Attendance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Simple attendance system for wardens with detailed analytics and reports. Students can view their attendance history.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Bell className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Broadcast important updates to specific groups or everyone. Keep students and staff informed in real-time.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Complaint System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Students can submit complaints and track their status. Admins and wardens can respond and resolve issues efficiently.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <BarChart className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive analytics for admins and wardens with charts, trends, and insights for data-driven decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Why Choose Mojo?
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Built with modern technology and designed for ease of use, Mojo provides a robust solution for hostel management.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Lightning Fast</h3>
                    <p className="text-sm text-muted-foreground">
                      Built on Next.js 15 with server-side rendering for instant page loads and smooth navigation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Secure & Reliable</h3>
                    <p className="text-sm text-muted-foreground">
                      Role-based access control ensures users only see what they need. Your data is safe and encrypted.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Real-time Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Get instant notifications for announcements, complaint responses, and important updates.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Multi-Building Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage multiple buildings, floors, and rooms with ease. Perfect for large hostel complexes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <div className="text-3xl font-bold mb-1">99.9%</div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Users className="h-12 w-12 text-blue-500 mb-2" />
                    <div className="text-3xl font-bold mb-1">1000+</div>
                    <p className="text-sm text-muted-foreground">Students</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Star className="h-12 w-12 text-yellow-500 mb-2" />
                    <div className="text-3xl font-bold mb-1">4.9/5</div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Zap className="h-12 w-12 text-purple-500 mb-2" />
                    <div className="text-3xl font-bold mb-1">&lt;100ms</div>
                    <p className="text-sm text-muted-foreground">Response</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              What Our Users Say
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from hostel managers, wardens, and students who use Mojo daily to simplify their hostel experience.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-6 pt-12 lg:grid-cols-3 lg:gap-8">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://github.com/shadcn.png" alt="Warden" />
                    <AvatarFallback>JW</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <CardTitle className="text-base">John Williams</CardTitle>
                    <p className="text-sm text-muted-foreground">Warden, A-Block</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-left">
                <Quote className="mb-4 h-6 w-6 text-muted-foreground" />
                <p className="text-muted-foreground">
                  &quot;Mojo has revolutionized how we manage attendance and student records. The analytics dashboard gives me insights I never had before. It&apos;s saved us countless hours!&quot;
                </p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://github.com/random.png" alt="Student" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <CardTitle className="text-base">Alice Smith</CardTitle>
                    <p className="text-sm text-muted-foreground">Student, CSE Dept</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-left">
                <Quote className="mb-4 h-6 w-6 text-muted-foreground" />
                <p className="text-muted-foreground">
                  &quot;Checking the daily menu, tracking my attendance, and submitting complaints is so easy now. The interface is clean and the response time from wardens is amazing!&quot;
                </p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://github.com/manager.png" alt="Manager" />
                    <AvatarFallback>CM</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <CardTitle className="text-base">Mike Johnson</CardTitle>
                    <p className="text-sm text-muted-foreground">Canteen Manager</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-left">
                <Quote className="mb-4 h-6 w-6 text-muted-foreground" />
                <p className="text-muted-foreground">
                  &quot;Managing menus and getting direct feedback from students has improved our service significantly. The food rating system helps us understand what students love!&quot;
                </p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t bg-gradient-to-b from-background to-muted/50">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to Transform Your Hostel Management?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join hundreds of hostels already using Mojo. Start managing your hostel smarter, faster, and more efficiently today.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2 min-[400px]:flex-row justify-center">
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/login">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">
                Learn More About Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
