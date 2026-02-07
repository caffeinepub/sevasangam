import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search } from 'lucide-react';
import { CATEGORY_IDS, CATEGORY_NAMES } from '../../utils/categories';

export default function HomeSearchPanel() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    if (availability) params.set('availability', availability);

    navigate({ to: '/search', search: Object.fromEntries(params) });
  };

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Service Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a service" />
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
        <Label htmlFor="location">Location (City / Area)</Label>
        <Input
          id="location"
          placeholder="e.g., Guwahati, Kamrup"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability">Availability</Label>
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger id="availability">
            <SelectValue placeholder="Select availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSearch} className="w-full" size="lg">
        <Search className="mr-2 h-5 w-5" />
        Find Workers
      </Button>
    </div>
  );
}
