import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Upload as UploadIcon, File, FileText, FileSpreadsheet, Image, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { initTextExtractor, initTermClassifier, processDocument, ModelLoadingState } from '@/utils/aiProcessing';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrModelState, setOcrModelState] = useState<ModelLoadingState>('idle');
  const [nlpModelState, setNlpModelState] = useState<ModelLoadingState>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fileTypes = [
    { icon: FileText, label: 'DOCX', extensions: ['.docx', '.doc'] },
    { icon: File, label: 'PDF', extensions: ['.pdf'] },
    { icon: FileSpreadsheet, label: 'Excel', extensions: ['.xlsx', '.xls', '.csv'] },
    { icon: Image, label: 'Images', extensions: ['.jpg', '.jpeg', '.png'] },
    { icon: Mail, label: 'Email', extensions: ['.eml', '.msg'] },
    { icon: MessageSquare, label: 'Messages', extensions: ['.txt'] },
  ];

  const getFileIcon = (fileName: string) => {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const fileType = fileTypes.find(type => type.extensions.includes(extension));
    return fileType ? fileType.icon : File;
  };

  const loadModels = async () => {
    try {
      setOcrModelState('loading');
      toast({ title: "Loading OCR model", description: "Please wait while the model loads..." });
      const ocrLoaded = await initTextExtractor();
      setOcrModelState(ocrLoaded ? 'loaded' : 'error');
      
      setNlpModelState('loading');
      toast({ title: "Loading NLP model", description: "Please wait while the model loads..." });
      const nlpLoaded = await initTermClassifier();
      setNlpModelState(nlpLoaded ? 'loaded' : 'error');

      if (ocrLoaded && nlpLoaded) {
        toast({
          title: "AI Models Loaded",
          description: "The document processing models are ready to use.",
        });
      } else {
        toast({
          title: "AI Models Loading Issue",
          description: "Some models failed to load. The app will use offline processing instead.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error loading AI models:", error);
      toast({
        title: "AI Models Loading Error",
        description: "Failed to load AI models. The app will use offline processing instead.",
        variant: "destructive"
      });
      setOcrModelState('error');
      setNlpModelState('error');
    }
  };

  React.useEffect(() => {
    loadModels();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      if (droppedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(droppedFile);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    try {
      let documentFields = null;
      
      if (imagePreview) {
        toast({
          title: "Processing document",
          description: "Analyzing the document content...",
        });
        
        documentFields = await processDocument(imagePreview);
        
        localStorage.setItem('processedDocument', JSON.stringify({
          id: `doc-${Date.now()}`,
          name: file.name.split('.')[0],
          type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          status: 'needs review',
          date: new Date().toISOString().split('T')[0],
          validationScore: documentFields.filter(field => field.valid).length / documentFields.length * 100,
          content: documentFields
        }));
      }

      clearInterval(interval);
      setUploadProgress(100);
      
      toast({
        title: "Upload successful",
        description: documentFields 
          ? "Your document has been processed and is ready for review." 
          : "Your document has been uploaded.",
      });
      
      setTimeout(() => {
        setIsUploading(false);
        navigate('/dashboard/documents');
      }, 1000);
      
    } catch (error) {
      clearInterval(interval);
      console.error("Error processing document:", error);
      
      toast({
        title: "Processing error",
        description: "There was an error processing your document. Please try again.",
        variant: "destructive",
      });
      
      setIsUploading(false);
    }
  };

  const isProcessingDisabled = isUploading || !file;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Upload Document</h1>
      <p className="text-muted-foreground">
        Upload your term sheet document in any supported format.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Term Sheet</CardTitle>
          <CardDescription>
            Supported formats: DOCX, PDF, Excel, Images, Emails, and Text
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                ocrModelState === 'idle' ? 'bg-gray-300' :
                ocrModelState === 'loading' ? 'bg-blue-500 animate-pulse' :
                ocrModelState === 'loaded' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm">
                OCR Model: {
                  ocrModelState === 'idle' ? 'Not Loaded' :
                  ocrModelState === 'loading' ? 'Loading...' :
                  ocrModelState === 'loaded' ? 'Ready' : 'Using offline mode'
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                nlpModelState === 'idle' ? 'bg-gray-300' :
                nlpModelState === 'loading' ? 'bg-blue-500 animate-pulse' :
                nlpModelState === 'loaded' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm">
                NLP Model: {
                  nlpModelState === 'idle' ? 'Not Loaded' :
                  nlpModelState === 'loading' ? 'Loading...' :
                  nlpModelState === 'loaded' ? 'Ready' : 'Using offline mode'
                }
              </span>
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center ${
              file ? 'bg-primary/5 border-primary/30' : 'border-border hover:border-primary/30 hover:bg-primary/5'
            } transition-colors cursor-pointer`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {file ? (
              <div className="text-center">
                {React.createElement(getFileIcon(file.name), {
                  className: "h-10 w-10 mb-4 text-primary mx-auto"
                })}
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {imagePreview && (
                  <div className="mt-4 max-w-xs mx-auto">
                    <img 
                      src={imagePreview} 
                      alt="Document preview" 
                      className="rounded-md border border-border" 
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Image preview (will be processed with AI)
                    </p>
                  </div>
                )}
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setImagePreview(null);
                  }}
                >
                  Choose a different file
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <UploadIcon className="h-10 w-10 text-muted-foreground mb-4 mx-auto" />
                <p className="font-medium">Drag and drop your file here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse files
                </p>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".docx,.doc,.pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.eml,.msg,.txt"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {fileTypes.map((type) => (
              <div key={type.label} className="flex flex-col items-center space-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <type.icon className="h-5 w-5 text-secondary-foreground" />
                </div>
                <span className="text-xs">{type.label}</span>
              </div>
            ))}
          </div>
          
          {isUploading && (
            <div className="mt-6">
              <div className="text-sm mb-1 flex justify-between">
                <span>Uploading and processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden water-fill-animation active">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isProcessingDisabled}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <UploadIcon className="mr-2 h-4 w-4" />
                {file?.type.startsWith('image/') ? 'Process Document' : 'Upload Document'}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Upload;
