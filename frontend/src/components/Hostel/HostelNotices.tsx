import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from '../ui/use-toast';
import { format } from 'date-fns';
import axios from '../../lib/axios';

const HostelNotices: React.FC = () => {
  const { user, token } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'all',
    validTill: '',
  });

  const isAdmin = user?.role === 'admin';
  const isWarden = user?.role === 'warden';
  const isAdminOrWarden = isAdmin || isWarden;

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/hostel/notices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotices(response.data.data);
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch hostel notices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/hostel/notices', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Notice published successfully',
      });
      setOpenCreateDialog(false);
      setFormData({
        title: '',
        content: '',
        audience: 'all',
        validTill: '',
      });
      fetchNotices();
    } catch (error) {
      console.error('Error creating notice:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish notice',
        variant: 'destructive',
      });
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all':
        return 'All';
      case 'blockA':
        return 'Block A';
      case 'blockB':
        return 'Block B';
      case 'wardens':
        return 'Wardens';
      case 'students':
        return 'Students';
      default:
        return audience;
    }
  };

  if (loading) {
    return <div className="flex justify-center">Loading notices...</div>;
  }

  return (
    <div className="space-y-4">
      {isAdminOrWarden && (
        <div className="flex justify-end">
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button>Publish Notice</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish Hostel Notice</DialogTitle>
                <DialogDescription>
                  Fill in the details to publish a new hostel notice.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateNotice}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="content" className="text-right">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="audience" className="text-right">
                      Audience
                    </Label>
                    <Select
                      value={formData.audience}
                      onValueChange={(value) => setFormData({ ...formData, audience: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="blockA">Block A</SelectItem>
                        <SelectItem value="blockB">Block B</SelectItem>
                        <SelectItem value="wardens">Wardens</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="validTill" className="text-right">
                      Valid Till
                    </Label>
                    <Input
                      id="validTill"
                      type="date"
                      value={formData.validTill}
                      onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Publish Notice</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {notices.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>No notices found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notices.map((notice) => (
            <Card key={notice._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{notice.title}</CardTitle>
                  <Badge>{getAudienceLabel(notice.audience)}</Badge>
                </div>
                <CardDescription>
                  Published on {format(new Date(notice.createdAt), 'dd/MM/yyyy')}
                  {notice.validTill && (
                    <> · Valid till {format(new Date(notice.validTill), 'dd/MM/yyyy')}</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{notice.content}</p>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                Published by: {notice.publishedBy?.name || 'Admin'}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostelNotices;