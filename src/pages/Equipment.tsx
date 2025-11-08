import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AIChatBot } from "@/components/AIChatBot";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Search, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Equipment {
  id: string;
  name: string;
  type: string;
  description: string;
  city: string;
  state: string;
  rent_per_day: number;
  rent_per_hour: number;
  images: string[];
}

export default function Equipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEquipment(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load equipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8 px-4">
        <h1 className="text-4xl font-bold mb-2">Browse Equipment</h1>
        <p className="text-muted-foreground mb-8">Find the perfect farm equipment for your needs</p>

        {/* Filters */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Equipment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tractor">Tractor</SelectItem>
              <SelectItem value="rotavator">Rotavator</SelectItem>
              <SelectItem value="cultivator">Cultivator</SelectItem>
              <SelectItem value="thresher">Thresher</SelectItem>
              <SelectItem value="sprayer">Sprayer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Equipment Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading equipment...</p>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No equipment found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-strong transition-shadow">
                <div className="h-48 bg-muted flex items-center justify-center">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-muted-foreground">No image</div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description || "No description available"}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {item.city}, {item.state}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      <span className="font-semibold">{item.rent_per_hour}/hr</span>
                    </div>
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      <span className="font-semibold">{item.rent_per_day}/day</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button onClick={() => navigate(`/equipment/${item.id}`)} className="w-full">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AIChatBot />
    </div>
  );
}
