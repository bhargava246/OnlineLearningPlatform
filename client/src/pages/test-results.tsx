import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getGradeColor } from "@/lib/utils";
import { BookOpen, Calendar, Award, User } from "lucide-react";

export default function TestResults() {
  const { user, isAdmin } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState("all");
  
  // Get test results based on user role
  const { data: testResults, isLoading } = useQuery<any[]>({
    queryKey: isAdmin ? ['/api/mongo/admin/student-results'] : ['/api/mongo/student/my-results'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const endpoint = isAdmin ? '/api/mongo/admin/student-results' : '/api/mongo/student/my-results';
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch test results');
      }
      
      return response.json();
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Skeleton className="h-16" />
          <div className="space-y-4 p-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Extract unique courses for filtering
  const uniqueCourses = Array.from(
    new Set(
      isAdmin 
        ? testResults?.flatMap((studentData: any) => 
            studentData.testResults?.map((test: any) => test.course?.title).filter(Boolean)
          ).filter(Boolean) || []
        : testResults?.map((result: any) => result.course?.title).filter(Boolean) || []
    )
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin ? "Test Results by Student" : "My Test Results"}
          </h2>
          <p className="text-gray-600">
            {isAdmin ? "View all test results organized by student" : "View your test performance"}
          </p>
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {uniqueCourses.map((course) => (
              <SelectItem key={course} value={course}>
                {course}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Display */}
      <div className="space-y-6">
        {isAdmin ? (
          // Admin view: Show all students and their results
          testResults?.map((studentData: any) => (
            <Card key={studentData.student._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {studentData.student.firstName} {studentData.student.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {studentData.student.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">
                      {studentData.testResults?.filter((t: any) => t.result).length || 0} / {studentData.testResults?.length || 0} Tests Completed
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentData.testResults?.map((testResult: any) => {
                    const percentage = testResult.result 
                      ? Math.round((testResult.result.score / testResult.maxScore) * 100) 
                      : 0;
                    
                    return (
                      <div 
                        key={testResult.testId} 
                        className={`p-4 rounded-lg border ${testResult.result ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-gray-600" />
                              <span className="font-medium">{testResult.testTitle}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {testResult.course?.title} • {testResult.course?.category}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            {testResult.result ? (
                              <>
                                <div className="text-sm">
                                  <span className="font-medium">{testResult.result.score}</span>
                                  <span className="text-gray-500">/{testResult.maxScore}</span>
                                  <span className="text-gray-500 ml-1">({percentage}%)</span>
                                </div>
                                <Badge className={getGradeColor(testResult.result.grade)}>
                                  {testResult.result.grade}
                                </Badge>
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {formatDate(testResult.result.completedAt)}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100">
                                Not Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {(!studentData.testResults || studentData.testResults.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No tests available for this student</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Student view: Show only their own results
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                My Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults?.map((result: any) => (
                  <div 
                    key={result.testId} 
                    className="p-4 rounded-lg border border-green-200 bg-green-50"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">{result.testTitle}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {result.course?.title} • {result.course?.category}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="font-medium">{result.score}</span>
                          <span className="text-gray-500">/{result.maxScore}</span>
                          <span className="text-gray-500 ml-1">
                            ({Math.round((result.score / result.maxScore) * 100)}%)
                          </span>
                        </div>
                        <Badge className={getGradeColor(result.grade)}>
                          {result.grade}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(result.completedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No test results available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty state */}
      {(!testResults || testResults.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isAdmin ? "No students found" : "No test results yet"}
            </h3>
            <p className="text-gray-500">
              {isAdmin 
                ? "No students are available in the system" 
                : "Complete some tests to see your results here"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}