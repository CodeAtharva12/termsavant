
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, Check, Download, FileText, Save, X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { validateTerms, DocumentField } from '@/utils/aiProcessing';

// Define document type
interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  date: string;
  validationScore: number;
  content: DocumentField[];
}

// Mock document data
const mockDocument = {
  id: 'doc-001',
  name: 'Series A Term Sheet',
  type: 'PDF',
  status: 'needs review',
  date: '2023-08-15',
  validationScore: 72,
  content: [
    { id: 'field-1', label: 'Company Name', value: 'Acme Corporation', valid: true },
    { id: 'field-2', label: 'Investment Amount', value: '$5,000,000', valid: true },
    { id: 'field-3', label: 'Pre-Money Valuation', value: '$20,000,000', valid: true },
    { id: 'field-4', label: 'Post-Money Valuation', value: '$25,000,000', valid: true },
    { id: 'field-5', label: 'Investor Name', value: 'Venture Capital LLC', valid: true },
    { id: 'field-6', label: 'Board Seats', value: '1', valid: true },
    { id: 'field-7', label: 'Liquidation Preference', value: '1x', valid: true },
    { id: 'field-8', label: 'Participation', value: 'None', valid: true },
    { id: 'field-9', label: 'Anti-Dilution', value: 'Weighted Average', valid: false },
    { id: 'field-10', label: 'Vesting Schedule', value: '4 Years with 1 Year Cliff', valid: true },
    { id: 'field-11', label: 'Option Pool', value: '10% Post-Money', valid: false },
    { id: 'field-12', label: 'Closing Date', value: '2023-09-30', valid: true },
  ]
};

const EditDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Try to get document from localStorage (from AI processing)
    const storedDoc = localStorage.getItem('processedDocument');
    
    // Simulate API fetch
    setTimeout(() => {
      if (storedDoc) {
        const parsedDoc = JSON.parse(storedDoc);
        setDocument(parsedDoc);
        
        // Initialize edited values from stored document
        const initialValues: Record<string, string> = {};
        parsedDoc.content.forEach((field: DocumentField) => {
          initialValues[field.id] = field.value;
        });
        setEditedValues(initialValues);
      } else {
        // Use mock data if no stored document
        setDocument(mockDocument);
        // Initialize edited values
        const initialValues: Record<string, string> = {};
        mockDocument.content.forEach(field => {
          initialValues[field.id] = field.value;
        });
        setEditedValues(initialValues);
      }
    }, 800);
  }, [id]);

  const handleInputChange = (fieldId: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleValidate = async () => {
    if (!document) return;
    
    setIsValidating(true);
    
    try {
      // Create updated document fields with the edited values
      const updatedFields = document.content.map(field => ({
        ...field,
        value: editedValues[field.id] || field.value
      }));
      
      // Use AI to validate the fields
      const validatedFields = await validateTerms(updatedFields);
      
      // Calculate new validation score
      const validCount = validatedFields.filter(field => field.valid).length;
      const newScore = Math.round((validCount / validatedFields.length) * 100);
      
      // Update the document with validated fields
      setDocument({
        ...document,
        content: validatedFields,
        validationScore: newScore,
        status: newScore >= 90 ? 'validated' : 'needs review'
      });
      
      toast({
        title: "Validation complete",
        description: `Document validation score: ${newScore}%`,
      });
      
    } catch (error) {
      console.error("Error validating document:", error);
      toast({
        title: "Validation failed",
        description: "There was an error validating the document.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Validate fields first
    await handleValidate();
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    
    // Update localStorage for demo purposes
    if (document) {
      localStorage.setItem('processedDocument', JSON.stringify(document));
    }
    
    toast({
      title: "Changes saved",
      description: "Your document has been updated successfully.",
    });
  };

  const handleDownload = (format: string) => {
    toast({
      title: `Downloading ${format}`,
      description: "Your document is being prepared for download.",
    });
    
    // Simulate download
    setTimeout(() => {
      toast({
        title: "Download ready",
        description: `${document?.name}.${format.toLowerCase()} has been downloaded.`,
      });
    }, 1500);
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="h-16 w-16 animate-pulse-subtle rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const invalidFields = document.content.filter(field => !field.valid);
  const validationPercentage = document.validationScore;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => navigate('/dashboard/documents')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-3xl font-bold">{document.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Term Sheet Content</CardTitle>
            <CardDescription>
              Review and edit the extracted term sheet data below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {document.content.map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={field.id}
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      {field.label}
                      {field.valid ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-amber-600" />
                      )}
                    </label>
                  </div>
                  <Input
                    id={field.id}
                    value={editedValues[field.id] || field.value}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className={field.valid ? "" : "border-amber-300 focus:border-amber-300"}
                  />
                  {!field.valid && (
                    <p className="text-xs text-amber-600">
                      This field needs review. Please verify the information.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button 
              onClick={handleValidate} 
              variant="outline"
              disabled={isValidating || isSaving}
            >
              {isValidating ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                  Validating...
                </>
              ) : (
                <>Validate with AI</>
              )}
            </Button>
            
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isValidating}
            >
              {isSaving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">File Type</p>
                <p className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {document.type}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Upload Date</p>
                <p>{new Date(document.date).toLocaleDateString()}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Validation Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${validationPercentage}%` }}
                    ></div>
                  </div>
                  <span 
                    className={validationPercentage > 90 ? 'text-green-600 font-medium' : 
                              validationPercentage > 75 ? 'text-amber-600 font-medium' : 
                              'text-red-600 font-medium'}
                  >
                    {validationPercentage}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {invalidFields.length} {invalidFields.length === 1 ? 'field' : 'fields'} need review
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleDownload('PDF')}>
                    Download as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('DOCX')}>
                    Download as DOCX
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('JSON')}>
                    Download as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="secondary" className="w-full" onClick={() => navigate('/dashboard/documents')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditDocument;
