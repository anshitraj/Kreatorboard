"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

interface StartupProfile {
  name: string;
  bio: string;
  website: string;
  logo_url: string;
}

export default function StartupProfile() {
  const [form, setForm] = useState<StartupProfile>({
    name: "",
    bio: "",
    website: "",
    logo_url: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const uid = session?.user?.id;

        if (!uid) {
          setError("No user session found");
          return;
        }

        setUserId(uid);

        const { data, error } = await supabase
          .from("startups")
          .select("*")
          .eq("id", uid)
          .single();

        if (error) throw error;
        if (data) {
          setForm(data);
          if (data.logo_url) {
            setPreviewUrl(data.logo_url);
          }
        }
      } catch (err) {
        setError("Failed to load profile");
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo size must be less than 2MB");
        return;
      }

      setLogoFile(file);
      setError(null);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let logoUrl = form.logo_url;

      if (logoFile && userId) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("startup-logos")
          .upload(fileName, logoFile, {
            upsert: true,
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("startup-logos")
          .getPublicUrl(fileName);

        logoUrl = urlData.publicUrl;
      }

      const { error: updateError } = await supabase.from("startups").upsert({
        id: userId,
        ...form,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setLogoFile(null);
    } catch (err) {
      setError("Failed to update profile");
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Startup Profile</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your company name"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://yourcompany.com"
              type="url"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell us about your startup"
              rows={4}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload a square image (max 2MB)
            </p>
          </div>

          {previewUrl && (
            <div className="mt-2">
              <img
                src={previewUrl}
                alt="Company Logo Preview"
                className="w-32 h-32 object-cover rounded-lg border shadow-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
