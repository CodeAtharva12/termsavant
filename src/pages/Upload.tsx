
import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Upload as UploadIcon, File, FileText, FileSpreadsheet, Image, Mail, MessageSquare } from 'lucide-react';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    // Simulate API call delay
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      toast({
        title: "Upload successful",
        description: "Your document is being processed.",
      });
      
      setTimeout(() => {
        setIsUploading(false);
        navigate('/dashboard/documents');
      }, 1000);
    }, 4000);
  };

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
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
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
                <span>Uploading...</span>
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
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Upload;
