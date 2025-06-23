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
  const courseId = id || "";

  const { data: course, isLoading: courseLoading } = useQuery<any>({
    queryKey: [`/api/mongo/courses/${courseId}`],
    enabled: !!courseId,
  });

  // For MongoDB structure, modules and notes are embedded in the course document
  const modules = course?.modules || [];
  const notes = course?.notes || [];
  const modulesLoading = courseLoading;
  const notesLoading = courseLoading;

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

  const currentModule = modules?.length > 0 ? modules[0] : null;

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
              {/* Video Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Video Lectures</h3>
                {modules?.length > 0 ? (
                  <div className="space-y-4">
                    {modules.map((module: any, index: number) => (
                      <VideoPlayer
                        key={module._id || index}
                        title={module.title}
                        duration={`${module.duration} min`}
                        videoUrl={module.youtubeUrl}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-4 opacity-50">📹</div>
                    <p>No video lectures available</p>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">PDF Notes & Resources</h3>
                <PdfViewer notes={notes || []} />
              </div>
            </div>

            {/* Course Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
                <div className="space-y-2">
                  {modules?.map((module: any, index: number) => (
                    <div
                      key={module._id || index}
                      className="p-3 rounded border-l-4 border-primary bg-white"
                    >
                      <p className="font-medium text-gray-900">{module.title}</p>
                      <p className="text-sm text-gray-500">
                        Video {index + 1} • {module.duration} min
                      </p>
                      {module.description && (
                        <p className="text-xs text-gray-400 mt-1">{module.description}</p>
                      )}
                    </div>
                  ))}
                  
                  {notes?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <h4 className="font-medium text-gray-900 mb-2">PDF Resources</h4>
                      {notes.map((note: any, index: number) => (
                        <div key={note._id || index} className="p-3 rounded border-l-4 border-blue-500 bg-white">
                          <p className="font-medium text-gray-900">{note.title}</p>
                          <p className="text-sm text-gray-500">
                            PDF Document • {note.fileSize || 'Unknown size'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {modules?.length === 0 && notes?.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-4 opacity-50">📚</div>
                      <p>No content available</p>
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
