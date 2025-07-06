import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Shield, Users, Star, TrendingUp, Search, ArrowRight, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { LoginData, RegisterData } from "@shared/schema";

export default function Landing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "buyer",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: async (data) => {
      // Store JWT token
      localStorage.setItem('authToken', data.token);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      setIsLoginOpen(false);
      // Invalidate auth query to trigger re-fetch
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Role-based redirection
      const userRole = data.user?.role;
      if (userRole === "seller") {
        // Redirect sellers to dealers page
        window.location.href = "/dealers";
      } else if (userRole === "buyer") {
        // Redirect buyers to cars page
        window.location.href = "/search";
      } else {
        // Default redirect for admin or other roles
        window.location.reload();
      }
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: async (data) => {
      // Store JWT token
      localStorage.setItem('authToken', data.token);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
      setIsRegisterOpen(false);
      // Invalidate auth query to trigger re-fetch
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Role-based redirection
      const userRole = data.user?.role;
      if (userRole === "seller") {
        // Redirect sellers to dealers page
        window.location.href = "/dealers";
      } else if (userRole === "buyer") {
        // Redirect buyers to cars page
        window.location.href = "/search";
      } else {
        // Default redirect for admin or other roles
        window.location.reload();
      }
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">CarStore</span>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Sign In</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Sign In</DialogTitle>
                    <DialogDescription>
                      Enter your credentials to access your account
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...loginForm.register("email")}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button>Get Started</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Account</DialogTitle>
                    <DialogDescription>
                      Join CarStore and start your journey
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Choose a username"
                        {...registerForm.register("username")}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-600">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="Enter your email"
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Create a password"
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">I want to</Label>
                      <Tabs defaultValue="buyer" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger 
                            value="buyer" 
                            onClick={() => registerForm.setValue("role", "buyer")}
                          >
                            Buy Cars
                          </TabsTrigger>
                          <TabsTrigger 
                            value="seller" 
                            onClick={() => registerForm.setValue("role", "seller")}
                          >
                            Sell Cars
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect Car
              <span className="text-blue-600"> Today</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover thousands of quality vehicles from trusted dealers. Whether you're buying or selling, 
              we make it simple, secure, and transparent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsRegisterOpen(true)}
              >
                <Search className="mr-2 h-5 w-5" />
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => setIsLoginOpen(true)}
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CarStore?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing the car buying and selling experience with modern tools and trusted service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Verified Dealers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All our dealers are thoroughly verified and rated by real customers for your peace of mind.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Advanced Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Find exactly what you're looking for with our powerful filters and intelligent search.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Trusted Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Join thousands of satisfied customers who've found their perfect car through CarStore.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-600">Cars Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1K+</div>
              <div className="text-gray-600">Verified Dealers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">25K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">4.9</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join CarStore today and discover a better way to buy and sell cars.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-4"
              onClick={() => setIsRegisterOpen(true)}
            >
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => setIsRegisterOpen(true)}
            >
              List Your Car
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold">CarStore</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for buying and selling cars online.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Buyers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors" onClick={() => setIsLoginOpen(true)}>Search Cars</button></li>
                <li><button className="hover:text-white transition-colors" onClick={() => setIsLoginOpen(true)}>Compare Vehicles</button></li>
                <li><button className="hover:text-white transition-colors" onClick={() => setIsLoginOpen(true)}>Financing Options</button></li>
                <li><button className="hover:text-white transition-colors" onClick={() => setIsLoginOpen(true)}>Reviews & Ratings</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Sellers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors" onClick={() => setIsRegisterOpen(true)}>List Your Car</button></li>
                <li><button className="hover:text-white transition-colors" onClick={() => setIsRegisterOpen(true)}>Dealer Portal</button></li>
                <li><button className="hover:text-white transition-colors" onClick={() => setIsLoginOpen(true)}>Inventory Management</button></li>
                <li><button className="hover:text-white transition-colors" onClick={() => setIsLoginOpen(true)}>Analytics</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors" onClick={() => setIsLoginOpen(true)}>Help Center</button></li>
                <li><button className="hover:text-white transition-colors" onClick={() => setIsLoginOpen(true)}>Contact Us</button></li>
                <li><button className="hover:text-white transition-colors" onClick={() => setIsLoginOpen(true)}>Terms of Service</button></li>
                <li><button className="hover:text-white transition-colors" onClick={() => setIsLoginOpen(true)}>Privacy Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CarStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}