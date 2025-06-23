import { Button } from "@/components/ui/button";
import { Eye, Download, FileText } from "lucide-react";
import type { CourseNote } from "@shared/schema";

interface PdfViewerProps {
  notes: CourseNote[];
}

export default function PdfViewer({ notes }: PdfViewerProps) {
  const handleView = (note: CourseNote) => {
    // In a real app, this would open a PDF viewer modal or navigate to a viewer page
    console.log("Viewing PDF:", note.title);
  };

  const handleDownload = (note: CourseNote) => {
    // In a real app, this would trigger the actual download
    window.open(note.downloadUrl, '_blank');
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Downloadable Notes</h3>
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="flex items-center justify-between p-3 bg-white rounded border">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-gray-900">{note.title}</p>
                <p className="text-sm text-gray-500">{note.fileSize}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => handleView(note)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDownload(note)}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notes available for this course</p>
          </div>
        )}
      </div>
    </div>
  );
}
