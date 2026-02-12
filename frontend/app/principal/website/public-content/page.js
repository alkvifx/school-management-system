'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { publicContentService } from '@/src/services/publicContent.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Phone, Globe, Target, Image, Megaphone, Users, BookOpen, Award } from 'lucide-react';

export default function PublicContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(null);

  useEffect(() => {
    publicContentService
      .getPublicContent()
      .then((data) => {
        setContent(data);
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to load public content');
      })
      .finally(() => setLoading(false));
  }, []);

  const updateLocal = (section, patch) => {
    setContent((prev) => ({
      ...(prev || {}),
      [section]: {
        ...(prev?.[section] || {}),
        ...patch,
      },
    }));
  };

  const handleSave = async (sectionsPatch) => {
    try {
      setSaving(true);
      const updated = await publicContentService.updatePublicContent(sectionsPatch);
      setContent(updated);
      toast.success('Public content updated');
    } catch (err) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Public Website Content
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-1">
                Edit the content shown on your public-facing website (home, navbar, footer, about,
                academics, gallery, merit students).
              </p>
            </div>
            <Button
              type="button"
              disabled={saving}
              onClick={() =>
                handleSave({
                  navbar: content.navbar,
                  banner: content.banner,
                  stats: content.stats,
                  legacy: content.legacy,
                  principalSection: content.principalSection,
                  announcements: content.announcements,
                  footer: content.footer,
                  academics: content.academics,
                  gallery: content.gallery,
                  merit: content.merit,
                })
              }
              className="flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save All Changes
            </Button>
          </div>

          <Tabs defaultValue="home" className="w-full">
            <TabsList className="flex flex-wrap gap-2 justify-start">
              <TabsTrigger value="home">Home / Banner</TabsTrigger>
              <TabsTrigger value="navbar">Navbar</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
              <TabsTrigger value="academics">Academics</TabsTrigger>
              <TabsTrigger value="merit">Merit Students</TabsTrigger>
            </TabsList>

            <TabsContent value="navbar" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Navbar Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Call us number</Label>
                      <Input
                        value={content.navbar?.callNumber || ''}
                        onChange={(e) =>
                          updateLocal('navbar', { callNumber: e.target.value })
                        }
                        placeholder="+91 123 456 7890"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        Medium
                      </Label>
                      <Input
                        value={content.navbar?.medium || ''}
                        onChange={(e) =>
                          updateLocal('navbar', { medium: e.target.value })
                        }
                        placeholder="English / Hindi / Both"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Affiliation number
                      </Label>
                      <Input
                        value={content.navbar?.affiliationNumber || ''}
                        onChange={(e) =>
                          updateLocal('navbar', { affiliationNumber: e.target.value })
                        }
                        placeholder="Affiliation No."
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave({ navbar: content.navbar })}
                  >
                    Save Navbar
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="home" className="mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-blue-600" />
                      Banner
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Educating since (year)</Label>
                        <Input
                          type="number"
                          value={content.banner?.educatingSince || ''}
                          onChange={(e) =>
                            updateLocal('banner', {
                              educatingSince: Number(e.target.value) || '',
                            })
                          }
                          placeholder="1985"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Primary heading</Label>
                      <Input
                        value={content.banner?.headingPrimary || ''}
                        onChange={(e) =>
                          updateLocal('banner', { headingPrimary: e.target.value })
                        }
                        placeholder="Nurturing Future Leaders"
                      />
                    </div>
                    <div>
                      <Label>Secondary heading</Label>
                      <Input
                        value={content.banner?.headingSecondary || ''}
                        onChange={(e) =>
                          updateLocal('banner', { headingSecondary: e.target.value })
                        }
                        placeholder="Where learning meets excellence"
                      />
                    </div>
                    <div>
                      <Label>Short description</Label>
                      <Textarea
                        rows={3}
                        value={content.banner?.description || ''}
                        onChange={(e) =>
                          updateLocal('banner', { description: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSave({ banner: content.banner })}
                    >
                      Save Banner
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Years of Excellence</Label>
                        <Input
                          value={content.stats?.yearsOfExcellence || ''}
                          onChange={(e) =>
                            setContent((prev) => ({
                              ...(prev || {}),
                              stats: {
                                ...(prev?.stats || {}),
                                yearsOfExcellence: e.target.value,
                              },
                            }))
                          }
                          placeholder="40+"
                        />
                      </div>
                      <div>
                        <Label>Number of Students</Label>
                        <Input
                          value={content.stats?.studentsCount || ''}
                          onChange={(e) =>
                            setContent((prev) => ({
                              ...(prev || {}),
                              stats: {
                                ...(prev?.stats || {}),
                                studentsCount: e.target.value,
                              },
                            }))
                          }
                          placeholder="2500+"
                        />
                      </div>
                      <div>
                        <Label>Number of Teachers</Label>
                        <Input
                          value={content.stats?.teachersCount || ''}
                          onChange={(e) =>
                            setContent((prev) => ({
                              ...(prev || {}),
                              stats: {
                                ...(prev?.stats || {}),
                                teachersCount: e.target.value,
                              },
                            }))
                          }
                          placeholder="150+"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSave({ stats: content.stats })}
                    >
                      Save Stats
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="announcements" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-blue-600" />
                    Announcements & News
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Edit the list of public announcements shown on the home page and Notices
                    section. For now, you can update text directly; date changes require re-entry.
                  </p>
                  {content.announcements?.map((a, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-3 space-y-2 bg-white"
                    >
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={a.title}
                            onChange={(e) => {
                              const next = [...content.announcements];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setContent((prev) => ({ ...(prev || {}), announcements: next }));
                            }}
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Input
                            value={a.type}
                            onChange={(e) => {
                              const next = [...content.announcements];
                              next[idx] = { ...next[idx], type: e.target.value };
                              setContent((prev) => ({ ...(prev || {}), announcements: next }));
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          rows={2}
                          value={a.description}
                          onChange={(e) => {
                            const next = [...content.announcements];
                            next[idx] = { ...next[idx], description: e.target.value };
                            setContent((prev) => ({ ...(prev || {}), announcements: next }));
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      handleSave({
                        announcements: content.announcements,
                      })
                    }
                  >
                    Save Announcements
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="footer" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Footer Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Two-line description</Label>
                    <Textarea
                      rows={3}
                      value={(content.footer?.descriptionLines || []).join('\n')}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...(prev || {}),
                          footer: {
                            ...(prev?.footer || {}),
                            descriptionLines: e.target.value.split('\n'),
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Location label</Label>
                      <Input
                        value={content.footer?.locationLabel || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...(prev || {}),
                            footer: {
                              ...(prev?.footer || {}),
                              locationLabel: e.target.value,
                            },
                          }))
                        }
                        placeholder="View on Google Maps"
                      />
                    </div>
                    <div>
                      <Label>Location (Google Maps link)</Label>
                      <Input
                        value={content.footer?.locationUrl || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...(prev || {}),
                            footer: {
                              ...(prev?.footer || {}),
                              locationUrl: e.target.value,
                            },
                          }))
                        }
                        placeholder="https://www.google.com/maps/..."
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Public email</Label>
                      <Input
                        value={content.footer?.email || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...(prev || {}),
                            footer: {
                              ...(prev?.footer || {}),
                              email: e.target.value,
                            },
                          }))
                        }
                        placeholder="school@mail.edu"
                      />
                    </div>
                    <div>
                      <Label>Working hours (weekdays)</Label>
                      <Input
                        value={content.footer?.workingHours?.weekdays || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...(prev || {}),
                            footer: {
                              ...(prev?.footer || {}),
                              workingHours: {
                                ...(prev?.footer?.workingHours || {}),
                                weekdays: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Working hours (Saturday)</Label>
                      <Input
                        value={content.footer?.workingHours?.saturday || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...(prev || {}),
                            footer: {
                              ...(prev?.footer || {}),
                              workingHours: {
                                ...(prev?.footer?.workingHours || {}),
                                saturday: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Working hours (Sunday)</Label>
                      <Input
                        value={content.footer?.workingHours?.sunday || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...(prev || {}),
                            footer: {
                              ...(prev?.footer || {}),
                              workingHours: {
                                ...(prev?.footer?.workingHours || {}),
                                sunday: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Facebook URL</Label>
                      <Input
                        value={content.footer?.social?.facebook || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...(prev || {}),
                            footer: {
                              ...(prev?.footer || {}),
                              social: {
                                ...(prev?.footer?.social || {}),
                                facebook: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Twitter URL</Label>
                      <Input
                        value={content.footer?.social?.twitter || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...(prev || {}),
                            footer: {
                              ...(prev?.footer || {}),
                              social: {
                                ...(prev?.footer?.social || {}),
                                twitter: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Instagram URL</Label>
                      <Input
                        value={content.footer?.social?.instagram || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...(prev || {}),
                            footer: {
                              ...(prev?.footer || {}),
                              social: {
                                ...(prev?.footer?.social || {}),
                                instagram: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>YouTube URL</Label>
                      <Input
                        value={content.footer?.social?.youtube || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...(prev || {}),
                            footer: {
                              ...(prev?.footer || {}),
                              social: {
                                ...(prev?.footer?.social || {}),
                                youtube: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave({ footer: content.footer })}
                  >
                    Save Footer
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Academics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Board</Label>
                    <Input
                      value={content.academics?.board || ''}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...(prev || {}),
                          academics: {
                            ...(prev?.academics || {}),
                            board: e.target.value,
                          },
                        }))
                      }
                      placeholder="CBSE / MP_BOARD"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Primary (I–V) age limit</Label>
                      <Input
                        value={content.academics?.primary?.ageLimit || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...(prev || {}),
                            academics: {
                              ...(prev?.academics || {}),
                              primary: {
                                ...(prev?.academics?.primary || {}),
                                ageLimit: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Primary daily class hours</Label>
                      <Input
                        value={content.academics?.primary?.dailyHours || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...(prev || {}),
                            academics: {
                              ...(prev?.academics || {}),
                              primary: {
                                ...(prev?.academics?.primary || {}),
                                dailyHours: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave({ academics: content.academics })}
                  >
                    Save Academics
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="merit" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    Merit Students
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    For now, you can manage merit students data through the developer seed or
                    direct database edits. This section is wired for future UI expansion.
                  </p>
                  <Button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave({ merit: content.merit })}
                  >
                    Save Merit Data
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}

