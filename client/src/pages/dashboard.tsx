import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { formatTimeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import { 
  Users, 
  Clock,
  MoreHorizontal,
  BookOpen
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import type { RecentActivity } from "@shared/schema";



export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const userId = user?.id;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/stats`],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<RecentActivity[]>({
    queryKey: [`/api/users/${userId}/activities`],
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <Skeleton className="h-8 w-96 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Welcome Section */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}!</h2>
                  <p className="text-blue-100 max-w-md">
                    Continue your learning journey and achieve your educational goals. 
                    Track your progress and explore new courses.
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => setLocation('/courses')}
                >
                  View Courses
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Semester Grade</CardTitle>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-end space-x-2">
                      {[40, 30, 50, 60, 45, 70, 55].map((height, i) => (
                        <div 
                          key={i} 
                          className="bg-green-500 rounded-t flex-1"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Sept 1</span>
                      <span>Sept 2</span>
                      <span>Sept 3</span>
                      <span>Sept 4</span>
                      <span>Sept 5</span>
                      <span>Sept 6</span>
                      <span>Sept 7</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Lesson</CardTitle>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#ef4444" strokeWidth="8" 
                                  strokeDasharray="176" strokeDashoffset="44" className="transition-all"/>
                          <circle cx="64" cy="64" r="40" fill="none" stroke="#f59e0b" strokeWidth="8" 
                                  strokeDasharray="126" strokeDashoffset="31" className="transition-all"/>
                          <circle cx="64" cy="64" r="24" fill="none" stroke="#10b981" strokeWidth="8" 
                                  strokeDasharray="75" strokeDashoffset="19" className="transition-all"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span>Quiz</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span>Submission</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span>Research</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Documents and Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your documents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Submission ML Programming</p>
                          <p className="text-xs text-gray-500">24 November • 11:30</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Submitted</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Submission Mobile Programming</p>
                          <p className="text-xs text-gray-500">22 November • 13:45</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Reviewed</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progress Learning</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>UI</span>
                          <span>Fast Typography</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>DB</span>
                          <span>Fast Data Structure</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '90%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>AS</span>
                          <span>Fast Architecture</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Upcoming */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Meeting with Mr Lurik</p>
                      <p className="text-xs text-gray-500">09:00AM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Meeting with Talk Galang</p>
                      <p className="text-xs text-gray-500">11:15AM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activitiesLoading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))
                  ) : activities && activities.length > 0 ? (
                    activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.createdAt ? formatTimeAgo(new Date(activity.createdAt)) : 'No date'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Latest Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Latest Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <span className="font-medium text-sm">AK</span>
                    <div className="w-8 h-8 bg-gray-300 rounded-full ml-auto"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="w-8 h-8 bg-gray-300 rounded-full ml-auto"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
