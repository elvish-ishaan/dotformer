import { Request, Response } from 'express';
import { hashPassword, comparePassword } from '../utils/auth/password';
import prisma from '../lib/prisma';

/**
 * Update user profile information
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // User should be attached to request by auth middleware
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }

    const { name, email, bio, username } = req.body;

    // Validate email if it's being updated
    if (email) {
      // Check if the email is already in use by another user
      const existingUser = await prisma.user.findFirst({
        where: { 
          email,
          NOT: {
            id: req.user.userId
          }
        }
      });

      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          error: 'Email is already in use' 
        });
      }
    }

    // Validate username if it's being updated
    if (username) {
      // Check if the username is already in use by another user
      const existingUser = await prisma.user.findFirst({
        where: { 
          username,
          NOT: {
            id: req.user.userId
          }
        }
      });

      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          error: 'Username is already in use' 
        });
      }
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(bio && { bio }),
        ...(username && { username })
      }
    });

    // Return the updated user data (excluding password)
    return res.status(200).json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        bio: updatedUser.bio,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update profile' 
    });
  }
};

/**
 * Update user password
 */
export const updatePassword = async (req: Request, res: Response) => {
  try {
    // User should be attached to request by auth middleware
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password and new password are required' 
      });
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword }
    });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update password' 
    });
  }
}; 