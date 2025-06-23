import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getGradeColor } from "@/lib/utils";
import { BookOpen, Calendar, Award, TrendingUp } from "lucide-react";
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
  
  // Get student data by username (you can replace 'student1' with actual logged-in user)
  const { data: studentData } = useQuery({
    queryKey: ['/api/mongo/students/by-username/student1'],
  });

  const userId = studentData?._id;

  const { data: testResults, isLoading } = useQuery<any[]>({
    queryKey: [`/api/mongo/students/${userId}/test-results`],
    enabled: !!userId,
  });

  const filteredResults = testResults?.filter((result) => {
    if (selectedCourse === "all") return true;
    return result.course?.title === selectedCourse;
  }) || [];

  const uniqueCourses = Array.from(
    new Set(testResults?.map(result => result.course?.title).filter(Boolean))
  );

  // Group results by test
  const groupedResults = filteredResults.reduce((acc: any, result) => {
    const testTitle = result.testTitle;
    if (!acc[testTitle]) {
      acc[testTitle] = {
        testTitle,
        course: result.course,
        results: []
      };
    }
    acc[testTitle].results.push(result);
    return acc;
  }, {});

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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Test Results</h2>
          <p className="text-gray-600">View your test performance organized by test</p>
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

      {/* Test Results by Test */}
      <div className="space-y-6">
        {Object.values(groupedResults).map((testGroup: any) => (
          <Card key={testGroup.testTitle}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {testGroup.testTitle}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {testGroup.course?.title} • {testGroup.course?.category}
                  </p>
                </div>
                <Badge variant="outline">
                  {testGroup.results.length} Attempt{testGroup.results.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testGroup.results.map((result: any, index: number) => {
                  const isLatest = index === testGroup.results.length - 1;
                  const percentage = result.result ? Math.round((result.result.score / (result.maxScore || 100)) * 100) : 0;
                  
                  return (
                    <div key={`${result.testId}-${index}`} className={`p-4 rounded-lg border ${isLatest ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">
                              Attempt {testGroup.results.length - index}
                              {isLatest && <span className="text-blue-600 ml-1">(Latest)</span>}
                            </span>
                          </div>
                          {result.result && (
                            <div className="flex items-center space-x-4">
                              <div className="text-sm">
                                <span className="font-medium">{result.result.score}</span>
                                <span className="text-gray-500">/{result.maxScore || 100}</span>
                                <span className="text-gray-500 ml-1">({percentage}%)</span>
                              </div>
                              <Badge className={getGradeColor(result.result.grade)}>
                                {result.result.grade}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {result.result ? new Date(result.result.completedAt).toLocaleDateString() : 'Not completed'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                            {result.result && result.result.grade !== "A+" && (
                              <Button variant="outline" size="sm">
                                Retake Test
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {result.result && result.result.timeSpent && (
                        <div className="mt-2 text-sm text-gray-600">
                          <TrendingUp className="h-4 w-4 inline mr-1" />
                          Time spent: {result.result.timeSpent} minutes
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(groupedResults).length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No test results found</h3>
            <p className="text-gray-500">
              {selectedCourse === "all" 
                ? "You haven't taken any tests yet" 
                : "No tests found for the selected course"}
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
