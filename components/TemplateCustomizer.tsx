'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TemplateSettings } from '@/types/template';
import { User } from '@/types/auth';
import { ArrowLeft, Save, Eye, Palette, Settings, Building, FileText, Plus, Trash2 } from 'lucide-react';

interface TemplateCustomizerProps {
  user: User;
  onBack: () => void;
  onSave: (template: TemplateSettings) => void;
  existingTemplate?: TemplateSettings | null;
}

const defaultTemplate: Omit<TemplateSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  name: 'Default Template',
  companyName: '',
  companySubtitle: 'Professional Services',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  companyWebsite: '',
  logoSize: 'medium',
  logoPosition: 'left',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#059669',
  textColor: '#1f2937',
  backgroundColor: '#ffffff',
  headerStyle: 'modern',
  fontSize: 'medium',
  spacing: 'normal',
  showLogo: false,
  showCompanyAddress: true,
  showDueDate: true,
  showPaymentTerms: true,
  showFooter: true,
  showItemNumbers: true,
  showMeasurements: true,
  customFields: [],
  paymentTerms: 'Payment is due within 30 days of invoice date. Please include the invoice number with your payment.',
  footerText: 'Thank you for your business!',
  invoicePrefix: 'INV',
  dueDays: 30
};

export default function TemplateCustomizer({ user, onBack, onSave, existingTemplate }: TemplateCustomizerProps) {
  const [template, setTemplate] = useState<Omit<TemplateSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>(
    existingTemplate || defaultTemplate
  );
  const [previewMode, setPreviewMode] = useState(false);

  const updateTemplate = (field: string, value: any) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const addCustomField = () => {
    setTemplate(prev => ({
      ...prev,
      customFields: [...prev.customFields, { label: '', value: '', position: 'header' }]
    }));
  };

  const updateCustomField = (index: number, field: string, value: string) => {
    setTemplate(prev => ({
      ...prev,
      customFields: prev.customFields.map((cf, i) => 
        i === index ? { ...cf, [field]: value } : cf
      )
    }));
  };

  const removeCustomField = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!template.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    const templateToSave: TemplateSettings = {
      id: existingTemplate?.id || Math.random().toString(36).substring(2),
      userId: user.id,
      ...template,
      createdAt: existingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(templateToSave);
  };

  const colorPresets = [
    { name: 'Professional Blue', primary: '#2563eb', secondary: '#64748b', accent: '#059669' },
    { name: 'Corporate Gray', primary: '#374151', secondary: '#6b7280', accent: '#f59e0b' },
    { name: 'Modern Green', primary: '#059669', secondary: '#64748b', accent: '#dc2626' },
    { name: 'Creative Purple', primary: '#7c3aed', secondary: '#64748b', accent: '#f59e0b' },
    { name: 'Elegant Black', primary: '#1f2937', secondary: '#6b7280', accent: '#3b82f6' }
  ];

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setTemplate(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    }));
  };

  if (previewMode) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Button variant="outline" onClick={() => setPreviewMode(false)} className="flex items-center text-sm sm:text-base h-9 sm:h-10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Editor
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handleSave} className="flex items-center text-sm sm:text-base h-9 sm:h-10">
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div 
              className="invoice-preview"
              style={{
                fontFamily: 'Arial, sans-serif',
                color: template.textColor,
                backgroundColor: template.backgroundColor,
                fontSize: template.fontSize === 'small' ? '10px' : template.fontSize === 'large' ? '14px' : '12px',
                lineHeight: template.spacing === 'compact' ? '1.2' : template.spacing === 'spacious' ? '1.8' : '1.5'
              }}
            >
              {/* Preview Header */}
              <div 
                className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 mb-4 sm:mb-6 pb-3 sm:pb-4"
                style={{ borderBottom: `2px solid ${template.primaryColor}` }}
              >
                <div className="flex items-center">
                  {template.showLogo && template.logoUrl && (
                    <div className="mr-3 sm:mr-4">
                      <div 
                        className="bg-gray-200 rounded flex items-center justify-center"
                        style={{
                          width: template.logoSize === 'small' ? '30px' : template.logoSize === 'large' ? '60px' : '45px',
                          height: template.logoSize === 'small' ? '30px' : template.logoSize === 'large' ? '60px' : '45px'
                        }}
                      >
                        <span style={{ fontSize: '8px' }}>LOGO</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <h1 
                      className="text-lg sm:text-xl lg:text-2xl font-bold mb-1"
                      style={{ color: template.primaryColor }}
                    >
                      {template.companyName || 'Your Company Name'}
                    </h1>
                    <p style={{ color: template.secondaryColor, fontSize: '10px' }}>
                      {template.companySubtitle}
                    </p>
                  </div>
                </div>
                
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <h2 className="text-lg sm:text-xl font-bold mb-2">INVOICE</h2>
                  <p style={{ fontSize: '10px' }}><strong>Invoice #:</strong> {template.invoicePrefix}-001</p>
                  <p style={{ fontSize: '10px' }}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  {template.showDueDate && (
                    <p style={{ fontSize: '10px' }}><strong>Due Date:</strong> {new Date(Date.now() + template.dueDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Company Address */}
              {template.showCompanyAddress && template.companyAddress && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-semibold mb-2 text-sm" style={{ color: template.primaryColor }}>From:</h3>
                  <div style={{ color: template.textColor }}>
                    <p style={{ fontSize: '10px' }}>{template.companyAddress}</p>
                    {template.companyPhone && <p style={{ fontSize: '10px' }}>Phone: {template.companyPhone}</p>}
                    {template.companyEmail && <p style={{ fontSize: '10px' }}>Email: {template.companyEmail}</p>}
                    {template.companyWebsite && <p style={{ fontSize: '10px' }}>Website: {template.companyWebsite}</p>}
                  </div>
                </div>
              )}

              {/* Custom Header Fields */}
              {template.customFields.filter(cf => cf.position === 'header').map((field, index) => (
                <div key={index} className="mb-2" style={{ fontSize: '10px' }}>
                  <strong>{field.label}:</strong> {field.value}
                </div>
              ))}

              {/* Sample Items Table */}
              <div className="overflow-x-auto mb-4 sm:mb-6">
                <table className="w-full border-collapse min-w-full" style={{ border: `1px solid ${template.secondaryColor}`, fontSize: '9px' }}>
                <thead style={{ backgroundColor: template.primaryColor, color: 'white' }}>
                  <tr>
                    {template.showItemNumbers && <th className="p-1 sm:p-2 text-left">#</th>}
                    <th className="p-1 sm:p-2 text-left">Description</th>
                    {template.showMeasurements && (
                      <>
                        <th className="p-1 sm:p-2 text-right">Feet</th>
                        <th className="p-1 sm:p-2 text-right">Inches</th>
                      </>
                    )}
                    <th className="p-1 sm:p-2 text-right">Qty</th>
                    <th className="p-1 sm:p-2 text-right">Rate</th>
                    <th className="p-1 sm:p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${template.secondaryColor}` }}>
                    {template.showItemNumbers && <td className="p-1 sm:p-2">1</td>}
                    <td className="p-1 sm:p-2">Sample Item</td>
                    {template.showMeasurements && (
                      <>
                        <td className="p-1 sm:p-2 text-right">10</td>
                        <td className="p-1 sm:p-2 text-right">6</td>
                      </>
                    )}
                    <td className="p-1 sm:p-2 text-right">2</td>
                    <td className="p-1 sm:p-2 text-right">₹100.00</td>
                    <td className="p-1 sm:p-2 text-right font-semibold">₹200.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: template.backgroundColor, borderTop: `2px solid ${template.primaryColor}` }}>
                    <td colSpan={template.showItemNumbers && template.showMeasurements ? 6 : template.showItemNumbers || template.showMeasurements ? 5 : 4} className="p-2 sm:p-3 text-right font-bold">
                      Total Amount:
                    </td>
                    <td className="p-2 sm:p-3 text-right font-bold" style={{ color: template.accentColor }}>
                      ₹200.00
                    </td>
                  </tr>
                </tfoot>
              </table>
              </div>

              {/* Payment Terms */}
              {template.showPaymentTerms && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4" style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px' }}>
                  <h4 className="font-semibold mb-2 text-sm" style={{ color: '#92400e' }}>Payment Terms</h4>
                  <p style={{ color: '#78350f', fontSize: '10px' }}>{template.paymentTerms}</p>
                </div>
              )}

              {/* Custom Footer Fields */}
              {template.customFields.filter(cf => cf.position === 'footer').map((field, index) => (
                <div key={index} className="mb-2" style={{ fontSize: '10px' }}>
                  <strong>{field.label}:</strong> {field.value}
                </div>
              ))}

              {/* Footer */}
              {template.showFooter && (
                <div className="text-center mt-4 sm:mt-6 pt-3 sm:pt-4" style={{ borderTop: `1px solid ${template.secondaryColor}` }}>
                  <p className="font-semibold text-sm" style={{ color: template.primaryColor }}>{template.footerText}</p>
                  <p style={{ color: template.secondaryColor, fontSize: '10px' }}>
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex items-center min-w-0">
          <Button variant="ghost" onClick={onBack} className="mr-3 sm:mr-4 p-2 h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Template Customizer</h2>
            <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Customize your invoice template</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setPreviewMode(true)} className="flex items-center text-sm sm:text-base h-9 sm:h-10">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} className="flex items-center text-sm sm:text-base h-9 sm:h-10">
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-5 min-w-max sm:min-w-0">
          <TabsTrigger value="basic" className="flex items-center text-xs sm:text-sm px-2 sm:px-4">
            <Building className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Basic Info</span>
            <span className="sm:hidden">Basic</span>
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center text-xs sm:text-sm px-2 sm:px-4">
            <Palette className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Design</span>
            <span className="sm:hidden">Design</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center text-xs sm:text-sm px-2 sm:px-4">
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Layout</span>
            <span className="sm:hidden">Layout</span>
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center text-xs sm:text-sm px-2 sm:px-4">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Fields</span>
            <span className="sm:hidden">Fields</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center text-xs sm:text-sm px-2 sm:px-4">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Custom</span>
            <span className="sm:hidden">Custom</span>
          </TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="basic" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <div>
                <Label htmlFor="templateName" className="text-sm sm:text-base font-medium">Template Name *</Label>
                <Input
                  id="templateName"
                  value={template.name}
                  onChange={(e) => updateTemplate('name', e.target.value)}
                  placeholder="My Custom Template"
                  className="mt-1 h-9 sm:h-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="companyName" className="text-sm sm:text-base font-medium">Company Name</Label>
                  <Input
                    id="companyName"
                    value={template.companyName}
                    onChange={(e) => updateTemplate('companyName', e.target.value)}
                    placeholder="Your Company Name"
                    className="mt-1 h-9 sm:h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="companySubtitle" className="text-sm sm:text-base font-medium">Subtitle</Label>
                  <Input
                    id="companySubtitle"
                    value={template.companySubtitle}
                    onChange={(e) => updateTemplate('companySubtitle', e.target.value)}
                    placeholder="Professional Services"
                    className="mt-1 h-9 sm:h-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="companyAddress" className="text-sm sm:text-base font-medium">Address</Label>
                <Textarea
                  id="companyAddress"
                  value={template.companyAddress}
                  onChange={(e) => updateTemplate('companyAddress', e.target.value)}
                  placeholder="123 Business Street, City, State 12345"
                  rows={3}
                  className="mt-1 text-sm sm:text-base"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="companyPhone" className="text-sm sm:text-base font-medium">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={template.companyPhone}
                    onChange={(e) => updateTemplate('companyPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1 h-9 sm:h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail" className="text-sm sm:text-base font-medium">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={template.companyEmail}
                    onChange={(e) => updateTemplate('companyEmail', e.target.value)}
                    placeholder="contact@company.com"
                    className="mt-1 h-9 sm:h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="companyWebsite" className="text-sm sm:text-base font-medium">Website</Label>
                  <Input
                    id="companyWebsite"
                    value={template.companyWebsite}
                    onChange={(e) => updateTemplate('companyWebsite', e.target.value)}
                    placeholder="www.company.com"
                    className="mt-1 h-9 sm:h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Color Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {colorPresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => applyColorPreset(preset)}
                    className="h-auto p-3 sm:p-4 flex flex-col items-start text-left"
                  >
                    <div className="flex space-x-2 mb-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: preset.primary }}></div>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: preset.secondary }}></div>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: preset.accent }}></div>
                    </div>
                    <span className="text-xs sm:text-sm">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Custom Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="primaryColor" className="text-sm sm:text-base font-medium">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={template.primaryColor}
                      onChange={(e) => updateTemplate('primaryColor', e.target.value)}
                      className="w-12 h-9 sm:w-16 sm:h-10 p-1 flex-shrink-0"
                    />
                    <Input
                      value={template.primaryColor}
                      onChange={(e) => updateTemplate('primaryColor', e.target.value)}
                      placeholder="#2563eb"
                      className="h-9 sm:h-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor" className="text-sm sm:text-base font-medium">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={template.secondaryColor}
                      onChange={(e) => updateTemplate('secondaryColor', e.target.value)}
                      className="w-12 h-9 sm:w-16 sm:h-10 p-1 flex-shrink-0"
                    />
                    <Input
                      value={template.secondaryColor}
                      onChange={(e) => updateTemplate('secondaryColor', e.target.value)}
                      placeholder="#64748b"
                      className="h-9 sm:h-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor" className="text-sm sm:text-base font-medium">Accent Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={template.accentColor}
                      onChange={(e) => updateTemplate('accentColor', e.target.value)}
                      className="w-12 h-9 sm:w-16 sm:h-10 p-1 flex-shrink-0"
                    />
                    <Input
                      value={template.accentColor}
                      onChange={(e) => updateTemplate('accentColor', e.target.value)}
                      placeholder="#059669"
                      className="h-9 sm:h-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Layout Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="headerStyle" className="text-sm sm:text-base font-medium">Header Style</Label>
                  <Select value={template.headerStyle} onValueChange={(value) => updateTemplate('headerStyle', value)} >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fontSize" className="text-sm sm:text-base font-medium">Font Size</Label>
                  <Select value={template.fontSize} onValueChange={(value) => updateTemplate('fontSize', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="spacing" className="text-sm sm:text-base font-medium">Spacing</Label>
                  <Select value={template.spacing} onValueChange={(value) => updateTemplate('spacing', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Invoice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="invoicePrefix" className="text-sm sm:text-base font-medium">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={template.invoicePrefix}
                    onChange={(e) => updateTemplate('invoicePrefix', e.target.value)}
                    placeholder="INV"
                    className="mt-1 h-9 sm:h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDays" className="text-sm sm:text-base font-medium">Due Days</Label>
                  <Input
                    id="dueDays"
                    type="number"
                    value={template.dueDays}
                    onChange={(e) => updateTemplate('dueDays', parseInt(e.target.value) || 30)}
                    min="1"
                    max="365"
                    className="mt-1 h-9 sm:h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Field Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showLogo" className="text-sm sm:text-base font-medium">Show Logo</Label>
                  <Switch
                    id="showLogo"
                    checked={template.showLogo}
                    onCheckedChange={(checked) => updateTemplate('showLogo', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCompanyAddress" className="text-sm sm:text-base font-medium">Show Company Address</Label>
                  <Switch
                    id="showCompanyAddress"
                    checked={template.showCompanyAddress}
                    onCheckedChange={(checked) => updateTemplate('showCompanyAddress', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showDueDate" className="text-sm sm:text-base font-medium">Show Due Date</Label>
                  <Switch
                    id="showDueDate"
                    checked={template.showDueDate}
                    onCheckedChange={(checked) => updateTemplate('showDueDate', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showPaymentTerms" className="text-sm sm:text-base font-medium">Show Payment Terms</Label>
                  <Switch
                    id="showPaymentTerms"
                    checked={template.showPaymentTerms}
                    onCheckedChange={(checked) => updateTemplate('showPaymentTerms', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showFooter" className="text-sm sm:text-base font-medium">Show Footer</Label>
                  <Switch
                    id="showFooter"
                    checked={template.showFooter}
                    onCheckedChange={(checked) => updateTemplate('showFooter', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showItemNumbers" className="text-sm sm:text-base font-medium">Show Item Numbers</Label>
                  <Switch
                    id="showItemNumbers"
                    checked={template.showItemNumbers}
                    onCheckedChange={(checked) => updateTemplate('showItemNumbers', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showMeasurements" className="text-sm sm:text-base font-medium">Show Measurements</Label>
                  <Switch
                    id="showMeasurements"
                    checked={template.showMeasurements}
                    onCheckedChange={(checked) => updateTemplate('showMeasurements', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Text Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <div>
                <Label htmlFor="paymentTerms" className="text-sm sm:text-base font-medium">Payment Terms</Label>
                <Textarea
                  id="paymentTerms"
                  value={template.paymentTerms}
                  onChange={(e) => updateTemplate('paymentTerms', e.target.value)}
                  rows={3}
                  className="mt-1 text-sm sm:text-base"
                />
              </div>
              <div>
                <Label htmlFor="footerText" className="text-sm sm:text-base font-medium">Footer Text</Label>
                <Input
                  id="footerText"
                  value={template.footerText}
                  onChange={(e) => updateTemplate('footerText', e.target.value)}
                  placeholder="Thank you for your business!"
                  className="mt-1 h-9 sm:h-10"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">Custom Fields</CardTitle>
                <Button onClick={addCustomField} size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Add Field</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {template.customFields.length === 0 ? (
                <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No custom fields added yet</p>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {template.customFields.map((field, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6 border rounded-lg bg-gray-50">
                      <div>
                        <Label className="text-sm sm:text-base font-medium">Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                          placeholder="Field Label"
                          className="mt-1 h-9 sm:h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-sm sm:text-base font-medium">Value</Label>
                        <Input
                          value={field.value}
                          onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                          placeholder="Field Value"
                          className="mt-1 h-9 sm:h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-sm sm:text-base font-medium">Position</Label>
                        <Select 
                          value={field.position} 
                          onValueChange={(value) => updateCustomField(index, 'position', value)}
                        >
                          <SelectTrigger className="mt-1 h-9 sm:h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="header">Header</SelectItem>
                            <SelectItem value="billing">Billing Section</SelectItem>
                            <SelectItem value="footer">Footer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end sm:col-span-2 lg:col-span-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCustomField(index)}
                          className="w-full sm:w-auto h-9 sm:h-10 mt-1"
                        >
                          <Trash2 className="w-4 h-4 mr-2 sm:mr-0" />
                          <span className="sm:hidden">Remove</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}