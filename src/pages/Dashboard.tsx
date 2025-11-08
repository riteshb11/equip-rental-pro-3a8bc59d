import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AIChatBot } from "@/components/AIChatBot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Plus, Tractor, Calendar, Users } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFarmer, setIsFarmer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check user roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (roles) {
        setIsFarmer(roles.some(r => r.role === "farmer"));
        setIsAdmin(roles.some(r => r.role === "admin"));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-8 px-4">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.user_metadata?.name || "User"}!</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {isFarmer && (
                  <Button onClick={() => navigate("/equipment/new")} className="h-24 flex flex-col gap-2">
                    <Plus className="h-6 w-6" />
                    <span>List Equipment</span>
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate("/equipment")} className="h-24 flex flex-col gap-2">
                  <Tractor className="h-6 w-6" />
                  <span>Browse Equipment</span>
                </Button>
                <Button variant="outline" onClick={() => navigate("/bookings")} className="h-24 flex flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span>My Bookings</span>
                </Button>
                {isAdmin && (
                  <Button variant="outline" onClick={() => navigate("/admin")} className="h-24 flex flex-col gap-2">
                    <Users className="h-6 w-6" />
                    <span>Admin Panel</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Active Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground mt-2">No active bookings</p>
            </CardContent>
          </Card>

          {isFarmer && (
            <Card>
              <CardHeader>
                <CardTitle>My Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground mt-2">No equipment listed</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹0</p>
              <p className="text-sm text-muted-foreground mt-2">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">No recent activity</p>
          </CardContent>
        </Card>
      </div>

      <AIChatBot />
    </div>
  );
}
