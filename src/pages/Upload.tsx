import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload as UploadIcon, FileImage, FileText, Mic, MicOff, Loader2, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Tesseract from 'tesseract.js';
import { BACKEND_URL } from '../config';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    village: "",
    district: "",
    area_ha: "",
    lat: "",
    lon: "",
    additional_info: ""
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    await processFile(uploadedFile);
  };

  // Process file with OCR (PDF or Image)
  const processFile = async (file: File) => {
    setIsProcessing(true);
    setOcrProgress(0);

    try {
      let imageData: string | File = file;

      // If PDF, convert first page to canvas
      if (file.type === 'application/pdf') {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        
        const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ 
          canvasContext: context, 
          viewport,
          canvas: canvas 
        }).promise;
        imageData = canvas.toDataURL('image/png');
      }

      // Perform OCR with progress tracking
      const { data: { text } } = await Tesseract.recognize(
        imageData,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      setOcrText(text);
      parseOCRText(text);
      
      toast({
        title: "OCR Complete",
        description: "Document text extracted successfully. Please review the parsed data.",
      });
      
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "OCR Failed",
        description: "Could not extract text from document. Please enter data manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  // Parse OCR text to extract structured data
  const parseOCRText = (text: string) => {
    // Basic regex patterns for common fields (can be enhanced)
    const nameMatch = text.match(/name[:\s]+([A-Za-z\s]+)/i);
    const villageMatch = text.match(/village[:\s]+([A-Za-z\s]+)/i);
    const districtMatch = text.match(/district[:\s]+([A-Za-z\s]+)/i);
    const areaMatch = text.match(/area[:\s]*([\d.]+)/i);
    
    setFormData(prev => ({
      ...prev,
      name: nameMatch?.[1]?.trim() || prev.name,
      village: villageMatch?.[1]?.trim() || prev.village,
      district: districtMatch?.[1]?.trim() || prev.district,
      area_ha: areaMatch?.[1]?.trim() || prev.area_ha,
      additional_info: text
    }));
  };

  // Voice input using Web Speech API
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak your claim details now. Format: 'Name: John, Village: Ambeli, District: Udaipur, Area: 2.5 hectares'",
      });
    };

    recognition.onresult = (event: any) => {
      const speechText = event.results[0][0].transcript;
      parseVoiceInput(speechText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast({
        title: "Voice Recognition Error",
        description: "Could not process voice input. Please try again.",
        variant: "destructive",
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Parse voice input
  const parseVoiceInput = (text: string) => {
    console.log('Voice input:', text);
    
    // Parse structured voice input
    const nameMatch = text.match(/name[:\s]+([^,]+)/i);
    const villageMatch = text.match(/village[:\s]+([^,]+)/i);
    const districtMatch = text.match(/district[:\s]+([^,]+)/i);
    const areaMatch = text.match(/area[:\s]*([\d.]+)/i);
    
    setFormData(prev => ({
      ...prev,
      name: nameMatch?.[1]?.trim() || prev.name,
      village: villageMatch?.[1]?.trim() || prev.village,
      district: districtMatch?.[1]?.trim() || prev.district,
      area_ha: areaMatch?.[1]?.trim() || prev.area_ha,
      additional_info: text
    }));

    toast({
      title: "Voice Input Processed",
      description: "Please review and correct the extracted information.",
    });
  };

  // Submit form data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.village || !formData.district) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least name, village, and district.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      const claimData = {
        ...formData,
        area_ha: parseFloat(formData.area_ha) || 0,
        lat: parseFloat(formData.lat) || null,
        lon: parseFloat(formData.lon) || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        scheme_suggestions: generateSchemeSuggestions(formData),
        ndvi_flag: Math.random() > 0.7 // Random risk flag for demo
      };

      // POST to backend
      const response = await fetch(`${BACKEND_URL}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit claim');
      }

      const result = await response.json();
      
      // Cache locally
      const cached = JSON.parse(localStorage.getItem('fra_claims') || '[]');
      cached.unshift({ ...claimData, id: result.id || Date.now() });
      localStorage.setItem('fra_claims', JSON.stringify(cached.slice(0, 20)));

      toast({
        title: "Claim Submitted Successfully",
        description: "Your forest rights claim has been recorded.",
      });

      // Navigate to map after short delay
      setTimeout(() => {
        navigate('/map');
      }, 1500);

    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Submission Failed",
        description: "Could not submit claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate scheme suggestions based on data
  const generateSchemeSuggestions = (data: any) => {
    const suggestions = [];
    const area = parseFloat(data.area_ha) || 0;
    const text = `${data.name} ${data.additional_info}`.toLowerCase();

    if (area > 2) suggestions.push("MGNREGA - Suitable for large area development");
    if (text.includes('farmer') || text.includes('cultivation')) suggestions.push("PM-KISAN - Farmer support scheme");
    if (area < 1) suggestions.push("Small Farmer Scheme - For small holdings");
    if (text.includes('tribal') || text.includes('adivasi')) suggestions.push("Tribal Welfare Scheme");

    return suggestions.join('; ') || "General forest rights support";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-primary">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-xl font-semibold">Upload Forest Rights Claim</h1>
          <Link to="/map">
            <Button variant="outline" size="sm">View Map</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* File Upload & OCR Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="card-elevated">
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <UploadIcon className="w-6 h-6 mr-2 text-primary" />
                  Document Upload
                </h2>

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    file ? 'border-success bg-success/5' : 'border-border hover:border-primary bg-muted/20'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {file ? (
                    <div className="space-y-2">
                      <Check className="w-12 h-12 text-success mx-auto" />
                      <p className="font-medium text-success">File uploaded successfully</p>
                      <p className="text-sm text-muted-foreground">{file.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                        <FileImage className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-medium">Click to upload document</p>
                      <p className="text-sm text-muted-foreground">PDF or image files supported</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* OCR Progress */}
                {isProcessing && (
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Processing document...</span>
                      <span className="text-sm text-muted-foreground">{ocrProgress}%</span>
                    </div>
                    <Progress value={ocrProgress} className="h-2" />
                  </div>
                )}

                {/* Voice Input */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-3">Voice Input (Alternative)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Format: "Name: Ravi Kumar, Village: Ambeli, District: Udaipur, Area: 2.5 hectares"
                  </p>
                  <Button
                    type="button"
                    onClick={startVoiceInput}
                    disabled={isListening}
                    variant={isListening ? "destructive" : "outline"}
                    className="w-full"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Listening... Click to stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Start Voice Input
                      </>
                    )}
                  </Button>
                </div>

                {/* Raw OCR Text Display */}
                {ocrText && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-2">Extracted Text</h3>
                    <Textarea
                      value={ocrText}
                      readOnly
                      className="h-24 text-xs bg-muted"
                      placeholder="OCR extracted text will appear here..."
                    />
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="card-elevated">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-accent" />
                  Claim Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Claimant Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="village">Village *</Label>
                    <Input
                      id="village"
                      value={formData.village}
                      onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                      placeholder="Village name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                      placeholder="District name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="area_ha">Area (Hectares)</Label>
                    <Input
                      id="area_ha"
                      type="number"
                      step="0.01"
                      value={formData.area_ha}
                      onChange={(e) => setFormData(prev => ({ ...prev, area_ha: e.target.value }))}
                      placeholder="Land area in hectares"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lat">Latitude (Optional)</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                      placeholder="GPS latitude"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lon">Longitude (Optional)</Label>
                    <Input
                      id="lon"
                      type="number"
                      step="any"
                      value={formData.lon}
                      onChange={(e) => setFormData(prev => ({ ...prev, lon: e.target.value }))}
                      placeholder="GPS longitude"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="additional_info">Additional Information</Label>
                  <Textarea
                    id="additional_info"
                    value={formData.additional_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, additional_info: e.target.value }))}
                    placeholder="Any additional details about the claim..."
                    className="h-24"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-hero w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Claim...
                    </>
                  ) : (
                    'Submit Forest Rights Claim'
                  )}
                </Button>

                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Your claim will be processed and made available on the map for review by authorities.
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Upload;