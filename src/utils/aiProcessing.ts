
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
export const initTextExtractor = async (): Promise<boolean> => {
  try {
    if (!textExtractor) {
      textExtractor = await pipeline(
        "document-question-answering",
        "impira/layoutlm-document-qa",
        { device: "cpu" }
      );
    }
    return true;
  } catch (error) {
    console.error("Error initializing text extractor:", error);
    return false;
  }
};

// Initialize NLP model for key term recognition
export const initTermClassifier = async (): Promise<boolean> => {
  try {
    if (!termClassifier) {
      termClassifier = await pipeline(
        "text-classification",
        "distilbert-base-uncased-finetuned-sst-2-english",
        { device: "cpu" }
      );
    }
    return true;
  } catch (error) {
    console.error("Error initializing term classifier:", error);
    return false;
  }
};

// Extract text from document image
export const extractDocumentText = async (
  imageUrl: string,
  fields: Array<{ label: string }>
): Promise<DocumentField[]> => {
  if (!textExtractor) {
    await initTextExtractor();
  }

  try {
    const results: DocumentField[] = [];
    
    // Process each field with the model
    for (const field of fields) {
      // Formulate a question to extract this field from the document
      const question = `What is the ${field.label}?`;
      
      // Extract the answer using the model
      const result = await textExtractor(
        imageUrl,
        question,
        { topk: 1 }
      );
      
      // Create a document field with the extracted value
      results.push({
        id: `field-${results.length + 1}`,
        label: field.label,
        value: result?.answer || '',
        valid: Boolean(result?.answer)
      });
    }
    
    return results;
  } catch (error) {
    console.error("Error extracting text:", error);
    return [];
  }
};

// Validate extracted terms using rules and NLP
export const validateTerms = async (fields: DocumentField[]): Promise<DocumentField[]> => {
  if (!termClassifier) {
    await initTermClassifier();
  }

  try {
    return await Promise.all(
      fields.map(async field => {
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
          // Use NLP model to check sentiment/confidence for other fields
          if (field.value && termClassifier) {
            const result = await termClassifier(field.value);
            // If the model has high confidence (above 80%) in the classification, mark as valid
            isValid = result[0]?.score > 0.8;
          } else {
            isValid = field.value.length > 0;
          }
        }
        
        return { ...field, valid: isValid };
      })
    );
  } catch (error) {
    console.error("Error validating terms:", error);
    return fields;
  }
};

// Process a document image end-to-end
export const processDocument = async (
  imageUrl: string
): Promise<DocumentField[]> => {
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

  // Extract text for each field
  const extractedFields = await extractDocumentText(imageUrl, fieldsToExtract);
  
  // Validate the extracted fields
  const validatedFields = await validateTerms(extractedFields);
  
  return validatedFields;
};
