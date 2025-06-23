import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Award, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            EduPlatform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your learning journey with our comprehensive education platform. 
            Access courses, track progress, and achieve your goals.
          </p>
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg w-full sm:w-auto"
              onClick={() => window.location.href = '/api/login'}
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              Get Started - Verify Email
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We'll verify your email first, then you can set up your account
            </p>
            <div className="text-center">
              <Button 
                variant="outline"
                onClick={() => setLocation('/auth')}
              >
                Already have username/password? Sign in here
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Rich Content</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access video lectures, PDFs, and interactive materials
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your learning progress and achievements
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Expert Instructors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Learn from industry experts and experienced educators
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <GraduationCap className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Earn certificates upon course completion
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of learners already advancing their careers
          </p>
          <Button 
            size="lg" 
            variant="outline"
            className="px-8 py-4"
            onClick={() => window.location.href = '/api/login'}
          >
            Sign In Now
          </Button>
        </div>
      </div>
    </div>
  );
}