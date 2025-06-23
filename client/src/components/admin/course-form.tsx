import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Youtube, FileText } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  thumbnail: z.string().url("Please enter a valid image URL"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  price: z.number().min(0, "Price must be 0 or greater"),
});

const moduleSchema = z.object({
  title: z.string().min(1, "Module title is required"),
  description: z.string().optional(),
  youtubeUrl: z.string().min(1, "YouTube URL is required").refine(
    (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url),
    "Please enter a valid YouTube URL (youtube.com or youtu.be)"
  ),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  orderIndex: z.number().min(0, "Order index must be 0 or greater").optional(),
});

const noteSchema = z.object({
  title: z.string().min(1, "Note title is required"),
  pdfUrl: z.string().min(1, "PDF URL is required").refine(
    (url) => /^https?:\/\/.+/.test(url),
    "Please enter a valid URL"
  ),
  fileSize: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;
type ModuleFormData = z.infer<typeof moduleSchema>;
type NoteFormData = z.infer<typeof noteSchema>;

interface CourseFormProps {
  course?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CourseForm({ course, onSuccess, onCancel }: CourseFormProps) {
  const [modules, setModules] = useState<ModuleFormData[]>([]);
  const [notes, setNotes] = useState<NoteFormData[]>([]);
  const [existingModules, setExistingModules] = useState<any[]>([]);
  const [existingNotes, setExistingNotes] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load existing modules and notes when editing
  useEffect(() => {
    if (course && course.modules) {
      setExistingModules(course.modules || []);
    }
    if (course && course.notes) {
      setExistingNotes(course.notes || []);
    }
  }, [course]);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: course ? {
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      thumbnail: course.thumbnail || "",
      level: course.level || "Beginner",
      price: course.price || 0,
    } : {
      title: "",
      description: "",
      category: "",
      thumbnail: "",
      level: "Beginner",
      price: 0,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData & { modules: ModuleFormData[]; notes: NoteFormData[] }) => {
      const url = course ? `/api/mongo/courses/${course._id || course.id}` : '/api/mongo/courses';
      const method = course ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Course operation failed:", errorText);
        throw new Error(`Failed to ${course ? 'update' : 'create'} course: ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mongo/courses"] });
      toast({
        title: "Success",
        description: `Course ${course ? 'updated' : 'created'} successfully`,
      });
      form.reset();
      setModules([]);
      setNotes([]);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${course ? 'update' : 'create'} course`,
        variant: "destructive",
      });
    },
  });

  const addModule = () => {
    setModules([
      ...modules,
      {
        title: "",
        description: "",
        youtubeUrl: "",
        duration: 0,
      },
    ]);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const updateModule = (index: number, field: keyof ModuleFormData, value: any) => {
    const updatedModules = [...modules];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setModules(updatedModules);
  };

  const addNote = () => {
    setNotes([
      ...notes,
      {
        title: "",
        pdfUrl: "",
        fileSize: "",
      },
    ]);
  };

  const removeExistingModule = (moduleIndex: number) => {
    setExistingModules(existingModules.filter((_, i) => i !== moduleIndex));
  };

  const removeExistingNote = (noteIndex: number) => {
    setExistingNotes(existingNotes.filter((_, i) => i !== noteIndex));
  };

  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const updateNote = (index: number, field: keyof NoteFormData, value: any) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = { ...updatedNotes[index], [field]: value };
    setNotes(updatedNotes);
  };

  const onSubmit = (data: CourseFormData) => {
    // Validate modules and notes before submitting
    const validatedModules = modules.map((module, index) => ({
      ...module,
      orderIndex: index,
      duration: Number(module.duration) || 0,
    }));

    const validatedNotes = notes.map(note => ({
      ...note,
      fileSize: note.fileSize || 'Unknown',
    }));

    // Combine existing and new content
    const allModules = [...existingModules, ...validatedModules];
    const allNotes = [...existingNotes, ...validatedNotes];

    // Check if at least one module or note exists
    if (allModules.length === 0 && allNotes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one video module or PDF note",
        variant: "destructive",
      });
      return;
    }

    // Validate modules
    for (const module of validatedModules) {
      if (!module.title || !module.youtubeUrl || !module.duration) {
        toast({
          title: "Error",
          description: "All video modules must have title, YouTube URL, and duration",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate notes
    for (const note of validatedNotes) {
      if (!note.title || !note.pdfUrl) {
        toast({
          title: "Error",
          description: "All PDF notes must have title and URL",
          variant: "destructive",
        });
        return;
      }
    }

    const courseData = {
      ...data,
      modules: allModules,
      notes: allNotes,
    };

    console.log("Submitting course data:", courseData);
    createCourseMutation.mutate(courseData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{course ? "Edit Course" : "Create New Course"}</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={createCourseMutation.isPending}
          >
            {createCourseMutation.isPending ? (course ? "Updating..." : "Creating...") : (course ? "Update Course" : "Create Course")}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Basic Course Information */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter course title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter course description" 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Programming">Programming</SelectItem>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Existing Video Modules */}
          {course && existingModules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="h-5 w-5" />
                  Existing Video Lectures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {existingModules.map((module, index) => (
                  <div key={`existing-${index}`} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Existing Module {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExistingModule(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="text-sm">
                        <span className="font-medium">Title:</span> {module.title}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Duration:</span> {module.duration} minutes
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">YouTube URL:</span> 
                      <a href={module.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                        {module.youtubeUrl}
                      </a>
                    </div>
                    {module.description && (
                      <div className="text-sm">
                        <span className="font-medium">Description:</span> {module.description}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* New Video Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5" />
                {course ? "Add New Video Lectures" : "Video Lectures"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {modules.map((module, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Module {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeModule(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Module title"
                      value={module.title}
                      onChange={(e) => updateModule(index, "title", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={module.duration || ""}
                      onChange={(e) => updateModule(index, "duration", Number(e.target.value))}
                    />
                  </div>

                  <Input
                    placeholder="YouTube URL (e.g., https://youtube.com/watch?v=...)"
                    value={module.youtubeUrl}
                    onChange={(e) => updateModule(index, "youtubeUrl", e.target.value)}
                  />

                  <Textarea
                    placeholder="Module description (optional)"
                    value={module.description}
                    onChange={(e) => updateModule(index, "description", e.target.value)}
                    rows={2}
                  />
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addModule}>
                <Plus className="h-4 w-4 mr-2" />
                Add Video Module
              </Button>
            </CardContent>
          </Card>

          {/* Existing PDF Notes */}
          {course && existingNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Existing PDF Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {existingNotes.map((note, index) => (
                  <div key={`existing-note-${index}`} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Existing Note {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExistingNote(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="text-sm">
                        <span className="font-medium">Title:</span> {note.title}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">File Size:</span> {note.fileSize || 'Unknown'}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">PDF URL:</span> 
                      <a href={note.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                        {note.pdfUrl}
                      </a>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* New PDF Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {course ? "Add New PDF Notes" : "PDF Notes"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notes.map((note, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Note {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNote(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Note title"
                      value={note.title}
                      onChange={(e) => updateNote(index, "title", e.target.value)}
                    />
                    <Input
                      placeholder="File size (optional)"
                      value={note.fileSize}
                      onChange={(e) => updateNote(index, "fileSize", e.target.value)}
                    />
                  </div>

                  <Input
                    placeholder="PDF URL (e.g., https://example.com/document.pdf)"
                    value={note.pdfUrl}
                    onChange={(e) => updateNote(index, "pdfUrl", e.target.value)}
                  />
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addNote}>
                <Plus className="h-4 w-4 mr-2" />
                Add PDF Note
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}