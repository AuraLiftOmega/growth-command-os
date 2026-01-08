/**
 * Draggable Widget Grid
 * Customizable dashboard with drag-and-drop widgets
 */

import { useState, useCallback } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  X,
  Plus,
  Save,
  RotateCcw,
  Eye,
  DollarSign,
  TrendingUp,
  Video,
  Users,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';

export interface Widget {
  id: string;
  title: string;
  type: 'kpi' | 'chart' | 'list' | 'status';
  icon: React.ElementType;
  size: 'sm' | 'md' | 'lg';
  component: React.ReactNode;
}

interface DraggableWidgetGridProps {
  widgets: Widget[];
  onReorder?: (widgets: Widget[]) => void;
  onRemove?: (widgetId: string) => void;
  onAdd?: () => void;
  editable?: boolean;
}

function DraggableWidget({
  widget,
  onRemove,
  editable,
}: {
  widget: Widget;
  onRemove?: (id: string) => void;
  editable: boolean;
}) {
  const dragControls = useDragControls();
  const Icon = widget.icon;

  const sizeClasses = {
    sm: 'col-span-1',
    md: 'col-span-2',
    lg: 'col-span-3',
  };

  return (
    <Reorder.Item
      value={widget}
      dragListener={false}
      dragControls={dragControls}
      className={sizeClasses[widget.size]}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: editable ? 1.01 : 1 }}
        className="h-full"
      >
        <Card className="h-full relative group">
          {editable && (
            <div className="absolute top-2 right-2 left-2 flex items-center justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onPointerDown={(e) => dragControls.start(e)}
                className="p-1 rounded bg-muted/80 hover:bg-muted cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  <Icon className="w-3 h-3 mr-1" />
                  {widget.title}
                </Badge>
                {onRemove && (
                  <button
                    onClick={() => onRemove(widget.id)}
                    className="p-1 rounded bg-destructive/80 hover:bg-destructive"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className={editable ? 'pt-8' : ''}>{widget.component}</div>
        </Card>
      </motion.div>
    </Reorder.Item>
  );
}

export function DraggableWidgetGrid({
  widgets: initialWidgets,
  onReorder,
  onRemove,
  onAdd,
  editable = false,
}: DraggableWidgetGridProps) {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [isEditing, setIsEditing] = useState(editable);
  const [hasChanges, setHasChanges] = useState(false);

  const handleReorder = useCallback(
    (newOrder: Widget[]) => {
      setWidgets(newOrder);
      setHasChanges(true);
      onReorder?.(newOrder);
    },
    [onReorder]
  );

  const handleRemove = useCallback(
    (widgetId: string) => {
      setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
      setHasChanges(true);
      onRemove?.(widgetId);
    },
    [onRemove]
  );

  const handleSave = () => {
    // Save layout to localStorage or backend
    localStorage.setItem('dashboard-layout', JSON.stringify(widgets.map((w) => w.id)));
    setHasChanges(false);
    toast.success('Dashboard layout saved');
  };

  const handleReset = () => {
    setWidgets(initialWidgets);
    setHasChanges(false);
    toast.info('Dashboard layout reset');
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={isEditing ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <GripVertical className="w-4 h-4 mr-2" />
            {isEditing ? 'Done Editing' : 'Customize'}
          </Button>
          {isEditing && onAdd && (
            <Button variant="outline" size="sm" onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Widget
            </Button>
          )}
        </div>

        {isEditing && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-success hover:bg-success/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Layout
            </Button>
          </div>
        )}
      </div>

      {/* Widget Grid */}
      <Reorder.Group
        axis="y"
        values={widgets}
        onReorder={handleReorder}
        className="grid grid-cols-3 gap-4"
      >
        {widgets.map((widget) => (
          <DraggableWidget
            key={widget.id}
            widget={widget}
            onRemove={handleRemove}
            editable={isEditing}
          />
        ))}
      </Reorder.Group>

      {/* Empty state */}
      {widgets.length === 0 && (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No widgets added</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Add widgets to customize your dashboard
          </p>
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Widget
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}

// Available widget templates
export const widgetTemplates = [
  { id: 'impressions', title: 'Impressions', icon: Eye, type: 'kpi' as const, size: 'sm' as const },
  { id: 'revenue', title: 'Revenue', icon: DollarSign, type: 'kpi' as const, size: 'sm' as const },
  { id: 'trending', title: 'Trending', icon: TrendingUp, type: 'chart' as const, size: 'md' as const },
  { id: 'videos', title: 'Videos', icon: Video, type: 'status' as const, size: 'sm' as const },
  { id: 'audience', title: 'Audience', icon: Users, type: 'chart' as const, size: 'md' as const },
  { id: 'orders', title: 'Orders', icon: ShoppingCart, type: 'list' as const, size: 'lg' as const },
];
