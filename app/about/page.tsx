import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  Linkedin,
  Rocket,
  ShieldCheck,
  Zap,
  Code,
  Database,
  Palette,
  Server,
  Globe,
  Heart,
  Users,
  Target,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-4">About Mojo</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Modern Hostel Management,
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Simplified
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Mojo is a comprehensive, open-source hostel management platform designed to streamline operations for administrators, wardens, canteen managers, and students.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-2">
            <CardHeader>
              <Target className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To provide an accessible, efficient, and user-friendly platform that empowers hostel administrators and enhances the living experience for students. We believe in the power of technology to create tools that are adaptable, scalable, and community-driven.
              </p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To become the leading hostel management solution, trusted by educational institutions worldwide. We aim to continuously innovate and adapt to the evolving needs of modern hostels and student communities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* The Project */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">The Project</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-muted-foreground text-lg">
              Mojo is a full-stack web application that brings together all aspects of hostel management into a single, intuitive platform. From attendance tracking and meal management to complaint resolution and real-time announcements, Mojo handles it all with elegance and efficiency.
            </p>
            <p className="text-muted-foreground text-lg">
              Built with cutting-edge technologies including Next.js 15, TypeScript, PostgreSQL, and Tailwind CSS, Mojo delivers a fast, secure, and reliable experience. The platform supports role-based access control, ensuring each user type has access to exactly what they need.
            </p>
          </div>
        </div>
        {/* Key Features */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Key Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Built on Next.js 15 with server-side rendering and optimized caching for blazing-fast performance.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Secure & Safe</h3>
                  <p className="text-sm text-muted-foreground">
                    Role-based access control with JWT authentication ensures data security and user privacy.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Rocket className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Modern Stack</h3>
                  <p className="text-sm text-muted-foreground">
                    Leveraging the latest web technologies for a robust, scalable, and maintainable foundation.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Multi-Role Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Tailored dashboards for admins, wardens, canteen managers, and students.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Palette className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Beautiful UI</h3>
                  <p className="text-sm text-muted-foreground">
                    Clean, modern interface with dark mode support and responsive design for all devices.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Globe className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Open Source</h3>
                  <p className="text-sm text-muted-foreground">
                    Free and open-source software that you can customize and extend to fit your needs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Technology Stack */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Technology Stack</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  <CardTitle>Frontend</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>Next.js 15</strong> - React framework with App Router</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>TypeScript</strong> - Type-safe development</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>Tailwind CSS</strong> - Utility-first styling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>shadcn/ui</strong> - Beautiful UI components</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>Lucide React</strong> - Icon library</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>Backend</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>Next.js API Routes</strong> - Server actions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>PostgreSQL (Neon)</strong> - Serverless database</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>JWT</strong> - Secure authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>Bcrypt</strong> - Password hashing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>unstable_cache</strong> - Performance optimization</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Creator Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">The Creator</h2>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src="https://github.com/bornebyte.png" alt="@bornebyte" />
                  <AvatarFallback>SS</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h3 className="text-2xl font-semibold">Shubham Shah</h3>
                    <p className="text-muted-foreground">Full Stack Developer & Open Source Enthusiast</p>
                    <p className="text-sm text-muted-foreground mt-1">@bornebyte</p>
                  </div>
                  <p className="text-muted-foreground">
                    Passionate about building tools that solve real-world problems. Mojo was created to address the inefficiencies in traditional hostel management systems, bringing modern technology to educational institutions.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="https://github.com/bornebyte" target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="https://linkedin.com/in/shubham-shah-54b8bb1b8/" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Source */}
        <Card className="border-2 bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Heart className="h-12 w-12 text-red-500" />
              <h3 className="text-2xl font-bold">Open Source & Free</h3>
              <p className="text-muted-foreground max-w-2xl">
                Mojo is completely free and open-source. We believe in transparency and community collaboration.
                Feel free to use, modify, and contribute to the project on GitHub.
              </p>
              <Button asChild>
                <Link href="https://github.com/bornebyte/mojo" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  View on GitHub
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}