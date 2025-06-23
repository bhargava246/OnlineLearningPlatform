import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/video-player";
import PdfViewer from "@/components/pdf-viewer";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course, CourseModule, CourseNote } from "@shared/schema";

export default function CourseDetail() {
  const { id } = useParams();
  const courseId = parseInt(id || "0");

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  const { data: modules, isLoading: modulesLoading } = useQuery<CourseModule[]>({
    queryKey: [`/api/courses/${courseId}/modules`],
    enabled: !!courseId,
  });

  const { data: notes, isLoading: notesLoading } = useQuery<CourseNote[]>({
    queryKey: [`/api/courses/${courseId}/notes`],
    enabled: !!courseId,
  });

  if (courseLoading || modulesLoading || notesLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Skeleton className="h-8 w-96 mb-2" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-6 w-6" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="aspect-video mb-6" />
                <Skeleton className="h-32" />
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-64" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-500">The course you're looking for doesn't exist.</p>
        </div>
      </main>
    );
  }

  const currentModule = modules?.find(m => !m.isCompleted) || modules?.[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
              <p className="text-gray-600 mt-1">
                {currentModule ? `Module: ${currentModule.title}` : "Course Overview"}
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <VideoPlayer
                title={currentModule?.title || course.title}
                duration={currentModule ? `${currentModule.duration} min` : `${course.duration} hours`}
                videoUrl={currentModule?.videoUrl}
              />

              {/* Notes Section */}
              <div className="mt-8">
                <PdfViewer notes={notes || []} />
              </div>
            </div>

            {/* Course Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
                <div className="space-y-2">
                  {modules?.map((module) => (
                    <div
                      key={module.id}
                      className={`p-3 rounded border-l-4 ${
                        module === currentModule
                          ? "border-primary bg-primary/5"
                          : module.isCompleted
                          ? "border-green-500 bg-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <p className="font-medium text-gray-900">{module.title}</p>
                      <p className="text-sm text-gray-500">
                        {module.isCompleted ? "Completed" : module === currentModule ? "Current" : "Upcoming"} • {module.duration} min
                      </p>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-video text-4xl mb-4 opacity-50"></i>
                      <p>No modules available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
