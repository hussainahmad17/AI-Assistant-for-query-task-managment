
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
        if (profileError.message.includes("returned no results")) {
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
        
        // Try to fetch bio separately
        try {
          const { data: bioData, error: bioError } = await supabase
            .from('profiles')
            .select('bio')
            .eq('id', user.id)
            .single();
          
          if (bioError) {
            // Handle the specific error where bio column doesn't exist
            if (bioError.message && bioError.message.includes("column 'bio' does not exist")) {
              console.log("Bio column does not exist yet");
              setBio("");
            } else {
              console.error('Error fetching bio:', bioError);
            }
          } else if (bioData && bioData.bio) {
            setBio(bioData.bio);
          }
        } catch (bioError) {
          console.log('Bio field might not exist yet:', bioError);
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
        .insert({
          id: updates.id,
          username: updates.username,
          full_name: updates.full_name,
          avatar_url: updates.avatar_url,
          updated_at: updates.updated_at
        });
        
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
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: data.publicUrl })
          .eq('id', user?.id);
          
        if (updateError) throw updateError;
        
        toast({
          title: "Success",
          description: "Avatar uploaded successfully",
        });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
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
      
      // First try updating without the bio field
      const baseUpdates = {
        username,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };
      
      try {
        // Try with bio field
        const { error } = await supabase
          .from('profiles')
          .update({
            ...baseUpdates,
            bio
          })
          .eq('id', user.id);
          
        if (error) {
          // If there's an error with bio field, try without it
          if (error.message && error.message.includes("bio")) {
            const { error: baseError } = await supabase
              .from('profiles')
              .update(baseUpdates)
              .eq('id', user.id);
              
            if (baseError) throw baseError;
          } else {
            throw error;
          }
        }
      } catch (bioError: any) {
        console.error('Error updating with bio field:', bioError);
        
        // Try without bio
        const { error } = await supabase
          .from('profiles')
          .update(baseUpdates)
          .eq('id', user.id);
          
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
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
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} alt={fullName || username} />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">{userInitial}</AvatarFallback>
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
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio"
                    placeholder="Tell us a bit about yourself"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
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
          
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Your account email address (cannot be changed)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Account Provider</Label>
                <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <span>{user?.app_metadata?.provider || "Email"}</span>
                  <User className="h-4 w-4" />
                </div>
                <p className="text-xs text-muted-foreground">
                  The authentication provider for your account
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Account Created</Label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
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
