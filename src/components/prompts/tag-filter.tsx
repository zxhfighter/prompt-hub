'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2, PlusCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useFilterStore } from '@/stores/filter-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Tag {
  id: string;
  name: string;
  color: string;
}

export function TagFilter() {
  const { tagIds, setTagIds } = useFilterStore();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/tags');
        const result = await response.json();
        if (result.data) {
          setTags(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        toast.error('获取标签失败');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch when opening popover or initially if needed
    fetchTags();
  }, []);

  const selectedTags = tags.filter((tag) => tagIds.includes(tag.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          标签
          {selectedTags.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedTags.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedTags.length > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedTags.length} 已选
                  </Badge>
                ) : (
                  selectedTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {tag.name}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="搜索标签..." />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                '未找到标签'
              )}
            </CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => {
                const isSelected = tagIds.includes(tag.id);
                return (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => {
                      if (isSelected) {
                        setTagIds(tagIds.filter((id) => id !== tag.id));
                      } else {
                        setTagIds([...tagIds, tag.id]);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <span 
                      className="w-2 h-2 rounded-full mr-2" 
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedTags.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setTagIds([])}
                    className="justify-center text-center"
                  >
                    清除筛选
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
