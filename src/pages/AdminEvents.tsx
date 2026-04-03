import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Event = Tables<"events">;

const EVENT_TYPES = ["workshop", "networking", "masterclass", "meetup", "conference", "webinar"] as const;
const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
const STATUSES = ["draft", "published", "cancelled"] as const;

type EventType = "workshop" | "networking" | "masterclass" | "meetup" | "conference" | "webinar";
type ContentStatus = "draft" | "published" | "cancelled";
type DifficultyLevel = "beginner" | "intermediate" | "advanced";

const emptyForm = {
  name: "",
  event_type: "meetup" as EventType,
  date: "",
  start_time: "",
  end_time: "",
  location: "",
  address: "",
  description: "",
  programme: "",
  what_you_learn: [] as string[],
  cover_image_url: "",
  price_type: "free",
  price_amount: null as number | null,
  member_price: null as number | null,
  total_places: 50,
  spots_left: 50,
  target_audience: [] as string[],
  difficulty: null as DifficultyLevel | null,
  registration_deadline: "",
  cta_text: "Réserver ma place",
  organizer_name: "La Bulle",
  is_recurring: false,
  recurrence_info: "",
  status: "draft" as ContentStatus,
};

const AdminEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [learningInput, setLearningInput] = useState("");
  const [audienceInput, setAudienceInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });
    if (data) setEvents(data);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `events/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast.error("Erreur lors de l'upload");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setForm({ ...form, cover_image_url: data.publicUrl });
    setUploading(false);
    toast.success("Image uploadée !");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date || !form.start_time || !form.location.trim() || !form.description.trim()) {
      toast.error("Remplissez les champs obligatoires");
      return;
    }
    setLoading(true);

    const payload: TablesInsert<"events"> = {
      name: form.name.trim(),
      event_type: form.event_type,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time || null,
      location: form.location.trim(),
      address: form.address.trim() || null,
      description: form.description.trim(),
      programme: form.programme.trim() || null,
      what_you_learn: form.what_you_learn.length > 0 ? form.what_you_learn : null,
      cover_image_url: form.cover_image_url || null,
      price_type: form.price_type,
      price_amount: form.price_amount,
      member_price: form.member_price,
      total_places: form.total_places,
      spots_left: editingId ? form.spots_left : form.total_places,
      target_audience: form.target_audience.length > 0 ? form.target_audience : null,
      difficulty: form.difficulty,
      registration_deadline: form.registration_deadline || null,
      cta_text: form.cta_text || "Réserver ma place",
      organizer_name: form.organizer_name || "La Bulle",
      is_recurring: form.is_recurring,
      recurrence_info: form.recurrence_info || null,
      status: form.status,
      created_by: user?.id,
    };

    if (editingId) {
      const { error } = await supabase.from("events").update(payload).eq("id", editingId);
      if (error) toast.error("Erreur: " + error.message);
      else toast.success("Événement mis à jour !");
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) toast.error("Erreur: " + error.message);
      else toast.success("Événement créé !");
    }

    setLoading(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchEvents();
  };

  const handleEdit = (ev: Event) => {
    setEditingId(ev.id);
    setForm({
      name: ev.name,
      event_type: ev.event_type,
      date: ev.date,
      start_time: ev.start_time,
      end_time: ev.end_time || "",
      location: ev.location,
      address: ev.address || "",
      description: ev.description,
      programme: ev.programme || "",
      what_you_learn: ev.what_you_learn || [],
      cover_image_url: ev.cover_image_url || "",
      price_type: ev.price_type,
      price_amount: ev.price_amount,
      member_price: ev.member_price,
      total_places: ev.total_places,
      spots_left: ev.spots_left,
      target_audience: ev.target_audience || [],
      difficulty: ev.difficulty,
      registration_deadline: ev.registration_deadline ? ev.registration_deadline.split("T")[0] : "",
      cta_text: ev.cta_text || "Réserver ma place",
      organizer_name: ev.organizer_name || "La Bulle",
      is_recurring: ev.is_recurring || false,
      recurrence_info: ev.recurrence_info || "",
      status: ev.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    await supabase.from("events").delete().eq("id", id);
    toast.success("Événement supprimé");
    fetchEvents();
  };

  const statusColor = (s: string) => {
    if (s === "published") return "default";
    if (s === "cancelled") return "destructive";
    return "secondary";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Événements</h1>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
            <Plus size={18} /> Nouvel événement
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? "Modifier" : "Créer"} un événement</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>
              <X size={18} />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Nom de l'événement *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={200} />
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v as EventType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium mb-1 block">Statut</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ContentStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div>
                <label className="text-sm font-medium mb-1 block">Date *</label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>

              {/* Start time */}
              <div>
                <label className="text-sm font-medium mb-1 block">Heure de début *</label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
              </div>

              {/* End time */}
              <div>
                <label className="text-sm font-medium mb-1 block">Heure de fin</label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium mb-1 block">Lieu *</label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required maxLength={200} />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Adresse</label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} maxLength={300} />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Description *</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4} maxLength={5000} />
              </div>

              {/* Programme */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Programme</label>
                <Textarea value={form.programme} onChange={(e) => setForm({ ...form, programme: e.target.value })} rows={3} maxLength={5000} />
              </div>

              {/* What you'll learn */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Ce que vous apprendrez</label>
                <div className="flex gap-2 mb-2">
                  <Input value={learningInput} onChange={(e) => setLearningInput(e.target.value)} placeholder="Ajoutez un point..." maxLength={200} />
                  <Button type="button" variant="secondary" onClick={() => {
                    if (learningInput.trim()) {
                      setForm({ ...form, what_you_learn: [...form.what_you_learn, learningInput.trim()] });
                      setLearningInput("");
                    }
                  }}>+</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.what_you_learn.map((item, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setForm({ ...form, what_you_learn: form.what_you_learn.filter((_, idx) => idx !== i) })}>
                      {item} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cover image */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Image de couverture</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg cursor-pointer hover:opacity-90 text-sm">
                    <Upload size={16} />
                    {uploading ? "Upload..." : "Choisir une image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  {form.cover_image_url && (
                    <img src={form.cover_image_url} alt="preview" className="h-16 w-24 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-sm font-medium mb-1 block">Tarification</label>
                <Select value={form.price_type} onValueChange={(v) => setForm({ ...form, price_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuit</SelectItem>
                    <SelectItem value="paid">Payant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.price_type === "paid" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Prix (€)</label>
                    <Input type="number" min={0} step={0.01} value={form.price_amount ?? ""} onChange={(e) => setForm({ ...form, price_amount: e.target.value ? parseFloat(e.target.value) : null })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Prix membre (€)</label>
                    <Input type="number" min={0} step={0.01} value={form.member_price ?? ""} onChange={(e) => setForm({ ...form, member_price: e.target.value ? parseFloat(e.target.value) : null })} />
                  </div>
                </>
              )}

              {/* Places */}
              <div>
                <label className="text-sm font-medium mb-1 block">Places totales</label>
                <Input type="number" min={1} value={form.total_places} onChange={(e) => setForm({ ...form, total_places: parseInt(e.target.value) || 1 })} />
              </div>

              {editingId && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Places restantes</label>
                  <Input type="number" min={0} value={form.spots_left} onChange={(e) => setForm({ ...form, spots_left: parseInt(e.target.value) || 0 })} />
                </div>
              )}

              {/* Difficulty */}
              <div>
                <label className="text-sm font-medium mb-1 block">Niveau</label>
                <Select value={form.difficulty || "none"} onValueChange={(v) => setForm({ ...form, difficulty: v === "none" ? null : v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Non spécifié</SelectItem>
                    {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Target audience */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Public cible</label>
                <div className="flex gap-2 mb-2">
                  <Input value={audienceInput} onChange={(e) => setAudienceInput(e.target.value)} placeholder="ex: Freelancers, Startups..." maxLength={100} />
                  <Button type="button" variant="secondary" onClick={() => {
                    if (audienceInput.trim()) {
                      setForm({ ...form, target_audience: [...form.target_audience, audienceInput.trim()] });
                      setAudienceInput("");
                    }
                  }}>+</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.target_audience.map((item, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setForm({ ...form, target_audience: form.target_audience.filter((_, idx) => idx !== i) })}>
                      {item} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Registration deadline */}
              <div>
                <label className="text-sm font-medium mb-1 block">Date limite d'inscription</label>
                <Input type="date" value={form.registration_deadline} onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })} />
              </div>

              {/* CTA */}
              <div>
                <label className="text-sm font-medium mb-1 block">Texte du bouton CTA</label>
                <Input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} maxLength={50} />
              </div>

              {/* Recurring */}
              <div className="md:col-span-2 flex items-center gap-3">
                <input type="checkbox" checked={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })} className="h-4 w-4" />
                <label className="text-sm font-medium">Événement récurrent</label>
                {form.is_recurring && (
                  <Input value={form.recurrence_info} onChange={(e) => setForm({ ...form, recurrence_info: e.target.value })} placeholder="ex: Tous les vendredis à 18h" className="ml-4 flex-1" maxLength={200} />
                )}
              </div>

              {/* Submit */}
              <div className="md:col-span-2 flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer l'événement"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Events list */}
      <div className="space-y-3">
        {events.length === 0 && <p className="text-muted-foreground text-center py-12">Aucun événement pour le moment</p>}
        {events.map((ev) => (
          <Card key={ev.id} className="overflow-hidden">
            <div className="flex items-start gap-4 p-4">
              {ev.cover_image_url && (
                <img src={ev.cover_image_url} alt={ev.name} className="h-20 w-28 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-lg truncate">{ev.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ev.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} • {ev.start_time?.slice(0, 5)} • {ev.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={statusColor(ev.status)}>{ev.status}</Badge>
                    <Badge variant="outline">{ev.event_type}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{ev.spots_left}/{ev.total_places} places</span>
                  <span>{ev.price_type === "free" ? "Gratuit" : `${ev.price_amount}€`}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(ev)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(ev.id)}>
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminEvents;
