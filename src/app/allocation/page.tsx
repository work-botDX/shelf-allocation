"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Warehouse, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string | null;
  width: number;
  height: number;
}

interface Shelf {
  id: string;
  name: string;
  row: number;
  column: number;
  cellWidth: number;
  cellHeight: number;
  allocations: Allocation[];
}

interface Allocation {
  id: string;
  productId: string;
  shelfId: string;
  row: number;
  column: number;
  product: Product;
}

export default function AllocationPage() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shelvesRes, productsRes] = await Promise.all([
        fetch("/api/shelves"),
        fetch("/api/products"),
      ]);
      const shelvesData = await shelvesRes.json();
      const productsData = await productsRes.json();
      setShelves(shelvesData);
      setProducts(productsData);
      if (shelvesData.length > 0) {
        setSelectedShelf(shelvesData[0]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = async (row: number, column: number) => {
    if (!selectedShelf) return;

    const existingAllocation = selectedShelf.allocations.find(
      (a) => a.row === row && a.column === column
    );

    if (existingAllocation) {
      // 既存の配置を削除
      try {
        await fetch(`/api/allocations/${existingAllocation.id}`, {
          method: "DELETE",
        });
        setSelectedShelf({
          ...selectedShelf,
          allocations: selectedShelf.allocations.filter(
            (a) => !(a.row === row && a.column === column)
          ),
        });
      } catch (error) {
        console.error("Failed to delete allocation:", error);
      }
    } else if (selectedProduct) {
      // 新規配置
      try {
        const res = await fetch("/api/allocations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: selectedProduct,
            shelfId: selectedShelf.id,
            row,
            column,
          }),
        });
        const newAllocation = await res.json();
        setSelectedShelf({
          ...selectedShelf,
          allocations: [...selectedShelf.allocations, newAllocation],
        });
        setSelectedProduct(null);
      } catch (error) {
        console.error("Failed to create allocation:", error);
      }
    } else {
      alert("先に配置する商品を選択してください");
    }
  };

  const getAllocation = (row: number, column: number) => {
    return selectedShelf?.allocations.find(
      (a) => a.row === row && a.column === column
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">商品配置</h2>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            読み込み中...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">商品配置</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 商品選択パネル */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">商品一覧</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">
              配置する商品をクリックで選択
            </p>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                商品が登録されていません
              </p>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProduct === product.id
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                >
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.category || "-"} | {product.width}cm × {product.height}cm
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 棚表示 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              <select
                value={selectedShelf?.id || ""}
                onChange={(e) => {
                  const shelf = shelves.find((s) => s.id === e.target.value);
                  setSelectedShelf(shelf || null);
                }}
                className="border rounded px-2 py-1 bg-background"
              >
                {shelves.map((shelf) => (
                  <option key={shelf.id} value={shelf.id}>
                    {shelf.name}
                  </option>
                ))}
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedShelf ? (
              <div className="overflow-auto">
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${selectedShelf.column}, ${Math.min(selectedShelf.cellWidth, 80)}px)`,
                    gridTemplateRows: `repeat(${selectedShelf.row}, ${Math.min(selectedShelf.cellHeight, 50)}px)`,
                  }}
                >
                  {Array.from({ length: selectedShelf.row }).map((_, rowIndex) =>
                    Array.from({ length: selectedShelf.column }).map((_, colIndex) => {
                      const allocation = getAllocation(rowIndex, colIndex);
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          className={`border rounded flex items-center justify-center text-xs cursor-pointer transition-colors p-1 ${
                            allocation
                              ? "bg-primary/20 border-primary"
                              : "bg-background hover:bg-muted"
                          }`}
                        >
                          {allocation ? (
                            <span className="truncate">{allocation.product.name}</span>
                          ) : (
                            `${rowIndex + 1}-${colIndex + 1}`
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  セルをクリックして選択した商品を配置/削除
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                棚が登録されていません
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 配置状況 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">配置状況</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedShelf && selectedShelf.allocations.length > 0 ? (
            <div className="space-y-2">
              {selectedShelf.allocations.map((allocation) => (
                <div
                  key={allocation.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span>
                    {allocation.product.name} → {selectedShelf.name} (
                    {allocation.row + 1}段目, {allocation.column + 1}列目)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCellClick(allocation.row, allocation.column)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              まだ商品が配置されていません
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
