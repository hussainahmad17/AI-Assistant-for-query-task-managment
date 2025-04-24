
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
      
      console.log("Fetching profile for user ID:", user.id);
      
      // Fetch profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, bio')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Profile fetch error:", error);
        // If profile doesn't exist, create a new one
        if (error.message && error.message.includes("returned no results")) {
          await createNewProfile();
          return;
        } else {
          throw error;
        }
      }
      
      console.log("Profile data fetched:", data);
      
      if (data) {
        // Set the profile data
        setUsername(data.username || '');
        setFullName(data.full_name || '');
        
        if (data.avatar_url) {
          console.log("Setting avatar URL:", data.avatar_url);
          setAvatarUrl(data.avatar_url);
        }
        
        if (data.bio !== null) {
          setBio(data.bio || '');
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
        bio: '',
        updated_at: new Date().toISOString(),
      };
      
      console.log("Creating new profile with:", updates);
      
      const { error } = await supabase
        .from('profiles')
        .insert(updates);
        
      if (error) {
        console.error("Error creating profile:", error);
        throw error;
      }
      
      setUsername(updates.username);
      toast({
        title: "Success",
        description: "Profile created successfully",
      });
    } catch (error) {
      console.error('Error creating new profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }
    
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log("Uploading avatar:", filePath);
      
      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload successful, getting public URL");
      
      // Get the public URL
      const { data: publicUrlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL for avatar');
      }
      
      const publicUrl = publicUrlData.publicUrl;
      console.log("Public URL obtained:", publicUrl);
      
      setAvatarUrl(publicUrl);
      
      // Update profile with new avatar URL
      console.log("Updating profile with avatar URL");
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }
      
      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      });
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
      
      const updates = {
        username,
        full_name: fullName,
        avatar_url: avatarUrl,
        bio,
        updated_at: new Date().toISOString(),
      };
      
      console.log("Updating profile with:", updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) {
        console.error("Profile update error:", error);
        throw error;
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
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={fullName || username} />
                    ) : (
                      <AvatarFallback className="text-xl bg-primary text-primary-foreground">{userInitial}</AvatarFallback>
                    )}
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
                <Label>Email Verification</Label>
                <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                  <span>{user?.email_confirmed_at ? "Verified" : "Not verified"}</span>
                  <div className={`h-2 w-2 rounded-full ${user?.email_confirmed_at ? "bg-green-500" : "bg-red-500"}`}></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Status of your email verification
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
