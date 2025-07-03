import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, BookOpen, TrendingUp, Star, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CourseCard from "@/components/course-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course, Enrollment } from "@shared/schema";

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Mock user ID - in real app this would come from auth context
  const userId = 2;

  const { data: courses, isLoading: coursesLoading, error } = useQuery<any[]>({
    queryKey: ["/api/mongo/courses"],
    queryFn: async () => {
      const response = await fetch("/api/mongo/courses", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch courses");
      }
      return response.json();
    },
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<Enrollment[]>({
    queryKey: [`/api/users/${userId}/enrollments`],
  });

  const categories = ["All Categories", "Programming", "Data Science", "Mathematics"];

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           course.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  }) || [];

  const getEnrollmentForCourse = (courseId: any) => {
    return enrollments?.find(e => e.courseId === courseId);
  };

  if (coursesLoading || enrollmentsLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    const errorMessage = error.message;
    if (errorMessage.includes('pending approval')) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h2>
            <p className="text-gray-600 mb-4">Your account is waiting for admin approval before you can access courses.</p>
            <p className="text-sm text-gray-500">Please contact an administrator or wait for approval.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Courses</h2>
          <p className="text-gray-600">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -right-32 w-64 h-64 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-purple-400 rounded-full opacity-10"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Explore Your <span className="underline decoration-yellow-400">Learning Journey</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover amazing courses designed to help you master new skills and advance your career
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{courses?.length || 0}</div>
                  <p className="text-blue-100">Available Courses</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{enrollments?.length || 0}</div>
                  <p className="text-blue-100">Enrolled Courses</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <Star className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">4.8</div>
                  <p className="text-blue-100">Average Rating</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filter Bar */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Course Catalog</h2>
                <p className="text-gray-600">Find the perfect course to advance your skills</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="data science">Data Science</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-72 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course._id || course.id} className="group">
                <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50 transform hover:-translate-y-2">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white opacity-80" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-900">
                        {course.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{course.duration || '4-6 weeks'}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">{course.enrolledCount || '1.2k'} students</span>
                      </div>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        {getEnrollmentForCourse(course._id || course.id) ? 'Continue' : 'Enroll Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
