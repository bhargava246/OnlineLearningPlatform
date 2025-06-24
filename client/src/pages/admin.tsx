import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Youtube, FileText, Edit, Trash2, Award, Users, BookOpen } from "lucide-react";
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

  const { data: users, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/mongo/admin/users"],
  });

  const { data: courses, isLoading: coursesLoading } = useQuery<any[]>({
    queryKey: ["/api/mongo/courses"],
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">Manage users, courses, and analytics</p>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="approvals">User Approvals</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="courses">Course Management</TabsTrigger>
          <TabsTrigger value="tests">Test Management</TabsTrigger>
          <TabsTrigger value="grades">Student Grades</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-users text-2xl text-blue-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {adminStats?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-graduation-cap text-2xl text-green-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Active Courses</p>
                  <p className="text-2xl font-bold text-green-900">
                    {adminStats?.activeCourses || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-clipboard-check text-2xl text-purple-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Tests Completed</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {adminStats?.testsCompleted || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-chart-line text-2xl text-yellow-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600">Avg. Score</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {adminStats?.averageScore ? `${adminStats.averageScore}%` : "0%"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Enrollment Trends</h3>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
                <div className="text-center text-gray-500">
                  <i className="fas fa-chart-area text-4xl mb-2"></i>
                  <p>Chart: Monthly user enrollments</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Completion Rates</h3>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
                <div className="text-center text-gray-500">
                  <i className="fas fa-chart-pie text-4xl mb-2"></i>
                  <p>Chart: Completion rates by course</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* User Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <UserApprovals />
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        {/* Legacy User Management Display */}
        <TabsContent value="legacy-users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <Button>
              <i className="fas fa-plus mr-2"></i>
              Add User
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {usersLoading ? (
              <div className="p-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 mb-4" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users?.map((user) => (
                      <tr key={user._id || user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar || ""} />
                              <AvatarFallback>
                                {user.firstName[0]}{user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="ghost" size="sm" className="mr-3">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            {user.isActive ? "Suspend" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Course Management Tab */}
        <TabsContent value="courses" className="space-y-6">
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

          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses?.map((course: any) => (
                <div key={course._id || course.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{course.title}</h4>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditCourse(course)}
                        title="Edit Course"
                      >
                        <Edit className="h-4 w-4 text-gray-400" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Delete Course"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
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
                              onClick={() => handleDeleteCourse(course._id || course.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Category:</span> {course.category}</p>
                    <p><span className="font-medium">Level:</span> {course.level}</p>
                    <p className="flex items-center gap-1">
                      <Youtube className="h-3 w-3" />
                      <span className="font-medium">Videos:</span> {course.modules?.length || 0} lectures
                    </p>
                    <p className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span className="font-medium">Notes:</span> {course.notes?.length || 0} PDFs
                    </p>
                    <p><span className="font-medium">Duration:</span> {Math.floor((course.duration || 0) / 60)} hours</p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span className="text-green-600">
                        {course.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                    {course.price > 0 && (
                      <p><span className="font-medium">Price:</span> ${course.price}</p>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Manage Content
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Test Management Tab */}
        <TabsContent value="tests" className="space-y-6">
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

          {/* Existing Tests */}
          {testsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : tests && tests.length > 0 ? (
            <div className="space-y-4">
              {tests.map((test: any) => (
                <div key={test._id || test.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{test.title}</h4>
                      <p className="text-gray-600 mb-4">{test.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Course:</span>
                          <p className="text-gray-600">{test.course?.title || 'N/A'}</p>
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
            </div>
          )}
        </TabsContent>

        {/* Student Grades Tab */}
        <TabsContent value="grades" className="space-y-6">
          <StudentGrades />
        </TabsContent>
      </Tabs>
    </main>
  );
}