"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchUserProfile } from "@/lib/redux/slices/authSlice";
import ImageTransformer from "@/components/ImageTransformer";

export default function TransformPage() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  // Fetch user profile if we have a token but no user data
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token, user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Image Transformer</h1>
        <p className="text-muted-foreground">
          Transform your images with various parameters and get a permanent URL for use in your applications.
        </p>
      </div>
      
      <ImageTransformer />
      
      <div className="bg-muted p-4 rounded-md mt-6">
        <h3 className="font-medium mb-2">How it works</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Upload an image using the file uploader on the left</li>
          <li>Adjust transformation parameters like width, height, format, and quality</li>
          <li>See the transformed image preview in real-time</li>
          <li>Copy the permanent URL to use in your applications</li>
          <li>The transformed image is stored permanently and can be accessed via the URL</li>
        </ul>
      </div>
    </div>
  );
} 