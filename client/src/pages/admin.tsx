import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import StatsCard from "@/components/stats-card";
import CourseForm from "@/components/admin/course-form";
import TestForm from "@/components/admin/test-form";
import StudentGrades from "@/components/admin/student-grades";
import UserApprovals from "@/components/admin/user-approvals";
import UserManagement from "@/components/admin/user-management";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getGradeColor } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import { Plus, Youtube, FileText, Edit, Trash2, Award, Users, BookOpen, BarChart3, Target, TrendingUp, GraduationCap } from "lucide-react";
import type { User, Course, TestResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AdminTestResult extends TestResult {
  test?: {
    id: number;
    title: string;
    courseId: number;
  };
  course?: {
    id: number;
    title: string;
  };
}

export default function Admin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("analytics");

  const { data: adminStats, isLoading: statsLoading } = useQuery<{
    totalUsers: number;
    activeCourses: number;
    testsCompleted: number;
    averageScore: number;
  }>({
    queryKey: ["/api/mongo/admin/stats"],
  });

  const { data: courses, isLoading: coursesLoading } = useQuery<any[]>({
    queryKey: ["/api/mongo/courses"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/mongo/admin/users"],
  });

  const { data: tests, isLoading: testsLoading } = useQuery<any[]>({
    queryKey: ["/api/mongo/tests"],
  });

  // Delete course mutation
  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await fetch(`/api/mongo/courses/${courseId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mongo/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mongo/admin/stats"] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteCourse.mutate(courseId);
  };

  if (statsLoading && activeTab === "analytics") {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* Admin Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage users, courses, and system settings</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "analytics"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("approvals")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "approvals"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                User Approvals
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "courses"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab("tests")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "tests"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Tests
              </button>
              <button
                onClick={() => setActiveTab("grading")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "grading"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Grading
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-900" />
            </div>
            <span className="font-bold text-lg">EduPlatform</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2 mb-8">
            <li>
              <button 
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "analytics"
                    ? 'bg-blue-800 text-white' 
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Analytics
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("approvals")}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "approvals"
                    ? 'bg-blue-800 text-white' 
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5 mr-3" />
                User Approvals
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "users"
                    ? 'bg-blue-800 text-white' 
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5 mr-3" />
                User Management
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("courses")}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "courses"
                    ? 'bg-blue-800 text-white' 
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <BookOpen className="w-5 h-5 mr-3" />
                Courses
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("tests")}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "tests"
                    ? 'bg-blue-800 text-white' 
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Target className="w-5 h-5 mr-3" />
                Tests
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("grades")}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "grades"
                    ? 'bg-blue-800 text-white' 
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Award className="w-5 h-5 mr-3" />
                Grades
              </button>
            </li>
          </ul>
        </nav>

        {/* Stats Section */}
        <div className="p-4">
          <Card className="bg-blue-800 border-blue-700 text-white">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{adminStats?.totalUsers || 0}</div>
                  <p className="text-xs text-blue-200">Users</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">{adminStats?.activeCourses || 0}</div>
                  <p className="text-xs text-blue-200">Courses</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">{adminStats?.testsCompleted || 0}</div>
                  <p className="text-xs text-blue-200">Tests</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">{adminStats?.averageScore || 0}%</div>
                  <p className="text-xs text-blue-200">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Control Center</h1>
            <p className="text-gray-600">Manage your learning platform with comprehensive tools</p>
          </div>

          {/* Tab Content Based on Active Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Platform Analytics</h3>
                <p className="text-gray-600 mb-8">Comprehensive insights into your learning platform performance</p>
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Enrollment Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                        <p>Chart: Monthly user enrollments</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Course Completion Rates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
                      <div className="text-center text-gray-500">
                        <Target className="w-12 h-12 mx-auto mb-2" />
                        <p>Chart: Completion rates by course</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* User Approvals Tab */}
          {activeTab === "approvals" && (
            <div className="space-y-6">
              <UserApprovals />
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <UserManagement />
            </div>
          )}

          {/* Course Management Tab */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Course Management</h3>
                <Dialog open={showCourseForm} onOpenChange={setShowCourseForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                    <DialogDescription>
                      {editingCourse ? 'Update course information and content' : 'Fill in the details to create a new course'}
                    </DialogDescription>
                    <CourseForm 
                      course={editingCourse}
                      onSuccess={() => {
                        setShowCourseForm(false);
                        setEditingCourse(null);
                      }}
                      onCancel={() => {
                        setShowCourseForm(false);
                        setEditingCourse(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-6">
                  {coursesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64" />
                      ))}
                    </div>
                  ) : courses && courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map((course) => (
                        <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                            {course.thumbnail ? (
                              <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                <BookOpen className="w-12 h-12" />
                              </div>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <span className="flex items-center">
                              <Youtube className="w-4 h-4 mr-1" />
                              {course.modules?.length || 0} modules
                            </span>
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {course.notes?.length || 0} notes
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditCourse(course)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{course.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteCourse(course._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
                      <p className="text-gray-500 mb-4">Create your first course to get started</p>
                      <Button onClick={() => setShowCourseForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Course
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tests Tab */}
          {activeTab === "tests" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Test Management</h3>
                <Dialog open={showTestForm} onOpenChange={setShowTestForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <TestForm 
                      onSuccess={() => setShowTestForm(false)}
                      onCancel={() => setShowTestForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-6">
                  {testsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                      ))}
                    </div>
                  ) : tests && tests.length > 0 ? (
                    <div className="space-y-4">
                      {tests.map((test) => (
                        <div key={test._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{test.title}</h4>
                              <p className="text-gray-600 text-sm mb-3">{test.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Course:</span>
                                  <p className="text-gray-600">{test.courseName || "N/A"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Questions:</span>
                                  <p className="text-gray-600">{test.questions?.length || 0}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Time Limit:</span>
                                  <p className="text-gray-600">{test.timeLimit || 60} minutes</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Passing Score:</span>
                                  <p className="text-gray-600">{test.passingScore || 60}%</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" title="Edit Test">
                                <Edit className="h-4 w-4 text-gray-400" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Delete Test">
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Found</h3>
                      <p className="text-gray-500 mb-4">Create tests for your courses to assess student learning</p>
                      <Button 
                        variant="outline"
                        onClick={() => setShowTestForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Test
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grades Tab */}
          {activeTab === "grades" && (
            <div className="space-y-6">
              <StudentGrades />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}