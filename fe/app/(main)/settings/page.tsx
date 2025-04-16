"use client";

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { updateUserProfile, updateUserPassword, clearError } from '@/lib/redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Avatar, { genConfig, AvatarConfig } from 'react-nice-avatar';
import { 
  RotateCw, 
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    username: user?.username || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    marketing: false,
    security: true,
    updates: true,
  });

  // State for avatar configuration
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  // Generate a random avatar or seed-based avatar on initial load
  useEffect(() => {
    if (user?.email) {
      // Use user's email as seed for consistent avatar generation
      setAvatarConfig(genConfig(user.email));
    } else {
      // Generate random avatar if no email
      setAvatarConfig(genConfig());
    }
  }, [user?.email]);

  // Update local form when user data changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        username: user.username || '',
      });
    }
  }, [user]);

  // Display errors from redux state
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only send fields that have changed
    const updatedFields: {
      name?: string;
      email?: string;
      bio?: string;
      username?: string;
    } = {};
    
    if (profileForm.name !== user?.name) updatedFields.name = profileForm.name;
    if (profileForm.email !== user?.email) updatedFields.email = profileForm.email;
    if (profileForm.bio !== user?.bio) updatedFields.bio = profileForm.bio;
    if (profileForm.username !== user?.username) updatedFields.username = profileForm.username;
    
    // Check if any fields have changed
    if (Object.keys(updatedFields).length === 0) {
      toast.info('No changes to save');
      return;
    }
    
    const resultAction = await dispatch(updateUserProfile(updatedFields));
    
    if (updateUserProfile.fulfilled.match(resultAction)) {
      toast.success('Profile updated successfully');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    const resultAction = await dispatch(updateUserPassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }));
    
    if (updateUserPassword.fulfilled.match(resultAction)) {
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handleSaveNotifications = () => {
    // In a real app, this would call an API to save notification preferences
    toast.success('Notification preferences saved');
  };

  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog and then call an API
    toast.error('Account deletion would be implemented in a real app');
  };

  // Generate a new random avatar
  const generateRandomAvatar = () => {
    setAvatarConfig(genConfig());
  };

  // Update avatar in profile if we had a backend endpoint for it
  const saveAvatar = async () => {
    toast.success('Avatar updated successfully');
    // In a real app, we would save the avatar configuration to the user's profile
    // Example: await dispatch(updateUserAvatar(avatarConfig));
    setShowAvatarOptions(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and how others see you on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    {avatarConfig && (
                      <div className="relative">
                        <Avatar
                          className="h-24 w-24"
                          {...avatarConfig}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 rounded-full"
                          onClick={() => {
                            setShowAvatarOptions(!showAvatarOptions);
                          }}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {showAvatarOptions && (
                      <div className="flex flex-col gap-2 items-center p-3 border rounded-md bg-background">
                        <div className="text-sm font-medium mb-2">Randomize your avatar</div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div 
                              key={i} 
                              className="cursor-pointer p-1 border rounded-md hover:bg-accent"
                              onClick={() => setAvatarConfig(genConfig())}
                            >
                              <Avatar
                                className="h-12 w-12"
                                {...genConfig()}
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={generateRandomAvatar}
                          >
                            Randomize
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={saveAvatar}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Save
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-center text-muted-foreground">
                      Cartoon avatar generated automatically
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          name="name"
                          value={profileForm.name} 
                          onChange={handleProfileFormChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          name="username"
                          value={profileForm.username} 
                          onChange={handleProfileFormChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        value={profileForm.email} 
                        onChange={handleProfileFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input 
                        id="bio" 
                        name="bio"
                        value={profileForm.bio} 
                        onChange={handleProfileFormChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    name="currentPassword"
                    type="password" 
                    value={passwordForm.currentPassword} 
                    onChange={handlePasswordFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    name="newPassword"
                    type="password" 
                    value={passwordForm.newPassword} 
                    onChange={handlePasswordFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type="password" 
                    value={passwordForm.confirmPassword} 
                    onChange={handlePasswordFormChange}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. All of your data will be permanently removed.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications-email">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about your account activity
                    </p>
                  </div>
                  <Switch 
                    id="notifications-email" 
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, email: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications-marketing">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features and offers
                    </p>
                  </div>
                  <Switch 
                    id="notifications-marketing" 
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, marketing: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications-security">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about account security
                    </p>
                  </div>
                  <Switch 
                    id="notifications-security" 
                    checked={notifications.security}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, security: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications-updates">Product Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about product updates and new features
                    </p>
                  </div>
                  <Switch 
                    id="notifications-updates" 
                    checked={notifications.updates}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, updates: checked})
                    }
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 