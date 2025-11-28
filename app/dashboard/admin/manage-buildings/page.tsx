"use client"

import React, { useState, useEffect } from 'react'
import ManageBuildingsForm from './ManageBuildingsForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserFromTokenCookie } from '@/app/actions'
import { UserPayload, BuildingData } from '@/lib/types'
import { BuildingsTable } from './viewBuildings'
import { getBuildings } from './actions'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { getFromCache, saveToCache } from '@/lib/cache-utils'

const ManageBuildings = () => {
  const [user, setUser] = useState<UserPayload | null>(null)
  const [buildings, setBuildings] = useState<BuildingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const userData = await getUserFromTokenCookie()
      setUser(userData as UserPayload)
      await fetchBuildingsWithCache()
    }
    init()
  }, [])

  const fetchBuildingsWithCache = async (forceRefresh = false) => {
    setLoading(true)
    try {
      // Check cache first
      if (!forceRefresh) {
        const cached = getFromCache<BuildingData[]>('admin_buildings', user?.role)
        if (cached) {
          const parsedBuildings = cached.map((building: BuildingData) => ({
            ...building,
            floors: typeof building.floors === 'string' ? JSON.parse(building.floors as string) : building.floors,
          }))
          setBuildings(parsedBuildings)
          setLoading(false)
          return
        }
      }

      // Fetch fresh data
      const buildingsData: BuildingData[] = await getBuildings()
      const parsedBuildings = buildingsData.map(building => ({
        ...building,
        floors: typeof building.floors === 'string' ? JSON.parse(building.floors as string) : building.floors,
      }))
      setBuildings(parsedBuildings)
      saveToCache('admin_buildings', buildingsData)
    } catch (error) {
      toast.error("Failed to fetch buildings")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await fetchBuildingsWithCache(true)
    toast.success("Buildings refreshed")
  }

  const handleBuildingAdded = () => {
    // Refresh buildings when a new one is added
    fetchBuildingsWithCache(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-full">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Manage Buildings</h1>
          <p className="text-muted-foreground mt-2">
            Add new buildings and view existing room allocations
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      <Tabs defaultValue="view" className="w-full flex justify-center items-center">
        <TabsList className="sm:w-fit">
          <TabsTrigger value="view" className="flex-1 sm:flex-none">View Rooms</TabsTrigger>
          <TabsTrigger value="add" className="flex-1 sm:flex-none">Add Buildings</TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          <BuildingsTable data={buildings} />
        </TabsContent>
        <TabsContent value="add">
          {user && <ManageBuildingsForm user={user} onBuildingAdded={handleBuildingAdded} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ManageBuildings