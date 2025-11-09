import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Users, Tractor, Calendar, Star, Trash2, CheckCircle, XCircle } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  is_active: boolean;
  owner_id: string;
}

interface Booking {
  id: string;
  equipment: { name: string };
  customer: { name: string };
  start_datetime: string;
  end_datetime: string;
  status: string;
  total_price: number;
  payment_method: string;
}

interface Review {
  id: string;
  equipment: { name: string };
  user: { name: string };
  rating: number;
  comment: string;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!data) {
        toast({ 
          title: "Access denied", 
          description: "Admin privileges required",
          variant: "destructive" 
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      fetchAllData();
    } catch (error) {
      console.error("Error checking role:", error);
      navigate("/dashboard");
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersData, equipmentData, bookingsData, reviewsData] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("equipment").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("*, equipment:equipment_id(name), customer:customer_id(name)").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*, equipment:equipment_id(name), user:user_id(name)").order("created_at", { ascending: false }),
      ]);

      if (usersData.data) setUsers(usersData.data);
      if (equipmentData.data) setEquipment(equipmentData.data);
      if (bookingsData.data) setBookings(bookingsData.data as any);
      if (reviewsData.data) setReviews(reviewsData.data as any);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    try {
      const { error } = await supabase.from("equipment").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Equipment deleted successfully" });
      fetchAllData();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast({ title: "Failed to delete equipment", variant: "destructive" });
    }
  };

  const handleToggleEquipmentStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("equipment")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      toast({ title: `Equipment ${!currentStatus ? "activated" : "deactivated"}` });
      fetchAllData();
    } catch (error) {
      console.error("Error updating equipment:", error);
      toast({ title: "Failed to update equipment", variant: "destructive" });
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Review deleted successfully" });
      fetchAllData();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({ title: "Failed to delete review", variant: "destructive" });
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Equipment</CardTitle>
              <Tractor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipment.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.phone || "N/A"}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Management</CardTitle>
                <CardDescription>Manage all listed equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipment.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.city}, {item.state}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleEquipmentStatus(item.id, item.is_active)}
                            >
                              {item.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteEquipment(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>View all bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.equipment?.name}</TableCell>
                        <TableCell>{booking.customer?.name}</TableCell>
                        <TableCell>{new Date(booking.start_datetime).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge>{booking.status}</Badge>
                        </TableCell>
                        <TableCell>₹{booking.total_price}</TableCell>
                        <TableCell>{booking.payment_method}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Review Management</CardTitle>
                <CardDescription>Manage user reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>{review.equipment?.name}</TableCell>
                        <TableCell>{review.user?.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                            {review.rating}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
                        <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
