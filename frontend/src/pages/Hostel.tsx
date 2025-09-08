import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import HostelRooms from '../components/Hostel/HostelRooms';
import HostelLeaves from '../components/Hostel/HostelLeaves';
import HostelComplaints from '../components/Hostel/HostelComplaints';
import HostelNotices from '../components/Hostel/HostelNotices';
import HostelFees from '../components/Hostel/HostelFees';
import HostelMealPlans from '../components/Hostel/HostelMealPlans';
import { Helmet } from 'react-helmet-async';
// import axios from '../lib/axios';
import { CalendarIcon, BellIcon, HomeIcon, CreditCardIcon, UtensilsIcon, ClipboardIcon } from 'lucide-react';

const Hostel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    pendingLeaves: 0,
    pendingComplaints: 0,
    unpaidFees: 0,
    activeNotices: 0
  });
  
  // Determine which tabs to show based on user role (must be defined before useEffect)
  const isAdmin = user?.role === 'admin';
  const isWarden = (user?.role as any) === 'warden';
  const isStaff = (user?.role as any) === 'staff';
  const isStudent = user?.role === 'student';
  const isAdminOrWarden = isAdmin || isWarden;

  useEffect(() => {
    // This would be replaced with actual API calls in a production environment
    // For now, we'll simulate some data
    const fetchStats = async () => {
      try {
        // In a real implementation, these would be separate API calls or a combined endpoint
        setStats({
          totalRooms: 100,
          occupiedRooms: 78,
          pendingLeaves: isAdminOrWarden ? 12 : 0,
          pendingComplaints: isAdminOrWarden ? 8 : 0,
          unpaidFees: isStudent ? 1 : 15,
          activeNotices: 5
        });
      } catch (error) {
        console.error('Error fetching hostel stats:', error);
      }
    };
    
    fetchStats();
  }, [isAdminOrWarden, isStudent]);


  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Hostel Management | ERP System</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hostel Management</h1>
          <p className="text-muted-foreground mt-1">Manage all aspects of hostel operations in one place</p>
        </div>
        {isAdminOrWarden && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab('notices')}>Post Notice</Button>
            <Button onClick={() => setActiveTab('rooms')}>Manage Rooms</Button>
          </div>
        )}
        {isStudent && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab('complaints')}>Report Issue</Button>
            <Button onClick={() => setActiveTab('leaves')}>Request Leave</Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-7 lg:grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="meals">Meal Plans</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="notices">Notices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Room Occupancy</CardTitle>
                <HomeIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.occupiedRooms}/{stats.totalRooms}</div>
                <p className="text-xs text-muted-foreground">Rooms currently occupied</p>
                <div className="mt-4 h-2 w-full bg-secondary">
                  <div 
                    className="h-2 bg-primary" 
                    style={{ width: `${(stats.occupiedRooms / stats.totalRooms) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
            
            {(isAdminOrWarden || isStaff) && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
                  <p className="text-xs text-muted-foreground">Leave requests awaiting approval</p>
                  {stats.pendingLeaves > 0 && (
                    <Button variant="link" className="px-0 mt-2" onClick={() => setActiveTab('leaves')}>Review requests</Button>
                  )}
                </CardContent>
              </Card>
            )}
            
            {(isAdminOrWarden || isStaff) && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Complaints</CardTitle>
                  <ClipboardIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingComplaints}</div>
                  <p className="text-xs text-muted-foreground">Unresolved student complaints</p>
                  {stats.pendingComplaints > 0 && (
                    <Button variant="link" className="px-0 mt-2" onClick={() => setActiveTab('complaints')}>Resolve issues</Button>
                  )}
                </CardContent>
              </Card>
            )}
            
            {isAdminOrWarden && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
                  <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.unpaidFees}</div>
                  <p className="text-xs text-muted-foreground">Students with unpaid fees</p>
                  {stats.unpaidFees > 0 && (
                    <Button variant="link" className="px-0 mt-2" onClick={() => setActiveTab('fees')}>View details</Button>
                  )}
                </CardContent>
              </Card>
            )}
            
            {isStudent && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Fees</CardTitle>
                  <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.unpaidFees > 0 ? (
                      <Badge variant="destructive">Payment Due</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Hostel fee status</p>
                  {stats.unpaidFees > 0 && (
                    <Button variant="link" className="px-0 mt-2" onClick={() => setActiveTab('fees')}>Pay now</Button>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Notices</CardTitle>
                <BellIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeNotices}</div>
                <p className="text-xs text-muted-foreground">Current hostel announcements</p>
                <Button variant="link" className="px-0 mt-2" onClick={() => setActiveTab('notices')}>View all</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meal Plans</CardTitle>
                <UtensilsIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Available meal plans</p>
                <Button variant="link" className="px-0 mt-2" onClick={() => setActiveTab('meals')}>View options</Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
             <CardHeader>
               <CardTitle>Welcome to Hostel Management</CardTitle>
               <CardDescription>
                 {isAdminOrWarden && 'Manage all aspects of the hostel from room allocation to student requests.'}
                 {isStaff && 'Handle student requests and maintain hostel facilities.'}
                 {isStudent && 'Access all hostel services and submit requests from one dashboard.'}
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 <div>
                   <h3 className="font-medium">Hostel Facilities</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                     <div className="flex items-start space-x-2">
                       <div className="p-1.5 rounded-full bg-primary/10">
                         <HomeIcon className="h-4 w-4 text-primary" />
                       </div>
                       <div>
                         <h4 className="text-sm font-medium">Modern Accommodation</h4>
                         <p className="text-xs text-muted-foreground">Well-furnished rooms with essential amenities</p>
                       </div>
                     </div>
                     <div className="flex items-start space-x-2">
                       <div className="p-1.5 rounded-full bg-primary/10">
                         <UtensilsIcon className="h-4 w-4 text-primary" />
                       </div>
                       <div>
                         <h4 className="text-sm font-medium">Dining Services</h4>
                         <p className="text-xs text-muted-foreground">Nutritious meals with multiple dietary options</p>
                       </div>
                     </div>
                     <div className="flex items-start space-x-2">
                       <div className="p-1.5 rounded-full bg-primary/10">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary">
                           <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line>
                         </svg>
                       </div>
                       <div>
                         <h4 className="text-sm font-medium">Laundry Facilities</h4>
                         <p className="text-xs text-muted-foreground">On-site laundry services for residents</p>
                       </div>
                     </div>
                     <div className="flex items-start space-x-2">
                       <div className="p-1.5 rounded-full bg-primary/10">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary">
                           <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline>
                         </svg>
                       </div>
                       <div>
                         <h4 className="text-sm font-medium">Study Areas</h4>
                         <p className="text-xs text-muted-foreground">Quiet spaces for academic focus</p>
                       </div>
                     </div>
                     <div className="flex items-start space-x-2">
                       <div className="p-1.5 rounded-full bg-primary/10">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary">
                           <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                         </svg>
                       </div>
                       <div>
                         <h4 className="text-sm font-medium">24/7 Support</h4>
                         <p className="text-xs text-muted-foreground">Staff available round-the-clock for assistance</p>
                       </div>
                     </div>
                     <div className="flex items-start space-x-2">
                       <div className="p-1.5 rounded-full bg-primary/10">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary">
                           <circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>
                         </svg>
                       </div>
                       <div>
                         <h4 className="text-sm font-medium">Recreation Areas</h4>
                         <p className="text-xs text-muted-foreground">Common rooms and outdoor spaces for relaxation</p>
                       </div>
                     </div>
                   </div>
                 </div>
                <div>
                  <h3 className="font-medium">Quick Start</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {isAdminOrWarden && (
                      <>
                        <li>Allocate rooms to students from the Rooms tab</li>
                        <li>Review and approve leave requests</li>
                        <li>Manage meal plans and fee structures</li>
                        <li>Post important notices for students</li>
                      </>
                    )}
                    {isStaff && (
                      <>
                        <li>Review student complaints and resolve issues</li>
                        <li>Process leave applications</li>
                        <li>Check room occupancy status</li>
                      </>
                    )}
                    {isStudent && (
                      <>
                        <li>View your room allocation details</li>
                        <li>Apply for hostel leave when needed</li>
                        <li>Report any issues through the complaints system</li>
                        <li>Pay your hostel fees online</li>
                        <li>Subscribe to meal plans</li>
                      </>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">Recent Notices</h3>
                  <div className="mt-2 space-y-2">
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Maintenance Schedule</h4>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                      </div>
                      <p className="text-sm mt-1">Water supply will be interrupted on Saturday from 10 AM to 2 PM for maintenance.</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex justify-between">
                        <h4 className="font-medium">New Meal Options</h4>
                        <span className="text-xs text-muted-foreground">5 days ago</span>
                      </div>
                      <p className="text-sm mt-1">We've added new vegetarian options to all meal plans starting next week.</p>
                    </div>
                    <Button variant="outline" className="w-full mt-2" onClick={() => setActiveTab('notices')}>View All Notices</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hostel Rooms</CardTitle>
              <CardDescription>
                {isAdminOrWarden ? 'Manage hostel rooms and allocations.' : 'View hostel room information.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HostelRooms />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hostel Fees</CardTitle>
              <CardDescription>
                {isAdminOrWarden ? 'Manage hostel fees and payments.' : 'View and pay your hostel fees.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HostelFees />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meal Plans</CardTitle>
              <CardDescription>
                {isAdminOrWarden ? 'Manage meal plans and subscriptions.' : 'View and subscribe to meal plans.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HostelMealPlans />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hostel Leaves</CardTitle>
              <CardDescription>
                {isAdminOrWarden ? 'Manage leave applications.' : 'Apply for and track your leave applications.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HostelLeaves />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complaints</CardTitle>
              <CardDescription>
                {isAdminOrWarden || isStaff ? 'Manage and resolve complaints.' : 'Submit and track your complaints.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HostelComplaints />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notices</CardTitle>
              <CardDescription>
                {isAdminOrWarden ? 'Publish and manage notices.' : 'View hostel notices and announcements.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HostelNotices />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Hostel;