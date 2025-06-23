import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "@/components/stats-card";
import ApprovalStatusBanner from "@/components/approval-status-banner";
import { formatTimeAgo, getActivityIcon, getActivityIconColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecentActivity } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/stats`],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<RecentActivity[]>({
    queryKey: [`/api/users/${userId}/activities`],
  });

  if (statsLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-96 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Approval Status Banner */}
      <ApprovalStatusBanner />

      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome back, <span>{user?.firstName}</span>!
        </h2>
        <p className="text-gray-600 mt-2">Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon="fas fa-book-open"
          iconColor="text-blue-500"
          title="Enrolled Courses"
          value={stats?.enrolledCourses || 0}
        />
        <StatsCard
          icon="fas fa-check-circle"
          iconColor="text-green-500"
          title="Completed"
          value={stats?.completedCourses || 0}
        />
        <StatsCard
          icon="fas fa-clock"
          iconColor="text-yellow-500"
          title="Hours Learned"
          value={stats?.hoursLearned || 0}
        />
        <StatsCard
          icon="fas fa-trophy"
          iconColor="text-purple-500"
          title="Average Score"
          value={stats?.averageScore ? `${stats.averageScore}%` : "0%"}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {activitiesLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-64 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))
          ) : activities && activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityIconColor(activity.type)}`}>
                    <i className={`${getActivityIcon(activity.type)} text-sm`}></i>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-500">{formatTimeAgo(activity.createdAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-history text-4xl mb-4 opacity-50"></i>
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
