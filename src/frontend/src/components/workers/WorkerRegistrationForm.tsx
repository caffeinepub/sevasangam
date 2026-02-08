import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2 } from 'lucide-react';
import PhotoPicker from './PhotoPicker';
import { CATEGORY_NAMES } from '../../utils/categories';
import type { WorkerProfile } from '../../backend';
import { ExternalBlob } from '../../backend';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';

interface WorkerRegistrationFormProps {
  onSubmit: (profile: WorkerProfile) => Promise<void>;
  isSubmitting: boolean;
}

export default function WorkerRegistrationForm({ onSubmit, isSubmitting }: WorkerRegistrationFormProps) {
  const { identity } = useInternetIdentity();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    categoryId: '',
    yearsExperience: '',
    city: '',
    district: '',
    ratePerHour: '',
    availability: '',
    whatsappNumber: '',
  });
  const [photo, setPhoto] = useState<ExternalBlob | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) return;

    if (!formData.categoryId) {
      toast.error('Please select a service category');
      return;
    }

    const profile: WorkerProfile = {
      id: `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      principal: identity.getPrincipal(),
      full_name: formData.fullName,
      phone_number: formData.phoneNumber,
      photo: photo,
      category_id: formData.categoryId,
      location: {
        city: formData.city || undefined,
        district: formData.district || undefined,
        country: undefined,
        address: undefined,
        latitude: undefined,
        longitude: undefined,
      },
      years_experience: BigInt(formData.yearsExperience || 0),
      pricing: {
        rate_per_hour: formData.ratePerHour ? BigInt(formData.ratePerHour) : undefined,
        rate_per_day: undefined,
        currency: formData.ratePerHour ? 'INR' : undefined,
        special_offers: [],
      },
      availability: {
        available_days: formData.availability === 'full-time' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        open_time: undefined,
        close_time: undefined,
        timezone: undefined,
      },
      integrations: {
        whatsapp_number: formData.whatsappNumber || undefined,
        facebook_username: undefined,
        instagram_handle: undefined,
        website_url: undefined,
      },
      status: 'pending' as any,
      published: false,
    };

    await onSubmit(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number *</Label>
        <Input
          id="phoneNumber"
          type="tel"
          required
          placeholder="+91 1234567890"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsappNumber">WhatsApp Number (optional)</Label>
        <Input
          id="whatsappNumber"
          type="tel"
          placeholder="+91 1234567890"
          value={formData.whatsappNumber}
          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Service Category *</Label>
        <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })} required>
          <SelectTrigger id="categoryId">
            <SelectValue placeholder="Select your service" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_NAMES).map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsExperience">Years of Experience *</Label>
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
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            required
            placeholder="e.g., Guwahati"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District / Area *</Label>
          <Input
            id="district"
            required
            placeholder="e.g., Kamrup"
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
          placeholder="e.g., 500"
          value={formData.ratePerHour}
          onChange={(e) => setFormData({ ...formData, ratePerHour: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability">Availability *</Label>
        <Select value={formData.availability} onValueChange={(value) => setFormData({ ...formData, availability: value })} required>
          <SelectTrigger id="availability">
            <SelectValue placeholder="Select availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Profile Photo (optional)</Label>
        <PhotoPicker value={photo} onChange={setPhoto} />
      </div>

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Registration'
        )}
      </Button>
    </form>
  );
}
