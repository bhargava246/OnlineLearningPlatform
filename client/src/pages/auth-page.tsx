import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2, BookOpen, Users, Trophy, Zap } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");

  // Redirect if already logged in
  if (!isLoading && user) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/mongo/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        // Force page reload to ensure authentication state is updated
        window.location.href = "/mycourses";
      } else {
        toast({
          title: "Login failed",
          description: result.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setRegistrationMessage("");
    try {
      const response = await fetch("/api/mongo/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setRegistrationMessage(result.message);
        registerForm.reset();
        toast({
          title: "Registration successful",
          description: "Your account is pending approval.",
        });
      } else {
        toast({
          title: "Registration failed",
          description: result.message || "Registration failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplitLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Transform Your Learning Journey
              </h1>
              <p className="text-xl text-slate-300">
                Join thousands of students and unlock your potential with our comprehensive learning platform.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm">
                <BookOpen className="h-8 w-8 text-violet-400" />
                <div>
                  <h3 className="font-semibold text-white">Expert Courses</h3>
                  <p className="text-sm text-slate-300">Industry-leading content</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm">
                <Users className="h-8 w-8 text-cyan-400" />
                <div>
                  <h3 className="font-semibold text-white">Community</h3>
                  <p className="text-sm text-slate-300">Learn with peers</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm">
                <Trophy className="h-8 w-8 text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-white">Certificates</h3>
                  <p className="text-sm text-slate-300">Earn recognition</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm">
                <Zap className="h-8 w-8 text-purple-400" />
                <div>
                  <h3 className="font-semibold text-white">Fast Track</h3>
                  <p className="text-sm text-slate-300">Accelerated learning</p>
                </div>
              </div>
            </div>
          </div>

          {/* Authentication Forms */}
          <div className="w-full max-w-lg mx-auto">
            <div className="relative">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
              
              {/* Main card */}
              <Card className="relative bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20"></div>
                
                <CardHeader className="relative text-center py-8 px-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Welcome
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 mt-2">
                    Continue your learning journey with us
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative px-8 pb-8">
                {registrationMessage && (
                  <Alert className="mb-4">
                    <AlertDescription>{registrationMessage}</AlertDescription>
                  </Alert>
                )}

                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 backdrop-blur-sm p-1 rounded-2xl">
                    <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="register" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium">
                      Register
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Enter your username"
                          className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200"
                          {...loginForm.register("username")}
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                            {loginForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200"
                          {...loginForm.register("password")}
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={isSubmitting}
                      >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                    </form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-gray-500 font-medium">
                          OR CONTINUE WITH
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-xl font-medium transition-all duration-200"
                      onClick={handleReplitLogin}
                      disabled={isSubmitting}
                    >
                      <BookOpen className="mr-2 h-5 w-5" />
                      Sign in with Replit
                    </Button>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            {...registerForm.register("firstName")}
                          />
                          {registerForm.formState.errors.firstName && (
                            <p className="text-sm text-red-600">
                              {registerForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            {...registerForm.register("lastName")}
                          />
                          {registerForm.formState.errors.lastName && (
                            <p className="text-sm text-red-600">
                              {registerForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...registerForm.register("email")}
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-600">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registerUsername">Username</Label>
                        <Input
                          id="registerUsername"
                          type="text"
                          {...registerForm.register("username")}
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-red-600">
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registerPassword">Password</Label>
                        <Input
                          id="registerPassword"
                          type="password"
                          {...registerForm.register("password")}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-600">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                    </form>

                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                      New accounts require admin approval before access is granted.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}