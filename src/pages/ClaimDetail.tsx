import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  MapPin, 
  User, 
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Printer,
  Share2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BACKEND_URL } from '../config';

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

const ClaimDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadClaim();
  }, [id]);

  const loadClaim = async () => {
    if (!id) return;

    try {
      // Try to load from API
      const response = await fetch(`${BACKEND_URL}/claim/${id}`);
      if (response.ok) {
        const claimData = await response.json();
        setClaim(claimData);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.error('Failed to load from API, checking cache:', error);
      
      // Fallback to cached data
      const cached = JSON.parse(localStorage.getItem('fra_claims') || '[]');
      const foundClaim = cached.find((c: Claim) => c.id === id);
      
      if (foundClaim) {
        setClaim(foundClaim);
      } else {
        // Demo data fallback
        setClaim(getDemoClaim(id));
        toast({
          title: "Demo Mode",
          description: "Showing sample claim data.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getDemoClaim = (id: string): Claim => ({
    id: id || "demo-1",
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
    additional_info: "Traditional forest dweller claim for cultivation and habitation rights on ancestral land."
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-destructive" />;
      default: return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success text-success-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground'; 
      default: return 'bg-warning text-warning-foreground';
    }
  };

  const handleDownloadSlip = () => {
    window.print();
    toast({
      title: "Printing Claim Slip",
      description: "Use your browser's print dialog to save or print the claim slip.",
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Forest Rights Claim - ${claim?.name}`,
          text: `View forest rights claim for ${claim?.name} in ${claim?.village}, ${claim?.district}`,
          url: url
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link Copied",
      description: "Claim link copied to clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold">Claim Not Found</h2>
          <p className="text-muted-foreground">The requested forest rights claim could not be found.</p>
          <Link to="/map">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const qrValue = window.location.href;
  const createdDate = new Date(claim.created_at);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/map" className="flex items-center space-x-2 text-primary">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Map</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadSlip}>
              <Download className="w-4 h-4 mr-2" />
              Download Slip
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Claim Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="card-elevated">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{claim.name}</h1>
                  <p className="text-lg text-muted-foreground">
                    {claim.village}, {claim.district}
                  </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  {getStatusIcon(claim.status)}
                  <Badge className={`${getStatusColor(claim.status)} text-sm px-3 py-1`}>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {claim.ndvi_flag && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2 text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">NDVI Risk Flag</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This claim has been flagged for potential environmental risk and requires additional review.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Claim ID</p>
                  <p className="font-mono text-sm">{claim.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Area</p>
                  <p className="font-semibold">{claim.area_ha} hectares</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-semibold">{createdDate.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Claim Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="card-elevated h-fit">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" />
                  Claim Information
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Claimant</p>
                      <p className="font-semibold">{claim.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{claim.village}, {claim.district}</p>
                      {claim.lat && claim.lon && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {claim.lat.toFixed(6)}, {claim.lon.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Submission Date</p>
                      <p className="font-semibold">{createdDate.toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {createdDate.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {claim.additional_info && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Additional Information</p>
                        <p className="text-sm leading-relaxed bg-muted/50 rounded-lg p-3">
                          {claim.additional_info}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Timeline & Status */}
            <Card className="card-elevated mt-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Processing Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Claim Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {claim.status !== 'pending' && (
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        claim.status === 'approved' ? 'bg-success' : 'bg-destructive'
                      }`}>
                        {claim.status === 'approved' ? 
                          <CheckCircle className="w-4 h-4 text-success-foreground" /> :
                          <XCircle className="w-4 h-4 text-destructive-foreground" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">
                          Claim {claim.status === 'approved' ? 'Approved' : 'Rejected'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status updated by forest department
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* QR Code & Schemes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* QR Code */}
            <Card className="card-elevated">
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">QR Code Access</h3>
                <div className="inline-flex p-4 bg-white rounded-lg shadow-inner">
                  <QRCodeSVG 
                    value={qrValue}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Scan QR code to view this claim on any device
                </p>
                <Button 
                  variant="outline" 
                  className="mt-3"
                  onClick={() => copyToClipboard(qrValue)}
                >
                  Copy Link
                </Button>
              </div>
            </Card>

            {/* Scheme Suggestions */}
            <Card className="card-elevated">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-accent" />
                  Scheme Recommendations
                </h3>
                
                <div className="space-y-3">
                  {claim.scheme_suggestions.split(';').map((suggestion, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium text-primary">
                        {suggestion.split(' - ')[0]}
                      </p>
                      {suggestion.split(' - ')[1] && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {suggestion.split(' - ')[1]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />
                
                <div>
                  <h4 className="font-medium mb-2 text-sm">Decision Support Logic</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {claim.area_ha > 2 && <li>• Area &gt; 2 ha → MGNREGA eligible</li>}
                    {claim.scheme_suggestions.toLowerCase().includes('farmer') && <li>• Contains 'farmer' → PM-KISAN suggested</li>}
                    {claim.area_ha < 1 && <li>• Area &lt; 1 ha → Small Farmer Scheme</li>}
                    {claim.scheme_suggestions.toLowerCase().includes('tribal') && <li>• Tribal keywords → Welfare scheme</li>}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Print Actions */}
            <Card className="card-elevated print:hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleDownloadSlip}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print Claim Slip
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Claim
                  </Button>
                  <Link to="/map" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <MapPin className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Print Styles - moved to index.css for better compatibility */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            .print\\:hidden {
              display: none !important;
            }
            
            body {
              font-size: 12px;
            }
            
            .container {
              max-width: none;
              padding: 0;
            }
            
            .card-elevated {
              box-shadow: none;
              border: 1px solid #e5e7eb;
            }
          }
        `
      }} />
    </div>
  );
};

export default ClaimDetail;