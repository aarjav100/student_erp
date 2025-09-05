import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, User, Settings, Mail, Shield, Calendar, GraduationCap, Camera, Upload, Image, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    // Try to load from localStorage first, then fallback to user profile picture
    const storedImage = localStorage.getItem('userProfileImage');
    return storedImage || (user as any)?.profilePicture || null;
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a preview URL and store in localStorage
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        
        // Store in localStorage for persistence
        localStorage.setItem('userProfileImage', result);
        
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been successfully updated.",
        });
        
        // Close the dialog
        setIsProfileDialogOpen(false);
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem('userProfileImage');
    toast({
      title: "Profile picture removed",
      description: "Your profile picture has been removed.",
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400';
      case 'teacher':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400';
      case 'student':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'teacher':
        return <GraduationCap className="h-3 w-3" />;
      case 'student':
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  return (
    <>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100/20 transition-all duration-200 group">
          <Avatar className="h-10 w-10 ring-2 ring-white/30 group-hover:ring-white/50 transition-all duration-200 shadow-lg">
            {profileImage ? (
              <AvatarImage src={profileImage} alt={`${user.firstName} ${user.lastName}`} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-slate-100/20 to-slate-50/10 text-slate-100 font-semibold backdrop-blur-sm">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-0 bg-slate-50/95 backdrop-blur-md border border-slate-200/20 shadow-2xl rounded-xl" align="end" forceMount>
        {/* User Info Header */}
        <div className="p-4 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-slate-200/20">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <Avatar className="h-12 w-12 ring-2 ring-white/50 shadow-lg cursor-pointer hover:ring-blue-400 transition-all duration-200" onClick={() => setIsProfileDialogOpen(true)}>
                {profileImage ? (
                  <AvatarImage src={profileImage} alt={`${user.firstName} ${user.lastName}`} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <Mail className="h-3 w-3 text-gray-400" />
                <p className="text-xs text-gray-600 truncate">
                  {user.email}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={`${getRoleColor(user.role)} text-xs px-2 py-1 flex items-center space-x-1`}>
                  {getRoleIcon(user.role)}
                  <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                </Badge>
                {user.studentId && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    ID: {user.studentId}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Additional User Info */}
          <div className="mt-3 space-y-2">
            {user.program && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <GraduationCap className="h-3 w-3" />
                <span>{user.program}</span>
              </div>
            )}
            {user.yearLevel && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>Year {user.yearLevel}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <User className="h-3 w-3" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <DropdownMenuItem 
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer group"
          >
            <User className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
            <span className="text-sm font-medium group-hover:text-blue-700 transition-colors">View Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 cursor-pointer group"
          >
            <Settings className="h-4 w-4 text-green-600 group-hover:text-green-700 transition-colors" />
            <span className="text-sm font-medium group-hover:text-green-700 transition-colors">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <DropdownMenuItem 
            onClick={signOut}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 cursor-pointer text-red-600 group"
          >
            <LogOut className="h-4 w-4 group-hover:text-red-700 transition-colors" />
            <span className="text-sm font-medium group-hover:text-red-700 transition-colors">Sign out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Profile Picture Dialog */}
    <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a new profile picture or remove the current one.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Profile Picture Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-gray-200">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile preview" className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-semibold text-2xl">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="profile-picture" className="text-sm font-medium">
                Upload New Picture
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImageClick}
                  disabled={isUploading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-picture"
                />
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>

            {/* Remove Picture Button */}
            {profileImage && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveImage}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Picture
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProfileDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => setIsProfileDialogOpen(false)}
              disabled={isUploading}
            >
              {isUploading ? 'Saving...' : 'Done'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default UserProfile; 