"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string | null;
  width: number;
  height: number;
  barcode: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    width: 0,
    height: 0,
    barcode: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.name) return;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const newProduct = await res.json();
      setProducts([...products, newProduct]);
      setFormData({ name: "", category: "", width: 0, height: 0, barcode: "" });
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">商品管理</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          商品追加
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>新規商品登録</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">商品名 *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="商品名を入力"
                />
              </div>
              <div>
                <label className="text-sm font-medium">カテゴリ</label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="カテゴリを入力"
                />
              </div>
              <div>
                <label className="text-sm font-medium">幅 (cm)</label>
                <Input
                  type="number"
                  value={formData.width}
                  onChange={(e) =>
                    setFormData({ ...formData, width: parseInt(e.target.value) || 0 })
                  }
                  placeholder="幅を入力"
                />
              </div>
              <div>
                <label className="text-sm font-medium">高さ (cm)</label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: parseInt(e.target.value) || 0 })
                  }
                  placeholder="高さを入力"
                />
              </div>
              <div>
                <label className="text-sm font-medium">バーコード</label>
                <Input
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  placeholder="バーコードを入力"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddProduct}>登録</Button>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  カテゴリ: {product.category || "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  サイズ: {product.width}cm × {product.height}cm
                </p>
                {product.barcode && (
                  <p className="text-sm text-muted-foreground">
                    バーコード: {product.barcode}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && !isAdding && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            商品が登録されていません。「商品追加」ボタンから商品を登録してください。
          </CardContent>
        </Card>
      )}
    </div>
  );
}
