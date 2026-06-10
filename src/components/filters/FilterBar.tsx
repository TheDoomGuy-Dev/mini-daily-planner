import { useMemo } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import SearchBar from './SearchBar';
import { Button } from '../ui/button';
import { getAllCategories } from '../../utils/taskUtils';

export default function FilterBar() {
  const { state, dispatch } = useTasks();
  const { filter } = state;

  const categories = useMemo(
    () => getAllCategories(state.tasks),
    [state.tasks],
  );

  const hasActiveFilters =
    filter.status !== 'all' ||
    filter.priority !== 'all' ||
    filter.category !== 'all' ||
    filter.searchQuery !== '';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchBar
        value={filter.searchQuery}
        onChange={(value) => dispatch({ type: 'SET_SEARCH', payload: value })}
      />
      <Select
        value={filter.status}
        onValueChange={(value: 'all' | 'active' | 'completed') =>
          dispatch({ type: 'SET_FILTER', payload: { status: value } })
        }
      >
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filter.priority}
        onValueChange={(value: 'all' | 'high' | 'medium' | 'low') =>
          dispatch({ type: 'SET_FILTER', payload: { priority: value } })
        }
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filter.category}
        onValueChange={(value: string) =>
          dispatch({ type: 'SET_FILTER', payload: { category: value } })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
          className="text-xs"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
