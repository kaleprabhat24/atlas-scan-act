import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Database, 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  AlertTriangle,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  additional_info?: string;
}

const AdminDebug = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendUrl, setBackendUrl] = useState(BACKEND_URL);
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const { toast } = useToast();

  // Simple authentication check
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPasscode = urlParams.get('passcode');
    
    if (urlPasscode === 'admin123' || passcode === 'admin123') {
      setIsAuthenticated(true);
      loadClaims();
    }
  }, [passcode]);

  const loadClaims = async () => {
    setLoading(true);
    try {
      await testBackendConnection();
      
      const response = await fetch(`${backendUrl}/claims`);
      if (response.ok) {
        const apiClaims = await response.json();
        setClaims(apiClaims);
        setConnectionStatus('connected');
        toast({
          title: "Backend Connected",
          description: "Successfully loaded claims from backend.",
        });
      } else {
        throw new Error('API returned error');
      }
    } catch (error) {
      console.error('Failed to load from backend:', error);
      setConnectionStatus('failed');
      
      // Load from cache as fallback
      const cached = JSON.parse(localStorage.getItem('fra_claims') || '[]');
      if (cached.length > 0) {
        setClaims(cached);
        toast({
          title: "Using Cached Data",
          description: "Backend unavailable. Showing cached claims.",
          variant: "destructive",
        });
      } else {
        // Generate demo data
        const demoData = generateDemoData();
        setClaims(demoData);
        localStorage.setItem('fra_claims', JSON.stringify(demoData));
        toast({
          title: "Demo Mode",
          description: "Backend not configured. Using demo data.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${backendUrl}/health`, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  };

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
      ndvi_flag: false,
      additional_info: "Traditional forest dweller with valid documentation"
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
      ndvi_flag: true,
      additional_info: "New application requires field verification"
    },
    {
      id: "demo-3",
      name: "Mohan Singh",
      village: "Bhilwara",
      district: "Bhilwara",
      area_ha: 3.8,
      lat: 25.3407,
      lon: 74.6306,
      status: "rejected",
      created_at: "2024-01-17T09:15:00Z", 
      scheme_suggestions: "MGNREGA - Suitable for large area development; Tribal Welfare Scheme",
      ndvi_flag: false,
      additional_info: "Insufficient documentation provided"
    }
  ];

  const updateClaimStatus = async (claimId: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    try {
      // Try to update via API
      const response = await fetch(`${backendUrl}/claim/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('API update failed');
      }

      // Update local state
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim.id === claimId ? { ...claim, status: newStatus } : claim
        )
      );

      // Update cache
      const updatedClaims = claims.map(claim => 
        claim.id === claimId ? { ...claim, status: newStatus } : claim
      );
      localStorage.setItem('fra_claims', JSON.stringify(updatedClaims.slice(0, config.CACHE_LIMIT)));

      toast({
        title: "Status Updated",
        description: `Claim ${claimId} marked as ${newStatus}.`,
      });

    } catch (error) {
      console.error('Status update failed:', error);
      toast({
        title: "Update Failed",
        description: "Could not update claim status. Try again later.",
        variant: "destructive",
      });
    }
  };

  const deleteClaim = async (claimId: string) => {
    try {
      // Try to delete via API
      const response = await fetch(`${backendUrl}/claim/${claimId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('API delete failed');
      }

      // Update local state
      setClaims(prevClaims => prevClaims.filter(claim => claim.id !== claimId));

      // Update cache
      const updatedClaims = claims.filter(claim => claim.id !== claimId);
      localStorage.setItem('fra_claims', JSON.stringify(updatedClaims));

      toast({
        title: "Claim Deleted",
        description: `Claim ${claimId} has been removed.`,
      });

    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed", 
        description: "Could not delete claim. Try again later.",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(claims, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `fra_claims_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Claims data downloaded as JSON file.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-success text-success-foreground">Connected</Badge>;
      case 'failed':
        return <Badge variant="destructive">Disconnected</Badge>;
      default:
        return <Badge variant="secondary">Testing...</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="p-6 space-y-4">
            <div className="text-center">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold">Admin Access</h2>
              <p className="text-muted-foreground">Enter passcode to access admin panel</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passcode">Passcode</Label>
              <Input
                id="passcode"
                type="password"
                placeholder="Enter admin passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && setIsAuthenticated(passcode === 'admin123')}
              />
            </div>
            
            <Button 
              className="w-full"
              onClick={() => setIsAuthenticated(passcode === 'admin123')}
            >
              Access Admin Panel
            </Button>
            
            <div className="text-center">
              <Link to="/" className="text-sm text-primary hover:underline">
                Back to Home
              </Link>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Demo passcode: admin123
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-primary">
              <ArrowLeft className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <h1 className="text-xl font-semibold flex items-center">
              <Database className="w-6 h-6 mr-2" />
              Admin Dashboard
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {getConnectionStatusBadge()}
            <Button variant="outline" size="sm" onClick={loadClaims} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card className="card-elevated">
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configuration
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backend-url">Backend URL</Label>
                    <Textarea
                      id="backend-url"
                      value={backendUrl}
                      onChange={(e) => setBackendUrl(e.target.value)}
                      placeholder="Enter Google Apps Script Web App URL"
                      className="h-20 text-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Update src/config.js to persist changes
                    </p>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => testBackendConnection()}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <h3 className="font-medium">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={exportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Link to="/upload" className="block">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Claim
                      </Button>
                    </Link>
                    <Link to="/map" className="block">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Eye className="w-4 h-4 mr-2" />
                        View Map
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Statistics */}
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-3">Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Claims:</span>
                      <span className="font-semibold">{claims.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved:</span>
                      <span className="font-semibold text-success">
                        {claims.filter(c => c.status === 'approved').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-semibold text-warning">
                        {claims.filter(c => c.status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected:</span>
                      <span className="font-semibold text-destructive">
                        {claims.filter(c => c.status === 'rejected').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Claims Data Table */}
          <div className="lg:col-span-3">
            <Card className="card-elevated">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Claims Management</h2>
                  <div className="text-sm text-muted-foreground">
                    {claims.length} total claims
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading claims data...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Area (ha)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>NDVI Risk</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {claims.map((claim) => (
                          <TableRow key={claim.id}>
                            <TableCell className="font-mono text-xs">
                              {claim.id}
                            </TableCell>
                            <TableCell className="font-medium">
                              {claim.name}
                            </TableCell>
                            <TableCell className="text-sm">
                              {claim.village}, {claim.district}
                            </TableCell>
                            <TableCell>{claim.area_ha}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(claim.status)}
                                <Select
                                  value={claim.status}
                                  onValueChange={(value: 'approved' | 'rejected' | 'pending') => 
                                    updateClaimStatus(claim.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-24 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            <TableCell>
                              {claim.ndvi_flag ? (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Risk
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Clear</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Link to={`/claim/${claim.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </Link>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setEditingClaim(claim)}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Claim</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <p className="text-sm text-muted-foreground">
                                        Claim ID: {claim.id}
                                      </p>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Name</Label>
                                          <Input value={claim.name} readOnly />
                                        </div>
                                        <div>
                                          <Label>Village</Label>
                                          <Input value={claim.village} readOnly />
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Scheme Suggestions</Label>
                                        <Textarea 
                                          value={claim.scheme_suggestions}
                                          readOnly
                                          className="h-16"
                                        />
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        Full editing requires backend integration.
                                      </p>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Delete claim ${claim.id}?`)) {
                                      deleteClaim(claim.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {claims.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Claims Found</h3>
                    <p className="text-muted-foreground mb-4">
                      No forest rights claims in the system yet.
                    </p>
                    <Link to="/upload">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Claim
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;