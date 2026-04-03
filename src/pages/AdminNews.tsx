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

type News = Tables<"news">;

const emptyForm = {
  title: "",
  content: "",
  excerpt: "",
  cover_image_url: "",
  status: "draft" as "draft" | "published" | "cancelled",
};

const AdminNews = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<News[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchNews = async () => {
    const { data } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setArticles(data);
  };

  useEffect(() => { fetchNews(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `news/${Date.now()}.${ext}`;
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
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Titre et contenu requis");
      return;
    }
    setLoading(true);

    const payload: TablesInsert<"news"> = {
      title: form.title.trim(),
      content: form.content.trim(),
      excerpt: form.excerpt.trim() || null,
      cover_image_url: form.cover_image_url || null,
      status: form.status,
      published_at: (form.status as string) === "published" ? new Date().toISOString() : null,
      created_by: user?.id,
    };

    if (editingId) {
      const { error } = await supabase.from("news").update(payload).eq("id", editingId);
      if (error) toast.error("Erreur: " + error.message);
      else toast.success("Article mis à jour !");
    } else {
      const { error } = await supabase.from("news").insert(payload);
      if (error) toast.error("Erreur: " + error.message);
      else toast.success("Article créé !");
    }

    setLoading(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchNews();
  };

  const handleEdit = (article: News) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || "",
      cover_image_url: article.cover_image_url || "",
      status: article.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    await supabase.from("news").delete().eq("id", id);
    toast.success("Article supprimé");
    fetchNews();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Actualités</h1>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
            <Plus size={18} /> Nouvel article
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? "Modifier" : "Créer"} un article</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>
              <X size={18} />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Titre *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={300} />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Extrait</label>
                <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Résumé court..." maxLength={500} />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Contenu *</label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={8} maxLength={50000} />
              </div>

              <div>
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

              <div>
                <label className="text-sm font-medium mb-1 block">Statut</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "draft" | "published" | "cancelled" })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Enregistrement..." : editingId ? "Mettre à jour" : "Publier l'article"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {articles.length === 0 && <p className="text-muted-foreground text-center py-12">Aucun article pour le moment</p>}
        {articles.map((article) => (
          <Card key={article.id}>
            <div className="flex items-start gap-4 p-4">
              {article.cover_image_url && (
                <img src={article.cover_image_url} alt={article.title} className="h-20 w-28 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-lg truncate">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt || article.content.slice(0, 120)}</p>
                  </div>
                  <Badge variant={article.status === "published" ? "default" : "secondary"}>{article.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(article.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)}>
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

export default AdminNews;
