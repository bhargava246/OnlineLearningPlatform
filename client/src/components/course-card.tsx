import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Video, Play } from "lucide-react";
import { getProgressColor, getStatusColor } from "@/lib/utils";
import type { Course, Enrollment } from "@shared/schema";

interface CourseCardProps {
  course: any; // MongoDB course structure
  enrollment?: Enrollment;
}

export default function CourseCard({ course, enrollment }: CourseCardProps) {
  const progress = enrollment?.progress || 0;
  const status = progress === 100 ? "Completed" : progress > 0 ? "In Progress" : "Not Started";
  
  const getButtonText = () => {
    if (progress === 100) return "Review Course";
    if (progress > 0) return "Continue Learning";
    return "Start Course";
  };

  const getButtonVariant = () => {
    return progress === 100 ? "secondary" : "default";
  };

  return (
    <div className="course-card">
      <div className="relative">
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        </div>
        <div className="absolute bottom-4 right-4">
          <Link href={`/courses/${course._id || course.id}`}>
            <Button size="icon" className="rounded-full bg-white/90 hover:bg-white text-primary">
              <Play className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{course.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{Math.floor((course.duration || 0) / 60)} hours</span>
          </div>
          <div className="flex items-center space-x-2">
            <Video className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{course.modules?.length || 0} videos</span>
          </div>
        </div>
        
        {enrollment && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="course-progress-bar">
              <div 
                className={`course-progress-fill ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <Link href={`/courses/${course._id || course.id}`}>
          <Button variant={getButtonVariant()} className="w-full">
            {getButtonText()}
          </Button>
        </Link>
      </div>
    </div>
  );
}
