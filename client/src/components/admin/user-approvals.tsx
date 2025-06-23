import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserCheck, UserX, Clock, BookOpen } from "lucide-react";

interface PendingUser {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  category: string;
}

export default function UserApprovals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourses, setSelectedCourses] = useState<Record<string, string[]>>({});

  const { data: pendingUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/mongo/admin/pending-approvals"],
    queryFn: async () => {
      const response = await fetch("/api/mongo/admin/pending-approvals", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch pending approvals");
      return response.json();
    },
  });

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["/api/mongo/courses"],
    queryFn: async () => {
      const response = await fetch("/api/mongo/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      return response.json();
    },
  });

  const approveUserMutation = useMutation({
    mutationFn: async ({ userId, courseIds }: { userId: string; courseIds: string[] }) => {
      const response = await fetch(`/api/mongo/admin/approve-user/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ courseIds }),
      });
      if (!response.ok) throw new Error("Failed to approve user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mongo/admin/pending-approvals"] });
      toast({
        title: "User approved",
        description: "The user has been approved and granted access to selected courses.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Approval failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/mongo/admin/reject-user/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to reject user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mongo/admin/pending-approvals"] });
      toast({
        title: "User rejected",
        description: "The user registration has been rejected and removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCourseSelection = (userId: string, courseId: string, checked: boolean) => {
    setSelectedCourses(prev => ({
      ...prev,
      [userId]: checked
        ? [...(prev[userId] || []), courseId]
        : (prev[userId] || []).filter(id => id !== courseId)
    }));
  };

  const handleApproveUser = (userId: string) => {
    const courseIds = selectedCourses[userId] || [];
    approveUserMutation.mutate({ userId, courseIds });
  };

  const handleRejectUser = (userId: string) => {
    rejectUserMutation.mutate(userId);
  };

  if (loadingUsers || loadingCourses) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (pendingUsers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            User Approvals
          </CardTitle>
          <CardDescription>
            Review and approve new user registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending user approvals</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          User Approvals
        </CardTitle>
        <CardDescription>
          Review and approve new user registrations ({pendingUsers.length} pending)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {pendingUsers.map((user: PendingUser) => (
          <div key={user._id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-600">@{user.username}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500">
                  Registered: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                Grant Access to Courses
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {courses.map((course: Course) => (
                  <div key={course._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${user._id}-${course._id}`}
                      checked={(selectedCourses[user._id] || []).includes(course._id)}
                      onCheckedChange={(checked) =>
                        handleCourseSelection(user._id, course._id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`${user._id}-${course._id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {course.title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRejectUser(user._id)}
                disabled={rejectUserMutation.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <UserX className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleApproveUser(user._id)}
                disabled={approveUserMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Approve & Grant Access
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}