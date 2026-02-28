"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Warehouse, LayoutGrid } from "lucide-react";

interface Stats {
  productCount: number;
  shelfCount: number;
  allocationCount: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    productCount: 0,
    shelfCount: 0,
    allocationCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, shelvesRes, allocationsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/shelves"),
        fetch("/api/allocations"),
      ]);
      const products = await productsRes.json();
      const shelves = await shelvesRes.json();
      const allocations = await allocationsRes.json();

      setStats({
        productCount: products.length,
        shelfCount: shelves.length,
        allocationCount: allocations.length,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ダッシュボード</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">登録商品数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.productCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.productCount === 0
                ? "商品が登録されていません"
                : "商品が登録されています"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">登録棚数</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.shelfCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.shelfCount === 0
                ? "棚が登録されていません"
                : "棚が登録されています"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">配置済み商品</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.allocationCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.allocationCount === 0
                ? "商品が配置されていません"
                : "商品が配置されています"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>使い方</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            1. 「商品管理」から商品を登録してください
          </p>
          <p className="text-sm text-muted-foreground">
            2. 「棚管理」から棚を作成してください
          </p>
          <p className="text-sm text-muted-foreground">
            3. 「商品配置」で棚に商品を割り当ててください
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
