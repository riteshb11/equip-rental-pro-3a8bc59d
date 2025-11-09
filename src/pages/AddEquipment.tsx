import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const EQUIPMENT_TYPES = ["Tractor", "Rotavator", "Cultivator", "Thresher", "Sprayers"];

export default function AddEquipment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isFarmer, setIsFarmer] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    rent_per_hour: "",
    rent_per_day: "",
    city: "",
    state: "",
    images: [] as string[],
  });

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
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
        .eq("role", "farmer")
        .single();

      if (!data) {
        toast({ 
          title: "Access denied", 
          description: "Only farmers can list equipment",
          variant: "destructive" 
        });
        navigate("/dashboard");
        return;
      }

      setIsFarmer(true);
    } catch (error) {
      console.error("Error checking role:", error);
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please login", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("equipment").insert({
        owner_id: user.id,
        name: formData.name,
        type: formData.type as any,
        description: formData.description,
        rent_per_hour: parseFloat(formData.rent_per_hour),
        rent_per_day: parseFloat(formData.rent_per_day),
        city: formData.city,
        state: formData.state,
        images: formData.images.length > 0 ? formData.images : ["/placeholder.svg"],
        is_active: true,
      } as any);

      if (error) throw error;

      toast({ title: "Equipment listed successfully!" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding equipment:", error);
      toast({ title: "Failed to add equipment", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === "images") {
      setFormData((prev) => ({ ...prev, images: value ? [value] : [] }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  if (!isFarmer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>List New Equipment</CardTitle>
            <CardDescription>Add your farm equipment to rent out to others</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Equipment Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., John Deere 5075E Tractor"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Equipment Type *</Label>
                <Select value={formData.type} onValueChange={(v) => handleChange("type", v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe your equipment, its condition, and any special features"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rent_per_hour">Rent per Hour (₹) *</Label>
                  <Input
                    id="rent_per_hour"
                    type="number"
                    value={formData.rent_per_hour}
                    onChange={(e) => handleChange("rent_per_hour", e.target.value)}
                    placeholder="500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rent_per_day">Rent per Day (₹) *</Label>
                  <Input
                    id="rent_per_day"
                    type="number"
                    value={formData.rent_per_day}
                    onChange={(e) => handleChange("rent_per_day", e.target.value)}
                    placeholder="3000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="e.g., Pune"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    placeholder="e.g., Maharashtra"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="images">Image URL (Optional)</Label>
                <Input
                  id="images"
                  value={formData.images[0] || ""}
                  onChange={(e) => handleChange("images", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a URL to an image of your equipment
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Listing..." : "List Equipment"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
