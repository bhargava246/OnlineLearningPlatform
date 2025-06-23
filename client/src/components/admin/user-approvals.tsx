import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, UserX, Users } from "lucide-react";

export default function UserApprovals() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ["/api/mongo/admin/pending-approvals"],
  });

  const { data: courses } = useQuery({
    queryKey: ["/api/mongo/courses"],
  });

  const handleApproveUser = async (userId, selectedCourses = []) => {
    try {
      const response = await fetch(`/api/mongo/admin/users/${userId}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isApproved: true,
          enrolledCourses: selectedCourses
        })
      });

      if (response.ok) {
        toast({
          title: "User Approved",
          description: "User has been approved and enrolled in selected courses.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/mongo/admin/pending-approvals"] });
        queryClient.invalidateQueries({ queryKey: ["/api/mongo/admin/users"] });
      } else {
        throw new Error('Failed to approve user');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      const response = await fetch(`/api/mongo/admin/users/${userId}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isApproved: false
        })
      });

      if (response.ok) {
        toast({
          title: "User Rejected",
          description: "User request has been rejected.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/mongo/admin/pending-approvals"] });
      } else {
        throw new Error('Failed to reject user');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject user. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (approvalsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Approval Requests</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approval Requests</CardTitle>
        <CardDescription>Review and approve student registration requests</CardDescription>
      </CardHeader>
      <CardContent>
        {!pendingApprovals || pendingApprovals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
            <p className="text-gray-500">All registration requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((user) => (
              <ApprovalRequestCard 
                key={user._id} 
                user={user} 
                courses={courses || []}
                onApprove={handleApproveUser}
                onReject={handleRejectUser}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ApprovalRequestCard({ user, courses, onApprove, onReject }) {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isApproving, setIsApproving] = useState(false);
  const [showCourseSelection, setShowCourseSelection] = useState(false);

  const handleCourseChange = (courseId, checked) => {
    if (checked) {
      setSelectedCourses([...selectedCourses, courseId]);
    } else {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    await onApprove(user._id, selectedCourses);
    setIsApproving(false);
    setShowCourseSelection(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">Username: {user.username}</p>
            <Badge variant="outline" className="mt-1">
              Registration Date: {new Date(user.createdAt).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Dialog open={showCourseSelection} onOpenChange={setShowCourseSelection}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Approve & Enroll
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve User & Enroll in Courses</DialogTitle>
              <DialogDescription>
                Select courses to enroll {user.firstName} {user.lastName} in upon approval
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="mb-4">
                <Label className="text-sm font-medium">Select courses to enroll in:</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {courses.map((course) => (
                    <div key={course._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`course-${course._id}`}
                        checked={selectedCourses.includes(course._id)}
                        onCheckedChange={(checked) => handleCourseChange(course._id, checked)}
                      />
                      <Label htmlFor={`course-${course._id}`} className="text-sm">
                        {course.title}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex-1"
                >
                  {isApproving ? 'Approving...' : `Approve & Enroll in ${selectedCourses.length} courses`}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCourseSelection(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          size="sm" 
          variant="destructive"
          onClick={() => onReject(user._id)}
        >
          <UserX className="w-4 h-4 mr-2" />
          Reject
        </Button>
      </div>
    </div>
  );
}