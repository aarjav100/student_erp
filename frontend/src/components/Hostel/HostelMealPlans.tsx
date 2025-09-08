import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from '../ui/use-toast';
import { format } from 'date-fns';
import axios from '../../lib/axios';

const HostelMealPlans: React.FC = () => {
  const { user, token } = useAuth();
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openSubscribeDialog, setOpenSubscribeDialog] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mealType: 'veg', // veg, non-veg, both
    meals: {
      breakfast: true,
      lunch: true,
      dinner: true,
      snacks: false
    },
    validFrom: '',
    validUntil: ''
  });

  const isAdmin = user?.role === 'admin';
  const isWarden = user?.role === 'warden';
  const isAdminOrWarden = isAdmin || isWarden;

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/hostel/meal-plans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMealPlans(response.data.data);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch meal plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMealPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/hostel/meal-plans', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Meal plan created successfully',
      });
      setOpenCreateDialog(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        mealType: 'veg',
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true,
          snacks: false
        },
        validFrom: '',
        validUntil: ''
      });
      fetchMealPlans();
    } catch (error) {
      console.error('Error creating meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create meal plan',
        variant: 'destructive',
      });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/hostel/meal-plans/${selectedMealPlan._id}/subscribe`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Successfully subscribed to meal plan',
      });
      setOpenSubscribeDialog(false);
      fetchMealPlans();
    } catch (error) {
      console.error('Error subscribing to meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to subscribe to meal plan',
        variant: 'destructive',
      });
    }
  };

  const handleUnsubscribe = async (mealPlanId: string) => {
    try {
      await axios.post(`/hostel/meal-plans/${mealPlanId}/unsubscribe`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Successfully unsubscribed from meal plan',
      });
      fetchMealPlans();
    } catch (error) {
      console.error('Error unsubscribing from meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe from meal plan',
        variant: 'destructive',
      });
    }
  };

  const handleMealToggle = (meal: string) => {
    setFormData({
      ...formData,
      meals: {
        ...formData.meals,
        [meal]: !formData.meals[meal as keyof typeof formData.meals]
      }
    });
  };

  const getMealTypeBadge = (mealType: string) => {
    switch (mealType) {
      case 'veg':
        return <Badge className="bg-green-500">Vegetarian</Badge>;
      case 'non-veg':
        return <Badge className="bg-red-500">Non-Vegetarian</Badge>;
      case 'both':
        return <Badge className="bg-purple-500">Mixed</Badge>;
      default:
        return <Badge>{mealType}</Badge>;
    }
  };

  const isSubscribed = (mealPlan: any) => {
    return mealPlan.subscribers?.includes(user?._id);
  };

  if (loading) {
    return <div className="flex justify-center">Loading meal plans...</div>;
  }

  return (
    <div className="space-y-4">
      {isAdminOrWarden && (
        <div className="flex justify-end">
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button>Create Meal Plan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Meal Plan</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new meal plan.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateMealPlan}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Price (₹)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mealType" className="text-right">
                      Meal Type
                    </Label>
                    <Select
                      value={formData.mealType}
                      onValueChange={(value) => setFormData({ ...formData, mealType: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">Vegetarian</SelectItem>
                        <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                        <SelectItem value="both">Both (Mixed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Meals Included</Label>
                    <div className="col-span-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={formData.meals.breakfast ? "default" : "outline"}
                        onClick={() => handleMealToggle('breakfast')}
                      >
                        Breakfast
                      </Button>
                      <Button
                        type="button"
                        variant={formData.meals.lunch ? "default" : "outline"}
                        onClick={() => handleMealToggle('lunch')}
                      >
                        Lunch
                      </Button>
                      <Button
                        type="button"
                        variant={formData.meals.dinner ? "default" : "outline"}
                        onClick={() => handleMealToggle('dinner')}
                      >
                        Dinner
                      </Button>
                      <Button
                        type="button"
                        variant={formData.meals.snacks ? "default" : "outline"}
                        onClick={() => handleMealToggle('snacks')}
                      >
                        Snacks
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="validFrom" className="text-right">
                      Valid From
                    </Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="validUntil" className="text-right">
                      Valid Until
                    </Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Meal Plan</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {mealPlans.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>No meal plans found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mealPlans.map((mealPlan) => (
            <Card key={mealPlan._id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{mealPlan.name}</h3>
                  {getMealTypeBadge(mealPlan.mealType)}
                </div>
                <p className="text-sm text-gray-600 mb-4">{mealPlan.description}</p>
                <div className="mb-4">
                  <p className="font-medium">Meals Included:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mealPlan.meals.breakfast && <Badge variant="outline">Breakfast</Badge>}
                    {mealPlan.meals.lunch && <Badge variant="outline">Lunch</Badge>}
                    {mealPlan.meals.dinner && <Badge variant="outline">Dinner</Badge>}
                    {mealPlan.meals.snacks && <Badge variant="outline">Snacks</Badge>}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="font-medium">Validity:</p>
                  <p className="text-sm">
                    {format(new Date(mealPlan.validFrom), 'dd/MM/yyyy')} to {format(new Date(mealPlan.validUntil), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold">₹{mealPlan.price}</p>
                  {!isAdminOrWarden && (
                    isSubscribed(mealPlan) ? (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleUnsubscribe(mealPlan._id)}
                      >
                        Unsubscribe
                      </Button>
                    ) : (
                      <Dialog open={openSubscribeDialog && selectedMealPlan?._id === mealPlan._id} onOpenChange={(open) => {
                        setOpenSubscribeDialog(open);
                        if (open) setSelectedMealPlan(mealPlan);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm">Subscribe</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Subscribe to Meal Plan</DialogTitle>
                            <DialogDescription>
                              You are about to subscribe to the {mealPlan.name} meal plan for ₹{mealPlan.price}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="mb-2"><strong>Meals Included:</strong></p>
                            <div className="flex flex-wrap gap-1 mb-4">
                              {mealPlan.meals.breakfast && <Badge variant="outline">Breakfast</Badge>}
                              {mealPlan.meals.lunch && <Badge variant="outline">Lunch</Badge>}
                              {mealPlan.meals.dinner && <Badge variant="outline">Dinner</Badge>}
                              {mealPlan.meals.snacks && <Badge variant="outline">Snacks</Badge>}
                            </div>
                            <p className="mb-2"><strong>Validity:</strong></p>
                            <p>
                              {format(new Date(mealPlan.validFrom), 'dd/MM/yyyy')} to {format(new Date(mealPlan.validUntil), 'dd/MM/yyyy')}
                            </p>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleSubscribe}>Confirm Subscription</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )
                  )}
                  {isAdminOrWarden && (
                    <div className="text-sm text-gray-500">
                      {mealPlan.subscribers?.length || 0} subscribers
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostelMealPlans;