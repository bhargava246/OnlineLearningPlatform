import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Users, UserMinus, Edit, Trash2 } from "lucide-react";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/mongo/admin/users"],
  });

  const { data: courses } = useQuery({
    queryKey: ["/api/mongo/courses"],
  });

  const handleSuspendUser = async (userId, coursesToRemove) => {
    try {
      const response = await fetch(`/api/mongo/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          coursesToRemove
        })
      });

      if (response.ok) {
        toast({
          title: "User Suspended",
          description: "User has been suspended from selected courses.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/mongo/admin/users"] });
      } else {
        throw new Error('Failed to suspend user');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditUserCourses = async (userId, newCourses) => {
    try {
      const response = await fetch(`/api/mongo/admin/users/${userId}/courses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          enrolledCourses: newCourses
        })
      });

      if (response.ok) {
        toast({
          title: "Courses Updated",
          description: "User courses have been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/mongo/admin/users"] });
      } else {
        throw new Error('Failed to update user courses');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user courses. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (usersLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const approvedUsers = users?.filter(user => user.isApproved && user.role !== 'admin') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage platform users and their course access</CardDescription>
      </CardHeader>
      <CardContent>
        {approvedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Users</h3>
            <p className="text-gray-500">No approved users to manage yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedUsers.map((user) => (
              <UserManagementCard
                key={user._id}
                user={user}
                courses={courses || []}
                onSuspend={handleSuspendUser}
                onEditCourses={handleEditUserCourses}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UserManagementCard({ user, courses, onSuspend, onEditCourses }) {
  const [selectedCoursesToRemove, setSelectedCoursesToRemove] = useState([]);
  const [newCourseSelection, setNewCourseSelection] = useState(
    user.enrolledCourses?.map(c => c._id || c) || []
  );

  const handleSuspendCourseChange = (courseId, checked) => {
    if (checked) {
      setSelectedCoursesToRemove([...selectedCoursesToRemove, courseId]);
    } else {
      setSelectedCoursesToRemove(selectedCoursesToRemove.filter(id => id !== courseId));
    }
  };

  const handleEditCourseChange = (courseId, checked) => {
    if (checked) {
      setNewCourseSelection([...newCourseSelection, courseId]);
    } else {
      setNewCourseSelection(newCourseSelection.filter(id => id !== courseId));
    }
  };

  const userEnrolledCourseIds = user.enrolledCourses?.map(c => c._id || c) || [];

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-lg">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary">
                {user.role}
              </Badge>
              <Badge variant="default">
                {userEnrolledCourseIds.length} courses enrolled
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <UserMinus className="w-4 h-4 mr-2" />
              Suspend from Courses
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User from Courses</DialogTitle>
              <DialogDescription>
                Select courses to remove {user.firstName} from
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {userEnrolledCourseIds.length === 0 ? (
                <p className="text-gray-500">User is not enrolled in any courses</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {courses.filter(course => userEnrolledCourseIds.includes(course._id)).map((course) => (
                    <div key={course._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`suspend-${course._id}`}
                        checked={selectedCoursesToRemove.includes(course._id)}
                        onCheckedChange={(checked) => handleSuspendCourseChange(course._id, checked)}
                      />
                      <Label htmlFor={`suspend-${course._id}`}>
                        {course.title}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              <Button 
                onClick={() => onSuspend(user._id, selectedCoursesToRemove)}
                disabled={selectedCoursesToRemove.length === 0}
                variant="destructive"
                className="w-full"
              >
                Suspend from {selectedCoursesToRemove.length} Selected Courses
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Course Access
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Courses</DialogTitle>
              <DialogDescription>
                Manage {user.firstName}'s course enrollments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {courses.map((course) => (
                  <div key={course._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${course._id}`}
                      checked={newCourseSelection.includes(course._id)}
                      onCheckedChange={(checked) => handleEditCourseChange(course._id, checked)}
                    />
                    <Label htmlFor={`edit-${course._id}`}>
                      {course.title}
                    </Label>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => onEditCourses(user._id, newCourseSelection)}
                className="w-full"
              >
                Update Course Enrollments ({newCourseSelection.length} courses)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}