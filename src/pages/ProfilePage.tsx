// ============================================
// Profile Settings Page
// Users can update name, phone, and avatar
// ============================================

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, Save, User } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setFullName(data.full_name || '');
      setPhone(data.phone || '');
      setAvatarUrl(data.avatar_url || null);
    }
    setIsLoading(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (max 2 MB)
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Avatar must be under 2 MB.', variant: 'destructive' });
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return avatarUrl;

    setIsUploading(true);
    const ext = avatarFile.name.split('.').pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true });

    setIsUploading(false);

    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;

    // Basic validation
    if (!fullName.trim()) {
      toast({ title: 'Name required', description: 'Please enter your full name.', variant: 'destructive' });
      return;
    }
    if (fullName.trim().length > 100) {
      toast({ title: 'Name too long', description: 'Name must be under 100 characters.', variant: 'destructive' });
      return;
    }
    if (phone && !/^[+\d\s\-().]{0,20}$/.test(phone)) {
      toast({ title: 'Invalid phone', description: 'Please enter a valid phone number.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    // Upload avatar first if a new one was selected
    let newAvatarUrl = avatarUrl;
    if (avatarFile) {
      newAvatarUrl = await uploadAvatar();
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    setIsSaving(false);

    if (error) {
      toast({ title: 'Save failed', description: 'Could not update profile. Please try again.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Profile updated!', description: 'Your changes have been saved.' });

    // Refresh avatar state
    if (newAvatarUrl) setAvatarUrl(newAvatarUrl);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const displayAvatar = avatarPreview || avatarUrl;
  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-1">Profile Settings</h1>
            <p className="text-muted-foreground">Update your personal information and avatar</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Avatar Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                  <CardDescription>Click on the avatar to upload a new photo (max 2 MB)</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="h-24 w-24 ring-2 ring-border group-hover:ring-primary transition-all">
                      <AvatarImage src={displayAvatar ?? undefined} alt={fullName} />
                      <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{fullName || 'Your Name'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize bg-primary/10 text-primary rounded-full px-2 py-0.5 inline-block">{user.role}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your name and contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-muted/50 text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      maxLength={20}
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving || isUploading}
                    className="w-full gap-2"
                  >
                    {isSaving || isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? 'Saving…' : isUploading ? 'Uploading photo…' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
