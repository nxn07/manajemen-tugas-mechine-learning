import React from 'react';
import { 
  Search, 
  CheckSquare, 
  Users, 
  FileText, 
  AlertCircle, 
  Inbox, 
  Target,
  LucideIcon 
} from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon: LucideIcon;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

const defaultIcons: Record<string, LucideIcon> = {
  search: Search,
  tasks: CheckSquare,
  users: Users,
  documents: FileText,
  error: AlertCircle,
  inbox: Inbox,
  target: Target,
};

export function EmptyState({
  icon: IconProp,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  // Determine which icon to use
  const Icon = IconProp || Search;
  
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      {/* Icon Container - Large with Circular Background */}
      <div className="relative mb-6">
        {/* Circular faded background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full blur-2xl opacity-70" />
        
        {/* Icon wrapper */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-white to-slate-50 border border-slate-200/60 shadow-lg flex items-center justify-center z-10">
          <Icon className="w-10 h-10 md:w-14 md:h-14 text-slate-400 drop-shadow-sm" />
        </div>
      </div>

      {/* Title and Description */}
      <div className="text-center max-w-md mx-auto mb-6">
        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
          {description}
        </p>
      </div>

      {/* Optional Action Button */}
      {action && (
        <div className="flex items-center gap-3">
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 hover:from-teal-500 hover:via-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-extrabold transition-all shadow-lg hover:shadow-xl cursor-pointer active:scale-95 overflow-hidden group"
            >
              <span className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-20 pointer-events-none rounded-xl" />
              <action.icon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>{action.label}</span>
            </a>
          ) : action.onClick ? (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 hover:from-teal-500 hover:via-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-extrabold transition-all shadow-lg hover:shadow-xl cursor-pointer active:scale-95 overflow-hidden group"
            >
              <span className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-20 pointer-events-none rounded-xl" />
              <action.icon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>{action.label}</span>
            </button>
          ) : null}
        </div>
      )}

      {/* Decorative elements for visual interest */}
      <div className="mt-8 hidden md:flex items-center gap-8 text-xs text-slate-400 font-semibold uppercase tracking-wide">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span>No Data</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
}

// Pre-made empty states for common scenarios
export function EmptyStateTasks() {
  return (
    <EmptyState
      icon={CheckSquare}
      title="No Tasks Found"
      description="There are currently no tasks matching your search criteria. Try adjusting your filters or create a new task."
      action={{
        label: "Create New Task",
        icon: CheckSquare,
        onClick: () => window.location.href = '/tasks',
      }}
    />
  );
}

export function EmptyStateUsers() {
  return (
    <EmptyState
      icon={Users}
      title="No Users Found"
      description="There are no users matching your search. Add a new user to get started."
      action={{
        label: "Add User",
        icon: Users,
        onClick: () => window.location.href = '/users',
      }}
    />
  );
}

export function EmptyStateSearch() {
  return (
    <EmptyState
      icon={Search}
      title="No Results Found"
      description="Your search didn't match any results. Try different keywords or browse all available items."
    />
  );
}

export function EmptyStateInbox() {
  return (
    <EmptyState
      icon={Inbox}
      title="All Caught Up!"
      description="You have no pending notifications or messages. Everything is in order."
    />
  );
}

export function EmptyStateError() {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Something Went Wrong"
      description="We encountered an error while loading data. Please try again later or contact support if the issue persists."
      action={{
        label: "Try Again",
        icon: Target,
        onClick: () => window.location.reload(),
      }}
    />
  );
}

export default EmptyState;
