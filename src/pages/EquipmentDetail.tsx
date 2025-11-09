import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AIChatBot } from "@/components/AIChatBot";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { MapPin, Clock, Star, ArrowLeft } from "lucide-react";
import { format, addHours } from "date-fns";

interface Equipment {
  id: string;
  name: string;
  type: string;
  description: string;
  rent_per_hour: number;
  rent_per_day: number;
  city: string;
  state: string;
  images: string[];
  owner_id: string;
}

interface Booking {
  start_datetime: string;
  end_datetime: string;
  status: string;
}

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [rentType, setRentType] = useState<"hour" | "day">("day");
  const [hours, setHours] = useState("4");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    fetchEquipmentDetails();
    fetchBookings();
  }, [id]);

  const fetchEquipmentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEquipment(data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({ title: "Error loading equipment", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("start_datetime, end_datetime, status")
        .eq("equipment_id", id)
        .in("status", ["requested", "accepted"]);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const isDateBooked = (date: Date) => {
    return bookings.some((booking) => {
      const start = new Date(booking.start_datetime);
      const end = new Date(booking.end_datetime);
      return date >= start && date <= end;
    });
  };

  const calculatePrice = () => {
    if (!equipment) return 0;
    if (rentType === "day") return equipment.rent_per_day;
    return equipment.rent_per_hour * parseInt(hours);
  };

  const handleBooking = async () => {
    if (!selectedDate || !equipment) {
      toast({ title: "Please select a date", variant: "destructive" });
      return;
    }

    if (isDateBooked(selectedDate)) {
      toast({ title: "This date is already booked", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please login to book", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const startDatetime = selectedDate;
      const endDatetime = rentType === "day" 
        ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
        : addHours(selectedDate, parseInt(hours));

      const { error } = await supabase.from("bookings").insert({
        equipment_id: equipment.id,
        customer_id: user.id,
        owner_id: equipment.owner_id,
        start_datetime: startDatetime.toISOString(),
        end_datetime: endDatetime.toISOString(),
        rent_type: rentType,
        total_price: calculatePrice(),
        payment_method: paymentMethod,
        status: "requested",
      });

      if (error) throw error;

      toast({ title: "Booking requested successfully!" });
      setIsBookingOpen(false);
      fetchBookings();
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({ title: "Failed to create booking", variant: "destructive" });
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

  if (!equipment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Equipment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AIChatBot />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/equipment")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Equipment
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img
              src={equipment.images?.[0] || "/placeholder.svg"}
              alt={equipment.name}
              className="w-full h-96 object-cover rounded-lg shadow-elegant"
            />
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-foreground">{equipment.name}</h1>
              <p className="text-muted-foreground flex items-center mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                {equipment.city}, {equipment.state}
              </p>
              <p className="text-muted-foreground mt-4">{equipment.description}</p>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Rental Information</CardTitle>
                <CardDescription>Choose your rental period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">Per Hour</span>
                  </div>
                  <span className="text-xl font-bold text-primary">₹{equipment.rent_per_hour}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">Per Day</span>
                  </div>
                  <span className="text-xl font-bold text-primary">₹{equipment.rent_per_day}</span>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Select Available Date</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || isDateBooked(date)}
                    className="rounded-md border"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    * Dates with existing bookings are disabled
                  </p>
                </div>

                <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Request Booking
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Booking</DialogTitle>
                      <DialogDescription>
                        Complete the details below to request booking
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Rental Type</Label>
                        <RadioGroup value={rentType} onValueChange={(v) => setRentType(v as "hour" | "day")}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hour" id="hour" />
                            <Label htmlFor="hour">Hourly (₹{equipment.rent_per_hour}/hr)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="day" id="day" />
                            <Label htmlFor="day">Daily (₹{equipment.rent_per_day}/day)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {rentType === "hour" && (
                        <div>
                          <Label>Number of Hours</Label>
                          <Select value={hours} onValueChange={setHours}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[2, 4, 6, 8, 10, 12].map((h) => (
                                <SelectItem key={h} value={h.toString()}>
                                  {h} hours
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <Label>Payment Method</Label>
                        <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "cod" | "online")}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cod" id="cod" />
                            <Label htmlFor="cod">Cash on Delivery</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="online" id="online" />
                            <Label htmlFor="online">Online Payment</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total Price:</span>
                          <span className="text-2xl font-bold text-primary">₹{calculatePrice()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBooking}>Confirm Booking</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
