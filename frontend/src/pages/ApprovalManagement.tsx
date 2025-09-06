import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  UserCheck,
  UserX,
  AlertCircle,
  Mail,
  Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PendingUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  approvalAuthority: string;
  createdAt: string;
  testId?: string;
}

const ApprovalManagement = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);

  // Fetch pending approvals
  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/approvals/registration-block', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data.data || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch pending approvals",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while fetching approvals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Approve user
  const approveUser = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/approvals/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvedBy: user?.id
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User approved successfully",
        });
        fetchPendingApprovals(); // Refresh the list
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to approve user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while approving user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reject user
  const rejectUser = async (userId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/approvals/${userId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectionReason,
          rejectedBy: user?.id
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User rejected successfully",
        });
        setRejectionReason('');
        setSelectedUser(null);
        fetchPendingApprovals(); // Refresh the list
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to reject user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while rejecting user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'teacher')) {
      fetchPendingApprovals();
    }
  }, [user, token]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalAuthorityColor = (authority: string) => {
    switch (authority) {
      case 'registration_block': return 'bg-purple-100 text-purple-800';
      case 'faculty': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approval Management</h1>
          <p className="text-gray-600">Manage user registrations and approvals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-amber-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Registration Block</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingUsers.filter(u => u.approvalAuthority === 'registration_block').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingUsers.filter(u => u.approvalAuthority === 'faculty').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>
              Review and approve or reject user registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Approvals</h3>
                <p className="text-gray-600">All user registrations have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((pendingUser) => (
                  <Card key={pendingUser._id} className="border-l-4 border-l-amber-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {pendingUser.name}
                            </h3>
                            <Badge className={getRoleColor(pendingUser.role)}>
                              {pendingUser.role.charAt(0).toUpperCase() + pendingUser.role.slice(1)}
                            </Badge>
                            <Badge className={getApprovalAuthorityColor(pendingUser.approvalAuthority)}>
                              {pendingUser.approvalAuthority.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {pendingUser.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(pendingUser.createdAt).toLocaleDateString()}
                            </div>
                            {pendingUser.testId && (
                              <div className="flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                Test ID: {pendingUser.testId}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => approveUser(pendingUser._id)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => setSelectedUser(pendingUser)}
                            variant="destructive"
                            disabled={loading}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rejection Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Reject User Registration</CardTitle>
                <CardDescription>
                  Please provide a reason for rejecting {selectedUser.name}'s registration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Enter the reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(null);
                      setRejectionReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => rejectUser(selectedUser._id)}
                    disabled={loading || !rejectionReason.trim()}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalManagement;
