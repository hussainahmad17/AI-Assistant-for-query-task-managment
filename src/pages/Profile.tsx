
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Profile - Personal Assistant";
    
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First, check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        if (profileError.message && profileError.message.includes("returned no results")) {
          await createNewProfile();
          return;
        } else {
          throw profileError;
        }
      }
      
      // If the profile exists, set the state values
      if (profileData) {
        setUsername(profileData.username || '');
        setFullName(profileData.full_name || '');
        setAvatarUrl(profileData.avatar_url || '');
        
        // Try to fetch bio separately with proper error handling
        try {
          const { data: bioData, error: bioError } = await supabase
            .from('profiles')
            .select('bio')
            .eq('id', user.id)
            .single();
          
          if (bioError) {
            // Handle the specific error where bio column doesn't exist
            console.log("Bio field error:", bioError);
            setBio("");
          } else if (bioData && 'bio' in bioData) {
            // Check if bioData exists and has bio property before accessing
            setBio(bioData.bio || "");
          }
        } catch (bioError) {
          console.log('Bio field might not exist yet:', bioError);
          setBio("");
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewProfile = async () => {
    if (!user) return;
    
    try {
      const updates = {
        id: user.id,
        username: user.email?.split('@')[0] || '',
        full_name: '',
        avatar_url: '',
        updated_at: new Date().toISOString(),
      };
      
      // Don't include bio field in case it doesn't exist
      const { error } = await supabase
        .from('profiles')
        .insert(updates);
        
      if (error) {
        throw error;
      }
      
      setUsername(updates.username);
    } catch (error) {
      console.error('Error creating new profile:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Check if avatars bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
      
      if (!avatarBucketExists) {
        await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
      }
      
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      if (data) {
        setAvatarUrl(data.publicUrl);
        
        // Use upsert to handle both insert and update cases
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({ 
            id: user?.id,
            avatar_url: data.publicUrl,
            updated_at: new Date().toISOString()
          });
          
        if (updateError) throw updateError;
        
        toast({
          title: "Success",
          description: "Avatar uploaded successfully",
        });
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Base updates that should always work
      const baseUpdates = {
        id: user.id,
        username,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };
      
      try {
        // Try with bio field using upsert to handle both insert and update
        const { error } = await supabase
          .from('profiles')
          .upsert({
            ...baseUpdates,
            bio
          });
          
        if (error) {
          console.error('Error updating with bio:', error);
          
          // If bio field causes an error, try without it
          const { error: baseError } = await supabase
            .from('profiles')
            .upsert(baseUpdates);
            
          if (baseError) throw baseError;
        }
        
        toast({
          title: "Success",
          description: "Your profile has been updated",
        });
      } catch (error: any) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const userEmail = user?.email || "User";
  const userInitial = (userEmail.charAt(0) || "U").toUpperCase();

  return (
    <MainLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        id="main-content"
        className="space-y-6 px-4 md:px-0"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-2 ring-primary/20 ring-offset-2">
                    <AvatarImage src={avatarUrl} alt={fullName || username} />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">{userInitial}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label="Upload profile picture"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-lg font-medium">{fullName || username || userEmail}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username"
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="focus-visible:ring-primary/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="focus-visible:ring-primary/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio"
                    placeholder="Tell us a bit about yourself"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="focus-visible:ring-primary/50"
                  />
                </div>
                
                <Button 
                  onClick={updateProfile} 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  readOnly
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Your account email address (cannot be changed)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Account Provider</Label>
                <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  <span>{user?.app_metadata?.provider || "Email"}</span>
                  <User className="h-4 w-4" />
                </div>
                <p className="text-xs text-muted-foreground">
                  The authentication provider for your account
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Account Created</Label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleString() : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  When your account was created
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Profile;
