"use client"
import { LogOut, MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

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

export function DropdownMenuForSidebarUserMoreOptions({ user }: { user: UserPayload }) {
  const router = useRouter()
  const handleClickLogout = async () => {
    await logoutAction()
    router.push("/login")
  }
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Open menu" size="icon-sm">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuLabel>{user.name} <span>{user.usn_id}</span></DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleClickLogout}>
              <LogOut /> Logout
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
