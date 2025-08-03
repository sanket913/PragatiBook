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
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Editor
          </Button>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <div 
              className="invoice-preview"
              style={{
                fontFamily: 'Arial, sans-serif',
                color: template.textColor,
                backgroundColor: template.backgroundColor,
                fontSize: template.fontSize === 'small' ? '12px' : template.fontSize === 'large' ? '16px' : '14px',
                lineHeight: template.spacing === 'compact' ? '1.2' : template.spacing === 'spacious' ? '1.8' : '1.5'
              }}
            >
              {/* Preview Header */}
              <div 
                className="flex justify-between items-start mb-6 pb-4"
                style={{ borderBottom: `2px solid ${template.primaryColor}` }}
              >
                <div className="flex items-center">
                  {template.showLogo && template.logoUrl && (
                    <div className="mr-4">
                      <div 
                        className="bg-gray-200 rounded flex items-center justify-center"
                        style={{
                          width: template.logoSize === 'small' ? '40px' : template.logoSize === 'large' ? '80px' : '60px',
                          height: template.logoSize === 'small' ? '40px' : template.logoSize === 'large' ? '80px' : '60px'
                        }}
                      >
                        LOGO
                      </div>
                    </div>
                  )}
                  <div>
                    <h1 
                      className="text-2xl font-bold mb-1"
                      style={{ color: template.primaryColor }}
                    >
                      {template.companyName || 'Your Company Name'}
                    </h1>
                    <p style={{ color: template.secondaryColor }}>
                      {template.companySubtitle}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <h2 className="text-xl font-bold mb-2">INVOICE</h2>
                  <p><strong>Invoice #:</strong> {template.invoicePrefix}-001</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  {template.showDueDate && (
                    <p><strong>Due Date:</strong> {new Date(Date.now() + template.dueDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Company Address */}
              {template.showCompanyAddress && template.companyAddress && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2" style={{ color: template.primaryColor }}>From:</h3>
                  <div style={{ color: template.textColor }}>
                    <p>{template.companyAddress}</p>
                    {template.companyPhone && <p>Phone: {template.companyPhone}</p>}
                    {template.companyEmail && <p>Email: {template.companyEmail}</p>}
                    {template.companyWebsite && <p>Website: {template.companyWebsite}</p>}
                  </div>
                </div>
              )}

              {/* Custom Header Fields */}
              {template.customFields.filter(cf => cf.position === 'header').map((field, index) => (
                <div key={index} className="mb-2">
                  <strong>{field.label}:</strong> {field.value}
                </div>
              ))}

              {/* Sample Items Table */}
              <table className="w-full border-collapse mb-6" style={{ border: `1px solid ${template.secondaryColor}` }}>
                <thead style={{ backgroundColor: template.primaryColor, color: 'white' }}>
                  <tr>
                    {template.showItemNumbers && <th className="p-2 text-left">#</th>}
                    <th className="p-2 text-left">Description</th>
                    {template.showMeasurements && (
                      <>
                        <th className="p-2 text-right">Feet</th>
                        <th className="p-2 text-right">Inches</th>
                      </>
                    )}
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${template.secondaryColor}` }}>
                    {template.showItemNumbers && <td className="p-2">1</td>}
                    <td className="p-2">Sample Item</td>
                    {template.showMeasurements && (
                      <>
                        <td className="p-2 text-right">10</td>
                        <td className="p-2 text-right">6</td>
                      </>
                    )}
                    <td className="p-2 text-right">2</td>
                    <td className="p-2 text-right">₹100.00</td>
                    <td className="p-2 text-right font-semibold">₹200.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: template.backgroundColor, borderTop: `2px solid ${template.primaryColor}` }}>
                    <td colSpan={template.showItemNumbers && template.showMeasurements ? 6 : template.showItemNumbers || template.showMeasurements ? 5 : 4} className="p-3 text-right font-bold">
                      Total Amount:
                    </td>
                    <td className="p-3 text-right font-bold" style={{ color: template.accentColor }}>
                      ₹200.00
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Payment Terms */}
              {template.showPaymentTerms && (
                <div className="mb-6 p-4" style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px' }}>
                  <h4 className="font-semibold mb-2" style={{ color: '#92400e' }}>Payment Terms</h4>
                  <p style={{ color: '#78350f', fontSize: '12px' }}>{template.paymentTerms}</p>
                </div>
              )}

              {/* Custom Footer Fields */}
              {template.customFields.filter(cf => cf.position === 'footer').map((field, index) => (
                <div key={index} className="mb-2">
                  <strong>{field.label}:</strong> {field.value}
                </div>
              ))}

              {/* Footer */}
              {template.showFooter && (
                <div className="text-center mt-6 pt-4" style={{ borderTop: `1px solid ${template.secondaryColor}` }}>
                  <p className="font-semibold" style={{ color: template.primaryColor }}>{template.footerText}</p>
                  <p style={{ color: template.secondaryColor, fontSize: '12px' }}>
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-4 p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Template Customizer</h2>
            <p className="text-gray-600">Customize your invoice template</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center">
            <Building className="w-4 h-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Fields
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  value={template.name}
                  onChange={(e) => updateTemplate('name', e.target.value)}
                  placeholder="My Custom Template"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={template.companyName}
                    onChange={(e) => updateTemplate('companyName', e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <Label htmlFor="companySubtitle">Subtitle</Label>
                  <Input
                    id="companySubtitle"
                    value={template.companySubtitle}
                    onChange={(e) => updateTemplate('companySubtitle', e.target.value)}
                    placeholder="Professional Services"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="companyAddress">Address</Label>
                <Textarea
                  id="companyAddress"
                  value={template.companyAddress}
                  onChange={(e) => updateTemplate('companyAddress', e.target.value)}
                  placeholder="123 Business Street, City, State 12345"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={template.companyPhone}
                    onChange={(e) => updateTemplate('companyPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={template.companyEmail}
                    onChange={(e) => updateTemplate('companyEmail', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input
                    id="companyWebsite"
                    value={template.companyWebsite}
                    onChange={(e) => updateTemplate('companyWebsite', e.target.value)}
                    placeholder="www.company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {colorPresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => applyColorPreset(preset)}
                    className="h-auto p-3 flex flex-col items-start"
                  >
                    <div className="flex space-x-2 mb-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary }}></div>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.secondary }}></div>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.accent }}></div>
                    </div>
                    <span className="text-sm">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={template.primaryColor}
                      onChange={(e) => updateTemplate('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.primaryColor}
                      onChange={(e) => updateTemplate('primaryColor', e.target.value)}
                      placeholder="#2563eb"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={template.secondaryColor}
                      onChange={(e) => updateTemplate('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.secondaryColor}
                      onChange={(e) => updateTemplate('secondaryColor', e.target.value)}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={template.accentColor}
                      onChange={(e) => updateTemplate('accentColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.accentColor}
                      onChange={(e) => updateTemplate('accentColor', e.target.value)}
                      placeholder="#059669"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="headerStyle">Header Style</Label>
                  <Select value={template.headerStyle} onValueChange={(value) => updateTemplate('headerStyle', value)}>
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
                  <Label htmlFor="fontSize">Font Size</Label>
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
                  <Label htmlFor="spacing">Spacing</Label>
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
              <CardTitle>Invoice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={template.invoicePrefix}
                    onChange={(e) => updateTemplate('invoicePrefix', e.target.value)}
                    placeholder="INV"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDays">Due Days</Label>
                  <Input
                    id="dueDays"
                    type="number"
                    value={template.dueDays}
                    onChange={(e) => updateTemplate('dueDays', parseInt(e.target.value) || 30)}
                    min="1"
                    max="365"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showLogo">Show Logo</Label>
                  <Switch
                    id="showLogo"
                    checked={template.showLogo}
                    onCheckedChange={(checked) => updateTemplate('showLogo', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCompanyAddress">Show Company Address</Label>
                  <Switch
                    id="showCompanyAddress"
                    checked={template.showCompanyAddress}
                    onCheckedChange={(checked) => updateTemplate('showCompanyAddress', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showDueDate">Show Due Date</Label>
                  <Switch
                    id="showDueDate"
                    checked={template.showDueDate}
                    onCheckedChange={(checked) => updateTemplate('showDueDate', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showPaymentTerms">Show Payment Terms</Label>
                  <Switch
                    id="showPaymentTerms"
                    checked={template.showPaymentTerms}
                    onCheckedChange={(checked) => updateTemplate('showPaymentTerms', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showFooter">Show Footer</Label>
                  <Switch
                    id="showFooter"
                    checked={template.showFooter}
                    onCheckedChange={(checked) => updateTemplate('showFooter', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showItemNumbers">Show Item Numbers</Label>
                  <Switch
                    id="showItemNumbers"
                    checked={template.showItemNumbers}
                    onCheckedChange={(checked) => updateTemplate('showItemNumbers', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showMeasurements">Show Measurements</Label>
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
              <CardTitle>Text Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Textarea
                  id="paymentTerms"
                  value={template.paymentTerms}
                  onChange={(e) => updateTemplate('paymentTerms', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="footerText">Footer Text</Label>
                <Input
                  id="footerText"
                  value={template.footerText}
                  onChange={(e) => updateTemplate('footerText', e.target.value)}
                  placeholder="Thank you for your business!"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Custom Fields</CardTitle>
                <Button onClick={addCustomField} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {template.customFields.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No custom fields added yet</p>
              ) : (
                <div className="space-y-4">
                  {template.customFields.map((field, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label>Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                          placeholder="Field Label"
                        />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input
                          value={field.value}
                          onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                          placeholder="Field Value"
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Select 
                          value={field.position} 
                          onValueChange={(value) => updateCustomField(index, 'position', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="header">Header</SelectItem>
                            <SelectItem value="billing">Billing Section</SelectItem>
                            <SelectItem value="footer">Footer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCustomField(index)}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4" />
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