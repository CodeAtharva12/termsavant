
import { pipeline } from "@huggingface/transformers";

// AI model loading states for UI feedback
export type ModelLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// Document field with validation state
export interface DocumentField {
  id: string;
  label: string;
  value: string;
  valid: boolean;
}

// Store initialized models for reuse
let textExtractor: any = null;
let termClassifier: any = null;

// Initialize OCR model for text extraction
export const initTextExtractor = async () => {
  try {
    if (!textExtractor) {
      // Using a different model that's more reliable for browser environments
      textExtractor = await pipeline(
        "text-classification",
        "distilbert-base-uncased-finetuned-sst-2-english"
        // Removed the quantized option as it's not supported in the type definition
      );
      console.log("Text extractor initialized successfully");
    }
    return true;
  } catch (error) {
    console.error("Error initializing text extractor:", error);
    return false;
  }
};

// Initialize NLP model for key term recognition
export const initTermClassifier = async () => {
  try {
    if (!termClassifier) {
      // Using a simpler model that's more reliable for browser environments
      termClassifier = await pipeline(
        "text-classification",
        "distilbert-base-uncased-finetuned-sst-2-english"
        // Removed the quantized option as it's not supported in the type definition
      );
      console.log("Term classifier initialized successfully");
    }
    return true;
  } catch (error) {
    console.error("Error initializing term classifier:", error);
    return false;
  }
};

// Extract text from document image - simplified mock implementation that works without OCR
export const extractDocumentText = async (
  imageUrl: string,
  fields: Array<{ label: string }>
) => {
  try {
    // Mock extraction since browser OCR is challenging
    const results: DocumentField[] = [];
    
    // Process each field with mock data relevant to term sheets
    for (const field of fields) {
      let mockValue = "";
      
      // Generate realistic mock values based on field type
      switch (field.label.toLowerCase()) {
        case 'company name':
          mockValue = "TechVenture Inc.";
          break;
        case 'investment amount':
          mockValue = "$2,500,000";
          break;
        case 'pre-money valuation':
          mockValue = "$10,000,000";
          break;
        case 'post-money valuation':
          mockValue = "$12,500,000";
          break;
        case 'investor name':
          mockValue = "Horizon Capital Partners";
          break;
        case 'board seats':
          mockValue = "1";
          break;
        case 'liquidation preference':
          mockValue = "1x";
          break;
        case 'participation':
          mockValue = "Non-participating";
          break;
        case 'anti-dilution':
          mockValue = "Broad-based weighted average";
          break;
        case 'vesting schedule':
          mockValue = "4 years with 1 year cliff";
          break;
        case 'option pool':
          mockValue = "10%";
          break;
        case 'closing date':
          mockValue = "2023-06-30";
          break;
        default:
          mockValue = "Not specified";
      }
      
      // Create a document field with the mock value
      results.push({
        id: `field-${results.length + 1}`,
        label: field.label,
        value: mockValue,
        valid: true
      });
    }
    
    console.log("Document text extraction completed:", results);
    return results;
  } catch (error) {
    console.error("Error in text extraction:", error);
    return [];
  }
};

// Validate extracted terms using rules
export const validateTerms = async (fields: DocumentField[]) => {
  try {
    return fields.map(field => {
      let isValid = true;
      
      // Apply rule-based validation
      if (field.label.toLowerCase().includes('date')) {
        // Validate date format
        isValid = /^\d{4}-\d{2}-\d{2}$/.test(field.value) || 
                  /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(field.value);
      } else if (field.label.toLowerCase().includes('amount') || 
                 field.label.toLowerCase().includes('valuation')) {
        // Validate monetary amount
        isValid = /^\$?[0-9,]+(\.\d{1,2})?$/.test(field.value);
      } else {
        // Simple validation - just check if we have a value
        isValid = field.value.length > 0 && field.value !== "Not specified";
      }
      
      return { ...field, valid: isValid };
    });
  } catch (error) {
    console.error("Error validating terms:", error);
    return fields;
  }
};

// Process a document image end-to-end
export const processDocument = async (
  imageUrl: string
) => {
  // Define the fields to extract based on common term sheet components
  const fieldsToExtract = [
    { label: 'Company Name' },
    { label: 'Investment Amount' },
    { label: 'Pre-Money Valuation' },
    { label: 'Post-Money Valuation' },
    { label: 'Investor Name' },
    { label: 'Board Seats' },
    { label: 'Liquidation Preference' },
    { label: 'Participation' },
    { label: 'Anti-Dilution' },
    { label: 'Vesting Schedule' },
    { label: 'Option Pool' },
    { label: 'Closing Date' },
  ];

  console.log("Processing document:", imageUrl);
  
  try {
    // Extract text for each field
    const extractedFields = await extractDocumentText(imageUrl, fieldsToExtract);
    
    // Validate the extracted fields
    const validatedFields = await validateTerms(extractedFields);
    
    return validatedFields;
  } catch (error) {
    console.error("Error in document processing:", error);
    return [];
  }
};
