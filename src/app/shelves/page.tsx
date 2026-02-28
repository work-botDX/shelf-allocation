"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface Shelf {
  id: string;
  name: string;
  row: number;
  column: number;
  cellWidth: number;
  cellHeight: number;
}

export default function ShelvesPage() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    row: 3,
    column: 5,
    cellWidth: 30,
    cellHeight: 25,
  });

  useEffect(() => {
    fetchShelves();
  }, []);

  const fetchShelves = async () => {
    try {
      const res = await fetch("/api/shelves");
      const data = await res.json();
      setShelves(data);
    } catch (error) {
      console.error("Failed to fetch shelves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShelf = async () => {
    if (!formData.name) return;

    try {
      const res = await fetch("/api/shelves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const newShelf = await res.json();
      setShelves([...shelves, newShelf]);
      setFormData({
        name: "",
        row: 3,
        column: 5,
        cellWidth: 30,
        cellHeight: 25,
      });
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to create shelf:", error);
    }
  };

  const handleDeleteShelf = async (id: string) => {
    try {
      await fetch(`/api/shelves/${id}`, { method: "DELETE" });
      setShelves(shelves.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete shelf:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">棚管理</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          棚追加
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>新規棚登録</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">棚名 *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="棚名を入力"
                />
              </div>
              <div>
                <label className="text-sm font-medium">段数</label>
                <Input
                  type="number"
                  value={formData.row}
                  onChange={(e) =>
                    setFormData({ ...formData, row: parseInt(e.target.value) || 1 })
                  }
                  placeholder="段数を入力"
                />
              </div>
              <div>
                <label className="text-sm font-medium">列数</label>
                <Input
                  type="number"
                  value={formData.column}
                  onChange={(e) =>
                    setFormData({ ...formData, column: parseInt(e.target.value) || 1 })
                  }
                  placeholder="列数を入力"
                />
              </div>
              <div>
                <label className="text-sm font-medium">セル幅 (cm)</label>
                <Input
                  type="number"
                  value={formData.cellWidth}
                  onChange={(e) =>
                    setFormData({ ...formData, cellWidth: parseInt(e.target.value) || 30 })
                  }
                  placeholder="セル幅を入力"
                />
              </div>
              <div>
                <label className="text-sm font-medium">セル高さ (cm)</label>
                <Input
                  type="number"
                  value={formData.cellHeight}
                  onChange={(e) =>
                    setFormData({ ...formData, cellHeight: parseInt(e.target.value) || 25 })
                  }
                  placeholder="セル高さを入力"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddShelf}>登録</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            読み込み中...
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shelves.map((shelf) => (
            <Card key={shelf.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{shelf.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteShelf(shelf.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  サイズ: {shelf.row}段 × {shelf.column}列
                </p>
                <p className="text-sm text-muted-foreground">
                  セルサイズ: {shelf.cellWidth}cm × {shelf.cellHeight}cm
                </p>
                <div className="mt-4 p-4 border rounded-lg bg-muted/40 overflow-auto">
                  <div
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${shelf.column}, ${Math.min(shelf.cellWidth, 60)}px)`,
                      gridTemplateRows: `repeat(${shelf.row}, ${Math.min(shelf.cellHeight, 40)}px)`,
                    }}
                  >
                    {Array.from({ length: shelf.row * shelf.column }).map((_, i) => (
                      <div
                        key={i}
                        className="border rounded bg-background flex items-center justify-center text-xs text-muted-foreground"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && shelves.length === 0 && !isAdding && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            棚が登録されていません。「棚追加」ボタンから棚を登録してください。
          </CardContent>
        </Card>
      )}
    </div>
  );
}
