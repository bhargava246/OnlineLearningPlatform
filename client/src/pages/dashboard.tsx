import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { formatTimeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Settings, 
  MessageCircle, 
  Video,
  Bell,
  Search,
  MoreHorizontal,
  TrendingUp,
  Clock,
  Award
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import type { RecentActivity } from "@shared/schema";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BookOpen, label: "Grades" },
  { icon: GraduationCap, label: "Class" },
  { icon: Users, label: "Groups" },
  { icon: Settings, label: "Administration" },
  { icon: BookOpen, label: "Departments" },
];

const teamItems = [
  { icon: MessageCircle, label: "Message", badge: true },
  { icon: Video, label: "Call Meeting" },
];

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
        <div className="w-64 bg-blue-900 text-white p-6">
          <Skeleton className="h-8 w-32 mb-8 bg-blue-800" />
        </div>
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
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-900" />
            </div>
            <span className="font-bold text-lg">ruang kelas</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2 mb-8">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <button 
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    item.active 
                      ? 'bg-blue-800 text-white' 
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Teams Section */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-4">TEAMS</h3>
            <ul className="space-y-2">
              {teamItems.map((item, index) => (
                <li key={index}>
                  <button className="w-full flex items-center px-4 py-3 rounded-lg text-left text-blue-100 hover:bg-blue-800 hover:text-white transition-colors">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                    {item.badge && <div className="w-2 h-2 bg-red-500 rounded-full ml-auto"></div>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Upgrade Section */}
        <div className="p-4">
          <Card className="bg-blue-800 border-blue-700 text-white">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-4 h-4 text-blue-900" />
              </div>
              <p className="text-sm font-medium mb-3">Upgrade to Pro for more feature</p>
              <Button variant="secondary" size="sm" className="w-full">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Hello Ghazi, Welcome back 👋</p>
              <h1 className="text-2xl font-bold text-gray-900">Your Dashboard today</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Hero Card */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Creative outdoor ads</h2>
                  <p className="text-blue-100 max-w-md">
                    Every large design eventually whether it's a multi-regional 
                    branding corporation or a regular down as hard tetty magazine 
                    publisher needs to fit holes in the workforce.
                  </p>
                </div>
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                  Get started
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
