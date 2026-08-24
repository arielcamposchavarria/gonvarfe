import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface DateRangeFilterProps {
  from?: string;
  to?: string;
}

/** Filtro de fecha desde/hasta vía GET; funciona sin JavaScript. */
export function DateRangeFilter({ from, to }: DateRangeFilterProps) {
  return (
    <form method="GET" className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <Label htmlFor="from">Desde</Label>
        <Input id="from" name="from" type="date" defaultValue={from} className="w-40" />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="to">Hasta</Label>
        <Input id="to" name="to" type="date" defaultValue={to} className="w-40" />
      </div>
      <Button type="submit" variant="outline" size="sm">
        Filtrar
      </Button>
      {(from || to) && (
        <Button asChild variant="ghost" size="sm">
          <a href="?">Limpiar</a>
        </Button>
      )}
    </form>
  );
}
