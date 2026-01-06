'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, Loader2, CheckCircle, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resumeApi, profileApi } from '@/lib/api';

interface Experience {
  title: string;
  company: string;
  start_date: string | null;
  end_date: string | null;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string | null;
  graduation_date: string | null;
}

interface ResumeData {
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  summary: string | null;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

export default function ResumeUploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ResumeData | null>(null);
  const [editedData, setEditedData] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    skills: true,
    experience: true,
    education: true,
  });

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
        setEditedData({
          ...response.data,
          skills: response.data.skills || [],
          experience: response.data.experience || [],
          education: response.data.education || [],
        });
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
    setError(null);

    try {
      // Create profile with verified resume data
      await profileApi.create({
        name: 'Default',
        resume_data: editedData,
      });
      router.push('/app/onboarding/config');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Skills handlers
  const addSkill = () => {
    if (!editedData) return;
    setEditedData({ ...editedData, skills: [...editedData.skills, ''] });
  };

  const updateSkill = (index: number, value: string) => {
    if (!editedData) return;
    const newSkills = [...editedData.skills];
    newSkills[index] = value;
    setEditedData({ ...editedData, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    if (!editedData) return;
    setEditedData({ ...editedData, skills: editedData.skills.filter((_, i) => i !== index) });
  };

  // Experience handlers
  const addExperience = () => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      experience: [
        ...editedData.experience,
        { title: '', company: '', start_date: '', end_date: '', description: '' },
      ],
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    if (!editedData) return;
    const newExp = [...editedData.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setEditedData({ ...editedData, experience: newExp });
  };

  const removeExperience = (index: number) => {
    if (!editedData) return;
    setEditedData({ ...editedData, experience: editedData.experience.filter((_, i) => i !== index) });
  };

  // Education handlers
  const addEducation = () => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      education: [
        ...editedData.education,
        { institution: '', degree: '', field: '', graduation_date: '' },
      ],
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    if (!editedData) return;
    const newEdu = [...editedData.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setEditedData({ ...editedData, education: newEdu });
  };

  const removeEducation = (index: number) => {
    if (!editedData) return;
    setEditedData({ ...editedData, education: editedData.education.filter((_, i) => i !== index) });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
        <div className="w-16 h-1 bg-muted self-center" />
        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">2</div>
        <div className="w-16 h-1 bg-muted self-center" />
        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">3</div>
      </div>

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
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Resume parsed! Please verify the information below.</span>
              </div>

              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={editedData?.full_name || ''}
                    onChange={(e) => setEditedData({ ...editedData!, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editedData?.email || ''}
                    onChange={(e) => setEditedData({ ...editedData!, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editedData?.phone || ''}
                    onChange={(e) => setEditedData({ ...editedData!, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={editedData?.location || ''}
                    onChange={(e) => setEditedData({ ...editedData!, location: e.target.value })}
                  />
                </div>
              </div>

              {/* Skills Section */}
              <div className="border rounded-lg">
                <button
                  className="w-full p-4 flex justify-between items-center hover:bg-muted/50"
                  onClick={() => toggleSection('skills')}
                >
                  <span className="font-medium">Skills ({editedData?.skills.length || 0})</span>
                  {expandedSections.skills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedSections.skills && (
                  <div className="p-4 pt-0 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {editedData?.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
                          <Input
                            value={skill}
                            onChange={(e) => updateSkill(index, e.target.value)}
                            className="h-7 w-28 text-sm bg-transparent border-0 p-0 focus-visible:ring-0"
                          />
                          <button onClick={() => removeSkill(index)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={addSkill}>
                      <Plus className="h-3 w-3 mr-1" /> Add Skill
                    </Button>
                  </div>
                )}
              </div>

              {/* Experience Section */}
              <div className="border rounded-lg">
                <button
                  className="w-full p-4 flex justify-between items-center hover:bg-muted/50"
                  onClick={() => toggleSection('experience')}
                >
                  <span className="font-medium">Experience ({editedData?.experience.length || 0})</span>
                  {expandedSections.experience ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedSections.experience && (
                  <div className="p-4 pt-0 space-y-4">
                    {editedData?.experience.map((exp, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Position {index + 1}</span>
                          <button onClick={() => removeExperience(index)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Job Title"
                            value={exp.title}
                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                          />
                          <Input
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          />
                          <Input
                            placeholder="Start Date"
                            value={exp.start_date || ''}
                            onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                          />
                          <Input
                            placeholder="End Date"
                            value={exp.end_date || ''}
                            onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                          />
                        </div>
                        <textarea
                          placeholder="Description"
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          className="w-full p-2 rounded-md border text-sm min-h-[60px]"
                        />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addExperience}>
                      <Plus className="h-3 w-3 mr-1" /> Add Experience
                    </Button>
                  </div>
                )}
              </div>

              {/* Education Section */}
              <div className="border rounded-lg">
                <button
                  className="w-full p-4 flex justify-between items-center hover:bg-muted/50"
                  onClick={() => toggleSection('education')}
                >
                  <span className="font-medium">Education ({editedData?.education.length || 0})</span>
                  {expandedSections.education ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedSections.education && (
                  <div className="p-4 pt-0 space-y-4">
                    {editedData?.education.map((edu, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Education {index + 1}</span>
                          <button onClick={() => removeEducation(index)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Institution"
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          />
                          <Input
                            placeholder="Degree"
                            value={edu.degree || ''}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          />
                          <Input
                            placeholder="Field of Study"
                            value={edu.field || ''}
                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                          />
                          <Input
                            placeholder="Graduation Year"
                            value={edu.graduation_date || ''}
                            onChange={(e) => updateEducation(index, 'graduation_date', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addEducation}>
                      <Plus className="h-3 w-3 mr-1" /> Add Education
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
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
