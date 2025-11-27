"use client"
import { LogOut, User, Mail, Phone, Shield, Calendar, Building2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserPayload } from "@/lib/types"
import { logout as logoutAction } from "@/app/login/action"
import { useRouter } from "next/navigation"
import { useContext, ReactNode } from "react"
import UserContext from "@/app/context/UserContext"

export function DropdownMenuForSidebarUserMoreOptions({ user, children }: { user: UserPayload, children: ReactNode }) {
  const userctx = useContext(UserContext)
  const router = useRouter()
  const handleClickLogout = async () => {
    const logoutStatus = await logoutAction()
    if (logoutStatus) {
      userctx?.setUser(null)
      router.push("/login")
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" side="top">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate" title={user?.name}>
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize truncate">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {user?.email && (
              <DropdownMenuItem className="cursor-default focus:bg-transparent">
                <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm truncate" title={user.email}>
                    {user.email}
                  </p>
                </div>
              </DropdownMenuItem>
            )}
            {user?.phone && (
              <DropdownMenuItem className="cursor-default focus:bg-transparent">
                <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm">{user.phone}</p>
                </div>
              </DropdownMenuItem>
            )}
            {user?.usn_id && (
              <DropdownMenuItem className="cursor-default focus:bg-transparent">
                <Shield className="mr-2 h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">USN ID</p>
                  <p className="text-sm">{user.usn_id}</p>
                </div>
              </DropdownMenuItem>
            )}
            {(user?.allocated_building || user?.assigned_building) && (
              <DropdownMenuItem className="cursor-default focus:bg-transparent">
                <Building2 className="mr-2 h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Building</p>
                  <p className="text-sm truncate">
                    {user.allocated_building || user.assigned_building}
                  </p>
                  {(user?.allocated_floor || user?.assigned_floor) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Floor: {user.allocated_floor || (user.assigned_floor ? JSON.parse(user.assigned_floor).join(', ') : 'N/A')}
                    </p>
                  )}
                  {user?.allocated_room && (
                    <p className="text-xs text-muted-foreground">
                      Room: {user.allocated_room}
                    </p>
                  )}
                </div>
              </DropdownMenuItem>
            )}
            {user?.created_at && (
              <DropdownMenuItem className="cursor-default focus:bg-transparent">
                <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleClickLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
