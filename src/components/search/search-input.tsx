'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useFilterStore } from '@/stores/filter-store';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SearchInput() {
  const { search, setSearch } = useFilterStore();
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 600);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="搜索提示词..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="pl-9 pr-8"
      />
      {localSearch && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
          onClick={() => {
            setLocalSearch('');
            setSearch('');
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
