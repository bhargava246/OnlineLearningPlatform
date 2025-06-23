
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getGradeColor } from "@/lib/utils";
import { BookOpen, Calendar, Award, TrendingUp, User } from "lucide-react";
import type { TestResult } from "@shared/schema";

interface TestResultWithDetails extends TestResult {
  test?: {
    id: number;
    title: string;
    courseId: number;
  };
  course?: {
    id: number;
    title: string;
    category: string;
  };
}

export default function TestResults() {
  const [selectedCourse, setSelectedCourse] = useState("all");
  
  // Get all students
  const { data: students } = useQuery<any[]>({
    queryKey: ['/api/mongo/users'],
    select: (data) => data.filter((user: any) => user.role === 'student'),
  });

  // Get all tests with results
  const { data: tests, isLoading } = useQuery<any[]>({
    queryKey: ['/api/mongo/tests'],
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

  // Group results by student
  const studentResults = students?.map(student => {
    const testResults = tests?.map(test => {
      const result = test.results?.find((r: any) => 
        r.student.toString() === student._id.toString()
      );
      
      return {
        testId: test._id,
        testTitle: test.title,
        course: test.course,
        maxScore: test.maxScore || 100,
        result: result || null
      };
    }) || [];

    // Filter by course if selected
    const filteredResults = selectedCourse === "all" 
      ? testResults 
      : testResults.filter(result => result.course?.title === selectedCourse);

    return {
      student,
      testResults: filteredResults,
      completedTests: filteredResults.filter(r => r.result).length,
      totalTests: filteredResults.length,
      averageScore: filteredResults.length > 0 
        ? Math.round(filteredResults.reduce((acc, r) => acc + (r.result ? (r.result.score / r.maxScore) * 100 : 0), 0) / filteredResults.filter(r => r.result).length) || 0
        : 0
    };
  }) || [];

  const uniqueCourses = Array.from(
    new Set(tests?.flatMap(test => test.course?.title).filter(Boolean))
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Results by Student</h2>
          <p className="text-gray-600">View all test results organized by student</p>
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {uniqueCourses.map((course) => (
              <SelectItem key={course} value={course!}>
                {course}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Student Results */}
      <div className="space-y-6">
        {studentResults.map((studentData: any) => (
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
                    {studentData.completedTests} / {studentData.totalTests} Tests Completed
                  </Badge>
                  {studentData.completedTests > 0 && (
                    <Badge variant="secondary">
                      Avg: {studentData.averageScore}%
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentData.testResults.map((testResult: any) => {
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
                                  {new Date(testResult.result.completedAt).toLocaleDateString()}
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
                      
                      {testResult.result && testResult.result.timeSpent && (
                        <div className="mt-2 text-sm text-gray-600">
                          <TrendingUp className="h-4 w-4 inline mr-1" />
                          Time spent: {testResult.result.timeSpent} minutes
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {studentData.testResults.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No tests available for the selected course</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {studentResults.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">
              No students are available in the system
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
