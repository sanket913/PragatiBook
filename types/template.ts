export interface TemplateSettings {
  id: string;
  userId: string;
  name: string;
  
  // Company Information
  companyName: string;
  companySubtitle: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  
  // Logo Settings
  logoUrl?: string;
  logoSize: 'small' | 'medium' | 'large';
  logoPosition: 'left' | 'center' | 'right';
  
  // Color Scheme
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  
  // Layout Settings
  headerStyle: 'modern' | 'classic' | 'minimal';
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'spacious';
  
  // Field Visibility
  showLogo: boolean;
  showCompanyAddress: boolean;
  showDueDate: boolean;
  showPaymentTerms: boolean;
  showFooter: boolean;
  showItemNumbers: boolean;
  showMeasurements: boolean;
  
  // Custom Fields
  customFields: {
    label: string;
    value: string;
    position: 'header' | 'footer' | 'billing';
  }[];
  
  // Payment Terms
  paymentTerms: string;
  footerText: string;
  
  // Invoice Settings
  invoicePrefix: string;
  dueDays: number;
  
  createdAt: string;
  updatedAt: string;
}