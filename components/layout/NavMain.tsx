"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { NavMainItem } from "@/types/types";
import Link from "next/link";

export function NavMain({ items }: { items: NavMainItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm font-bold tracking-wider text-primary/80 mb-2">
        Gestión
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            pathname === item.url || pathname.startsWith(item.url);
          const hasActiveChild = item.items?.some(
            (subItem) => pathname === subItem.url
          );

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive || hasActiveChild}
              className="group/collapsible mb-1"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:bg-muted/80",
                      isActive && "bg-muted font-medium text-primary"
                    )}
                  >
                    <Link href={item.url} className="flex items-center">
                      {item.icon && (
                        <div
                          className={cn(
                            "h-5 w-5 mr-2 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          <item.icon className="h-full w-full" />
                        </div>
                      )}
                      <span>{item.title}</span>
                    </Link>
                    <ChevronRight
                      className={cn(
                        "ml-auto h-4 w-4 transition-transform duration-300 text-muted-foreground",
                        "group-data-[state=open]/collapsible:rotate-90",
                        isActive && "text-primary"
                      )}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SidebarMenuSub className="pl-4 border-l-[1px] border-border/40 ml-4 mt-1">
                      {item.items?.map((subItem) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={cn(
                                "transition-all duration-150 hover:text-primary",
                                isSubActive &&
                                  "font-medium text-primary bg-muted/50"
                              )}
                            >
                              <Link
                                href={subItem.url}
                                className="py-1.5 px-2 rounded"
                              >
                                <span>{subItem.title}</span>
                                {isSubActive && (
                                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </motion.div>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
