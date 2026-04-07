"use client";

import React, { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Printer, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShoppingItem } from "@/types";

interface ShoppingListProps {
  items: ShoppingItem[];
  isPremium?: boolean;
  className?: string;
}

type SortKey = "plantName" | "quantity" | "unitPrice" | "totalPrice";
type SortDir = "asc" | "desc";

export function ShoppingList({ items, isPremium = false, className }: ShoppingListProps) {
  const [sortKey, setSortKey] = useState<SortKey>("plantName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let av: string | number = a[sortKey] ?? "";
    let bv: string | number = b[sortKey] ?? "";
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    return sortDir === "asc" ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
  });

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  if (items.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full text-center p-8", className)}>
        <div>
          <div className="text-4xl mb-3">🛒</div>
          <p className="text-sm text-muted-foreground font-body">
            Shopping list will appear once your garden plan is generated.
          </p>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className={cn("flex flex-col h-full relative", className)}>
        <div className="p-4 overflow-auto opacity-40 pointer-events-none select-none">
          <table className="w-full text-xs font-body">
            <thead>
              <tr className="border-b border-garden-earth-light">
                <th className="text-left py-2 pr-2 text-muted-foreground font-medium">Plant</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Qty</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Unit</th>
                <th className="text-right py-2 pl-2 text-muted-foreground font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 5).map((item) => (
                <tr key={item.plantName} className="border-b border-garden-earth-light/50">
                  <td className="py-2 pr-2">
                    <span>{item.emoji} {item.plantName}</span>
                  </td>
                  <td className="text-right py-2 px-2">{item.quantity}</td>
                  <td className="text-right py-2 px-2">€{item.unitPrice.toFixed(2)}</td>
                  <td className="text-right py-2 pl-2 font-medium">€{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-garden-cream/70 backdrop-blur-sm">
          <div className="text-center bg-white rounded-2xl border border-garden-earth-light p-6 shadow-lg max-w-xs mx-4">
            <Lock className="w-8 h-8 text-garden-green mx-auto mb-3" />
            <p className="font-semibold text-garden-forest font-body mb-1">Shopping List Locked</p>
            <p className="text-sm text-muted-foreground font-body mb-4">
              Upgrade to Pro to see quantities, prices, and print your shopping list.
            </p>
            <Button variant="garden" size="sm" className="w-full">Upgrade to Pro</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-garden-earth-light flex-shrink-0">
        <p className="text-sm font-semibold text-garden-forest font-body">
          {items.length} plants · Total: <span className="text-garden-green">€{total.toFixed(2)}</span>
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          Print
        </Button>
      </div>

      <div className="flex-1 overflow-auto scrollbar-chat shopping-table">
        <table className="w-full text-sm font-body">
          <thead className="sticky top-0 bg-white border-b border-garden-earth-light z-10">
            <tr>
              <th className="text-left py-2 px-4">
                <button
                  onClick={() => handleSort("plantName")}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-garden-forest"
                >
                  Plant <SortIcon col="plantName" />
                </button>
              </th>
              <th className="text-right py-2 px-2">
                <button
                  onClick={() => handleSort("quantity")}
                  className="flex items-center gap-1 ml-auto text-xs font-semibold text-muted-foreground hover:text-garden-forest"
                >
                  Qty <SortIcon col="quantity" />
                </button>
              </th>
              <th className="text-right py-2 px-2 text-xs font-semibold text-muted-foreground">Unit</th>
              <th className="text-right py-2 px-4">
                <button
                  onClick={() => handleSort("totalPrice")}
                  className="flex items-center gap-1 ml-auto text-xs font-semibold text-muted-foreground hover:text-garden-forest"
                >
                  Total <SortIcon col="totalPrice" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, idx) => (
              <tr
                key={item.plantName}
                className={cn(
                  "border-b border-garden-earth-light/50 hover:bg-garden-cream transition-colors",
                  idx % 2 === 0 ? "bg-white" : "bg-garden-cream/30"
                )}
              >
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <span className="font-medium text-garden-forest">
                        {item.emoji} {item.plantName}
                      </span>
                      {item.variety && (
                        <span className="text-xs text-muted-foreground ml-1">({item.variety})</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="text-right py-2.5 px-2 text-garden-forest">
                  {item.quantity} {item.unit}
                </td>
                <td className="text-right py-2.5 px-2 text-muted-foreground text-xs">
                  €{item.unitPrice.toFixed(2)}
                </td>
                <td className="text-right py-2.5 px-4 font-semibold text-garden-forest">
                  €{item.totalPrice.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-garden-earth bg-garden-cream font-bold">
              <td className="py-3 px-4 text-garden-forest">Total</td>
              <td className="py-3 px-2 text-right text-garden-forest">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </td>
              <td />
              <td className="py-3 px-4 text-right text-garden-green text-base">
                €{total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
