import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string;
  equipment: { name: string; type: string };
  customer: { name: string };
  owner: { name: string };
  start_datetime: string;
  end_datetime: string;
  status: string;
  total_price: number;
  payment_method: string;
  rent_type: string;
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      fetchBookings(user.id);
    } catch (error) {
      console.error("Error checking auth:", error);
      navigate("/auth");
    }
  };

  const fetchBookings = async (uid: string) => {
    setLoading(true);
    try {
      const [customerData, ownerData] = await Promise.all([
        supabase
          .from("bookings")
          .select("*, equipment:equipment_id(name, type), owner:owner_id(name)")
          .eq("customer_id", uid)
          .order("created_at", { ascending: false }),
        supabase
          .from("bookings")
          .select("*, equipment:equipment_id(name, type), customer:customer_id(name)")
          .eq("owner_id", uid)
          .order("created_at", { ascending: false }),
      ]);

      if (customerData.data) setCustomerBookings(customerData.data as any);
      if (ownerData.data) setOwnerBookings(ownerData.data as any);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({ title: "Error loading bookings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "accepted" })
        .eq("id", bookingId);

      if (error) throw error;
      toast({ title: "Booking accepted" });
      fetchBookings(userId);
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast({ title: "Failed to accept booking", variant: "destructive" });
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "rejected" })
        .eq("id", bookingId);

      if (error) throw error;
      toast({ title: "Booking rejected" });
      fetchBookings(userId);
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast({ title: "Failed to reject booking", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      case "requested":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        <Tabs defaultValue="customer" className="space-y-4">
          <TabsList>
            <TabsTrigger value="customer">My Rentals ({customerBookings.length})</TabsTrigger>
            <TabsTrigger value="owner">Booking Requests ({ownerBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-4">
            {customerBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No bookings yet</p>
                  <Button className="mt-4" onClick={() => navigate("/equipment")}>
                    Browse Equipment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              customerBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{booking.equipment?.name}</CardTitle>
                        <CardDescription>{booking.equipment?.type}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Owner</p>
                        <p className="font-medium">{booking.owner?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Period</p>
                        <p className="font-medium">
                          {format(new Date(booking.start_datetime), "PPP")} - 
                          {format(new Date(booking.end_datetime), "PPP")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rental Type</p>
                        <p className="font-medium capitalize">{booking.rent_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-medium text-primary">₹{booking.total_price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p className="font-medium uppercase">{booking.payment_method}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="owner" className="space-y-4">
            {ownerBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No booking requests yet</p>
                </CardContent>
              </Card>
            ) : (
              ownerBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{booking.equipment?.name}</CardTitle>
                        <CardDescription>{booking.equipment?.type}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="font-medium">{booking.customer?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Period</p>
                        <p className="font-medium">
                          {format(new Date(booking.start_datetime), "PPP")} - 
                          {format(new Date(booking.end_datetime), "PPP")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rental Type</p>
                        <p className="font-medium capitalize">{booking.rent_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-medium text-primary">₹{booking.total_price}</p>
                      </div>
                    </div>

                    {booking.status === "requested" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAcceptBooking(booking.id)}
                          className="flex-1"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRejectBooking(booking.id)}
                          className="flex-1"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
