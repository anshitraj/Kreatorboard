"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

interface ProfileForm {
  full_name: string;
  bio: string;
  instagram: string;
  youtube: string;
  media_kit_url: string;
}

export default function InfluencerProfile() {
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    bio: "",
    instagram: "",
    youtube: "",
    media_kit_url: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const id = session?.user?.id;
        if (!id) {
          setError("No user session found");
          return;
        }
        setUserId(id);

        const { data, error } = await supabase
          .from("influencers")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) setForm(data);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Validate file type
      if (!selectedFile.type.match(/^(application\/pdf|image\/.*)$/)) {
        setError("Please upload a PDF or image file");
        return;
      }
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let mediaUrl = form.media_kit_url;

      if (file && userId) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("media-kits")
          .upload(fileName, file, {
            upsert: true,
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("media-kits")
          .getPublicUrl(fileName);

        mediaUrl = urlData.publicUrl;
      }

      const { error: updateError } = await supabase.from("influencers").upsert({
        id: userId,
        ...form,
        media_kit_url: mediaUrl,
        updated_at: new Date().toISOString(),
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setFile(null);
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
        <h1 className="text-2xl font-bold mb-6">Influencer Profile</h1>

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

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
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
              placeholder="Tell us about yourself"
              rows={4}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram URL
            </label>
            <input
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/yourusername"
              type="url"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube URL
            </label>
            <input
              name="youtube"
              value={form.youtube}
              onChange={handleChange}
              placeholder="https://youtube.com/@yourchannel"
              type="url"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Media Kit
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload a PDF or image file (max 5MB)
            </p>
          </div>

          {form.media_kit_url && (
            <div className="mt-2">
              <a
                href={form.media_kit_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View Current Media Kit
              </a>
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
