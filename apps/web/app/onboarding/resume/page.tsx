'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, Loader2, CheckCircle, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resumeApi } from '@/lib/api';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';

interface ResumeData {
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  summary: string | null;
  skills: string[];
}

export default function ResumeUploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ResumeData | null>(null);
  const [editedData, setEditedData] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);

      const response = await resumeApi.upload(formData);

      if (response.success) {
        setParsedData(response.data);
        setEditedData(response.data);
      } else {
        setError(response.error || 'Failed to parse resume');
      }
    } catch (err) {
      setError('Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const handleSave = async () => {
    if (!editedData) return;

    setIsSaving(true);
    try {
      await resumeApi.verify({ resume_data: editedData });
      router.push('/onboarding/config');
    } catch (err) {
      setError('Failed to save resume. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkillChange = (index: number, value: string) => {
    if (!editedData) return;
    const newSkills = [...editedData.skills];
    newSkills[index] = value;
    setEditedData({ ...editedData, skills: newSkills });
  };

  const addSkill = () => {
    if (!editedData) return;
    setEditedData({ ...editedData, skills: [...editedData.skills, ''] });
  };

  const removeSkill = (index: number) => {
    if (!editedData) return;
    const newSkills = editedData.skills.filter((_, i) => i !== index);
    setEditedData({ ...editedData, skills: newSkills });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <OnboardingProgress currentStep={1} />

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
          <CardDescription>
            We&apos;ll extract your skills and experience to match you with the best jobs
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!parsedData ? (
            <>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <p className="text-lg font-medium">Analyzing your resume...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium">
                          {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          or click to browse • PDF, DOCX, or TXT
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Resume parsed successfully!</span>
              </div>

              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editedData?.full_name || ''}
                      onChange={(e) =>
                        setEditedData({ ...editedData!, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedData?.email || ''}
                      onChange={(e) =>
                        setEditedData({ ...editedData!, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editedData?.phone || ''}
                      onChange={(e) =>
                        setEditedData({ ...editedData!, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editedData?.location || ''}
                      onChange={(e) =>
                        setEditedData({ ...editedData!, location: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Skills</Label>
                    <Button variant="ghost" size="sm" onClick={addSkill}>
                      + Add Skill
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editedData?.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Input
                          value={skill}
                          onChange={(e) => handleSkillChange(index, e.target.value)}
                          className="w-36 h-8 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeSkill(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setParsedData(null);
                    setEditedData(null);
                  }}
                >
                  Upload Different Resume
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Continue to Search Config'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
