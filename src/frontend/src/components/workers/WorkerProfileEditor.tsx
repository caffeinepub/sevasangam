import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import PhotoPicker from './PhotoPicker';
import { CATEGORY_NAMES } from '../../utils/categories';
import type { WorkerProfile } from '../../backend';
import { ExternalBlob } from '../../backend';

interface WorkerProfileEditorProps {
  profile: WorkerProfile;
  onSubmit: (profile: WorkerProfile) => Promise<void>;
  isSubmitting: boolean;
}

export default function WorkerProfileEditor({ profile, onSubmit, isSubmitting }: WorkerProfileEditorProps) {
  const [formData, setFormData] = useState({
    fullName: profile.full_name,
    phoneNumber: profile.phone_number,
    yearsExperience: String(profile.years_experience),
    city: profile.location.city || '',
    district: profile.location.district || '',
    ratePerHour: profile.pricing.rate_per_hour ? String(profile.pricing.rate_per_hour) : '',
    availability: profile.availability.available_days.length === 7 ? 'full-time' : 'part-time',
    whatsappNumber: profile.integrations.whatsapp_number || '',
  });
  const [photo, setPhoto] = useState<ExternalBlob | undefined>(profile.photo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: WorkerProfile = {
      ...profile,
      full_name: formData.fullName,
      phone_number: formData.phoneNumber,
      photo: photo,
      category_id: profile.category_id,
      location: {
        ...profile.location,
        city: formData.city || undefined,
        district: formData.district || undefined,
      },
      years_experience: BigInt(formData.yearsExperience || 0),
      pricing: {
        ...profile.pricing,
        rate_per_hour: formData.ratePerHour ? BigInt(formData.ratePerHour) : undefined,
        currency: formData.ratePerHour ? 'INR' : undefined,
      },
      availability: {
        ...profile.availability,
        available_days: formData.availability === 'full-time' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      },
      integrations: {
        ...profile.integrations,
        whatsapp_number: formData.whatsappNumber || undefined,
      },
    };

    await onSubmit(updatedProfile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Major edits (name, phone, location, pricing, availability) will trigger re-approval and temporarily hide your profile from public view.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          required
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsappNumber">WhatsApp Number (optional)</Label>
        <Input
          id="whatsappNumber"
          type="tel"
          value={formData.whatsappNumber}
          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Service Category</Label>
        <div className="px-3 py-2 border rounded-xl bg-muted text-muted-foreground">
          {CATEGORY_NAMES[profile.category_id as keyof typeof CATEGORY_NAMES] || profile.category_id}
        </div>
        <p className="text-xs text-muted-foreground">
          Service category cannot be changed. Contact admin if you need to change your service category.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsExperience">Years of Experience</Label>
        <Input
          id="yearsExperience"
          type="number"
          min="0"
          required
          value={formData.yearsExperience}
          onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District / Area</Label>
          <Input
            id="district"
            required
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ratePerHour">Rate per Hour (INR, optional)</Label>
        <Input
          id="ratePerHour"
          type="number"
          min="0"
          value={formData.ratePerHour}
          onChange={(e) => setFormData({ ...formData, ratePerHour: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability">Availability</Label>
        <Select value={formData.availability} onValueChange={(value) => setFormData({ ...formData, availability: value })}>
          <SelectTrigger id="availability">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Profile Photo</Label>
        <PhotoPicker value={photo} onChange={setPhoto} />
      </div>

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  );
}
