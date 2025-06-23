import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getGradeColor } from "@/lib/utils";
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
  
  // Mock user ID - in real app this would come from auth context
  const userId = 2;

  const { data: testResults, isLoading } = useQuery<any[]>({
    queryKey: [`/api/mongo/students/${userId}/test-results`],
  });

  const filteredResults = testResults?.filter((result) => {
    if (selectedCourse === "all") return true;
    return result.course?.title === selectedCourse;
  }) || [];

  const uniqueCourses = Array.from(
    new Set(testResults?.map(result => result.course?.title).filter(Boolean))
  );

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
        <h2 className="text-2xl font-bold text-gray-900">Test Results</h2>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-40">
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

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Test Scores</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {result.course?.title || "Unknown Course"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.course?.category || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {result.test?.title || "Unknown Test"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {result.score}/{result.maxScore}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getGradeColor(result.grade)}>
                      {result.grade}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(result.completedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="ghost" size="sm" className="mr-3">
                      View Details
                    </Button>
                    {result.grade !== "A+" && (
                      <Button variant="ghost" size="sm">
                        Retake
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-clipboard-check text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No test results found</h3>
            <p className="text-gray-500">
              {selectedCourse === "all" 
                ? "You haven't taken any tests yet" 
                : "No tests found for the selected course"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
