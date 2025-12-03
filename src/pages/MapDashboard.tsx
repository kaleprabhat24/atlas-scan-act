import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SimpleMap from '../components/SimpleMap';
import { 
  ArrowLeft, 
  Menu, 
  X, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  QrCode,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { config, BACKEND_URL } from '../config';

interface Claim {
  id: string;
  name: string;
  village: string;
  district: string;
  area_ha: number;
  lat: number;
  lon: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  scheme_suggestions: string;
  ndvi_flag: boolean;
}

const MapDashboard = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showRiskOverlay, setShowRiskOverlay] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const { toast } = useToast();

  // Load claims from API and cache
  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      // Try to load from API first
      const response = await fetch(`${BACKEND_URL}/claims`);
      if (response.ok) {
        const apiClaims = await response.json();
        setClaims(apiClaims);
        // Update cache
        localStorage.setItem('fra_claims', JSON.stringify(apiClaims.slice(0, config.CACHE_LIMIT)));
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.error('Failed to load from API, using cache:', error);
      // Fallback to cached data
      const cached = JSON.parse(localStorage.getItem('fra_claims') || '[]');
      if (cached.length > 0) {
        setClaims(cached);
        toast({
          title: "Using Cached Data",
          description: "Showing last cached claims. Some data may be outdated.",
        });
      } else {
        // Demo data if no cache
        setClaims(generateDemoData());
        toast({
          title: "Demo Mode",
          description: "Showing sample data. Connect to backend for live claims.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate demo data for testing
  const generateDemoData = (): Claim[] => [
    {
      id: "demo-1",
      name: "Ravi Kumar",
      village: "Ambeli",
      district: "Udaipur",
      area_ha: 2.5,
      lat: 24.5854,
      lon: 73.7125,
      status: "approved",
      created_at: "2024-01-15T10:30:00Z",
      scheme_suggestions: "MGNREGA - Suitable for large area development; PM-KISAN - Farmer support scheme",
      ndvi_flag: false
    },
    {
      id: "demo-2", 
      name: "Priya Sharma",
      village: "Kotra",
      district: "Udaipur",
      area_ha: 1.2,
      lat: 24.6040,
      lon: 73.7580,
      status: "pending",
      created_at: "2024-01-16T14:20:00Z",
      scheme_suggestions: "Small Farmer Scheme - For small holdings",
      ndvi_flag: true
    },
    {
      id: "demo-3",
      name: "Mohan Singh",
      village: "Bhilwara",
      district: "Bhilwara", 
      area_ha: 3.8,
      lat: 25.3407,
      lon: 74.6306,
      status: "approved",
      created_at: "2024-01-17T09:15:00Z",
      scheme_suggestions: "MGNREGA - Suitable for large area development; Tribal Welfare Scheme",
      ndvi_flag: false
    }
  ];

  // Calculate district statistics
  const districtStats = claims.reduce((acc, claim) => {
    if (!acc[claim.district]) {
      acc[claim.district] = { total: 0, approved: 0, pending: 0, rejected: 0 };
    }
    acc[claim.district].total += 1;
    acc[claim.district][claim.status] += 1;
    return acc;
  }, {} as Record<string, any>);

  const districtLeaderboard = Object.entries(districtStats)
    .map(([district, stats]) => ({
      district,
      ...stats,
      approvalRate: stats.total > 0 ? ((stats.approved / stats.total) * 100) : 0
    }))
    .sort((a, b) => b.approvalRate - a.approvalRate);

  // Overall progress
  const totalClaims = claims.length;
  const approvedClaims = claims.filter(c => c.status === 'approved').length;
  const overallProgress = totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0;


  // Decision Support System logic
  const getDSSLogic = (claim: Claim) => {
    const logic = [];
    if (claim.area_ha > 2) logic.push("Area > 2 ha → MGNREGA eligible");
    if (claim.scheme_suggestions.toLowerCase().includes('farmer')) logic.push("Contains 'farmer' → PM-KISAN suggested");
    if (claim.area_ha < 1) logic.push("Area < 1 ha → Small Farmer Scheme");
    if (claim.scheme_suggestions.toLowerCase().includes('tribal')) logic.push("Tribal keywords → Welfare scheme");
    
    return logic.length > 0 ? logic : ["Standard forest rights processing"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading forest rights data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-primary hover:text-primary/80">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-lg font-semibold">Forest Rights Atlas</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Risk Overlay</span>
              <Switch
                checked={showRiskOverlay}
                onCheckedChange={setShowRiskOverlay}
              />
            </div>
            <Link to="/upload">
              <Button className="btn-accent">
                Add Claim
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
              className="w-80 bg-card border-r overflow-y-auto z-20"
            >
              <div className="p-6 space-y-6">
                {/* Overall Progress */}
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Overall Progress
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Claims Approved</span>
                      <span>{approvedClaims}/{totalClaims}</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {overallProgress.toFixed(1)}% approval rate
                    </p>
                  </div>
                </Card>

                {/* District Leaderboard */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-accent" />
                    District Leaderboard
                  </h3>
                  <div className="space-y-3">
                    {districtLeaderboard.slice(0, 5).map((item, index) => (
                      <motion.div
                        key={item.district}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedDistrict(item.district)}
                      >
                        <div>
                          <p className="font-medium text-sm">{item.district}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.total} claims
                          </p>
                        </div>
                        <Badge variant={item.approvalRate > 70 ? "default" : "secondary"}>
                          {item.approvalRate.toFixed(0)}%
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Status Summary */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-success" />
                    Status Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm">Approved</span>
                      </div>
                      <Badge variant="outline" className="text-success border-success">
                        {claims.filter(c => c.status === 'approved').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="text-sm">Pending</span>
                      </div>
                      <Badge variant="outline" className="text-warning border-warning">
                        {claims.filter(c => c.status === 'pending').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <X className="w-4 h-4 text-destructive" />
                        <span className="text-sm">Rejected</span>
                      </div>
                      <Badge variant="outline" className="text-destructive border-destructive">
                        {claims.filter(c => c.status === 'rejected').length}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Risk Overlay Toggle (Mobile) */}
                <Card className="p-4 sm:hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span className="text-sm">NDVI Risk Overlay</span>
                    </div>
                    <Switch
                      checked={showRiskOverlay}
                      onCheckedChange={setShowRiskOverlay}
                    />
                  </div>
                </Card>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Map */}
        <div className="flex-1 relative">
          <SimpleMap claims={claims} showRiskOverlay={showRiskOverlay} />

          {/* Map Overlay Info */}
          {showRiskOverlay && (
            <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg z-10">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span>NDVI Risk Flagged Areas</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Claim Popup Component
const ClaimPopup = ({ claim }: { claim: Claim }) => {
  const dssLogic = getDSSLogic(claim);

  return (
    <div className="p-2 min-w-[250px]">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-base">{claim.name}</h3>
          <p className="text-sm text-muted-foreground">
            {claim.village}, {claim.district}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Area:</span>
            <span className="ml-1 font-medium">{claim.area_ha} ha</span>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <Badge 
              variant={claim.status === 'approved' ? 'default' : 'secondary'}
              className="ml-1 text-xs"
            >
              {claim.status}
            </Badge>
          </div>
        </div>

        {claim.ndvi_flag && (
          <div className="flex items-center space-x-1 text-xs text-destructive">
            <AlertTriangle className="w-3 h-3" />
            <span>NDVI Risk Flagged</span>
          </div>
        )}

        <div>
          <p className="text-xs font-medium mb-1">Scheme Suggestions:</p>
          <p className="text-xs text-muted-foreground">{claim.scheme_suggestions}</p>
        </div>

        <div>
          <p className="text-xs font-medium mb-1">DSS Logic Used:</p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {dssLogic.map((logic, index) => (
              <li key={index}>• {logic}</li>
            ))}
          </ul>
        </div>

        <div className="flex space-x-2 pt-2">
          <Link to={`/claim/${claim.id}`}>
            <Button size="sm" variant="outline" className="text-xs">
              <QrCode className="w-3 h-3 mr-1" />
              QR Code
            </Button>
          </Link>
          <Link to={`/claim/${claim.id}`}>
            <Button size="sm" variant="outline" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Helper function for DSS logic (reused from popup)
const getDSSLogic = (claim: Claim) => {
  const logic = [];
  if (claim.area_ha > 2) logic.push("Area > 2 ha → MGNREGA eligible");
  if (claim.scheme_suggestions.toLowerCase().includes('farmer')) logic.push("Contains 'farmer' → PM-KISAN suggested");
  if (claim.area_ha < 1) logic.push("Area < 1 ha → Small Farmer Scheme");
  if (claim.scheme_suggestions.toLowerCase().includes('tribal')) logic.push("Tribal keywords → Welfare scheme");
  
  return logic.length > 0 ? logic : ["Standard forest rights processing"];
};

export default MapDashboard;