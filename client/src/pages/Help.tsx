import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Book, MessageCircle, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

export default function Help() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions and get the support you need.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <MessageCircle className="h-12 w-12 text-carstore-orange mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Get instant help from our support team</p>
              <Button>Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Phone className="h-12 w-12 text-carstore-orange mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Call Support</h3>
              <p className="text-gray-600 mb-4">Speak with a representative</p>
              <Button variant="outline">1-800-CAR-STORE</Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Mail className="h-12 w-12 text-carstore-orange mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">Send us a detailed message</p>
              <Link href="/contact">
                <Button variant="outline">Contact Form</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5" />
                Buying a Car
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 hover:underline">How to search for cars</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Scheduling test drives</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Financing options</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Trade-in process</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Vehicle history reports</a></li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5" />
                For Dealers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 hover:underline">Getting verified</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Listing vehicles</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Managing inventory</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Analytics dashboard</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Pricing tools</a></li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5" />
                Account & Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 hover:underline">Creating an account</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Managing favorites</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Privacy settings</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Notification preferences</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Deleting account</a></li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5" />
                Technical Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 hover:underline">Website troubleshooting</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Mobile app issues</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Browser compatibility</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Login problems</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Payment issues</a></li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5" />
                Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 hover:underline">Terms of service</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Privacy policy</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Refund policy</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Dealer guidelines</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Community standards</a></li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 hover:underline">How CarStore works</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Creating your first search</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Comparing vehicles</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Understanding dealer ratings</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Safety tips</a></li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Popular Articles */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Popular Help Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Most Viewed This Week</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-blue-600 hover:underline">How to get pre-approved for financing</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">What to bring to a test drive</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">Understanding vehicle condition ratings</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">How to negotiate car prices</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Recently Updated</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-blue-600 hover:underline">New dealer verification process</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">Updated mobile app features</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">Enhanced search filters</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">Improved calculator tools</a></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}