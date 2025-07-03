import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, Award, Users, Play, Rocket } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-purple-400 rounded-full opacity-10"></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-orange-400 rounded-full opacity-30"></div>
      </div>

      {/* Header Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-white font-bold text-xl">Pro-Skills</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-white">
          <span className="cursor-pointer hover:text-blue-200">Home</span>
          <span className="cursor-pointer hover:text-blue-200">Classes</span>
          <span className="cursor-pointer hover:text-blue-200">Plans</span>
          <span className="cursor-pointer hover:text-blue-200">About Us</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="text-blue-600 border-white bg-white hover:bg-blue-50"
            onClick={() => setLocation('/auth')}
          >
            Login
          </Button>
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setLocation('/auth')}
          >
            Sign Up
          </Button>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-8 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Learn a New <span className="underline decoration-yellow-400">Skill</span> 
              <br />Everyday, Anytime,
              <br />and Anywhere.
            </h1>
            <p className="text-lg text-blue-100 max-w-lg">
              1000+ Courses covering all tech domains for you to learn and explore new opportunities. Learn from Industry Experts and land your Dream Job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full"
                onClick={() => setLocation('/auth')}
              >
                <Rocket className="mr-2 h-5 w-5" />
                Start Trial
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full"
              >
                <Play className="mr-2 h-4 w-4" />
                How it Works
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image Area */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full opacity-20 blur-3xl transform rotate-12"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="flex items-center justify-center h-64 lg:h-80">
                <div className="text-center text-white">
                  <GraduationCap className="w-24 h-24 mx-auto mb-4 opacity-80" />
                  <p className="text-lg">Your Learning Journey Starts Here</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="text-center text-white">
            <div className="text-4xl font-bold text-yellow-400 mb-2">1000+</div>
            <p className="text-blue-100">Courses to choose from</p>
          </div>
          <div className="text-center text-white">
            <div className="text-4xl font-bold text-blue-300 mb-2">5000+</div>
            <p className="text-blue-100">Students Trained</p>
          </div>
          <div className="text-center text-white">
            <div className="text-4xl font-bold text-orange-400 mb-2">200+</div>
            <p className="text-blue-100">Professional Trainers</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-white text-center mb-16">Why Choose Pro-Skills?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="pt-8 pb-6">
                <BookOpen className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Rich Content</h3>
                <p className="text-blue-100 text-sm">
                  Access video lectures, PDFs, and interactive materials
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="pt-8 pb-6">
                <Award className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Track Progress</h3>
                <p className="text-blue-100 text-sm">
                  Monitor your learning progress and achievements
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="pt-8 pb-6">
                <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Expert Instructors</h3>
                <p className="text-blue-100 text-sm">
                  Learn from industry experts and experienced educators
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="pt-8 pb-6">
                <GraduationCap className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Certifications</h3>
                <p className="text-blue-100 text-sm">
                  Earn certificates upon course completion
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}