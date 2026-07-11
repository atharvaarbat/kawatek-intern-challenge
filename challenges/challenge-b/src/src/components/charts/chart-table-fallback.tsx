import { useState } from "react";
import { TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ChartTableFallbackProps {
  caption: string;
  headers: string[];
  rows: (string | number)[][];
}

export function ChartTableFallback({ caption, headers, rows }: ChartTableFallbackProps) {
  const [visible, setVisible] = useState(false);
  const id = `table-${caption.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="mt-3">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-xs text-muted-foreground print:hidden"
        onClick={() => setVisible((v) => !v)}
        aria-expanded={visible}
        aria-controls={id}
      >
        <TableIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {visible ? "Hide table" : "View as table"}
      </Button>

      <div id={id} className={visible ? "mt-2" : "sr-only"} aria-hidden={!visible}>
        <Table>
          <caption className="sr-only">{caption}</caption>
          <TableHeader>
            <TableRow>
              {headers.map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
